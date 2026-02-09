/**
 * Initialize Backboard Assistant for CitizenScheme Chatbot
 * 
 * This script:
 * 1. Creates a Backboard assistant with custom configuration
 * 2. Loads all government schemes into the assistant's memory
 * 3. Outputs the assistant ID to be added to .env.local
 * 
 * Run: npx tsx scripts/init-backboard.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables from .env.local
function loadEnv() {
  try {
    const envPath = join(process.cwd(), ".env.local");
    const envFile = readFileSync(envPath, "utf-8");
    
    envFile.split("\n").forEach((line) => {
      line = line.trim();
      if (!line || line.startsWith("#")) return;
      
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim();
        process.env[key.trim()] = value;
      }
    });
  } catch (error) {
    console.error("Failed to load .env.local:", error);
  }
}

loadEnv();

const BACKBOARD_BASE_URL = "https://app.backboard.io/api";
const BACKBOARD_API_KEY = process.env.BACKBOARD_API_KEY!;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface BackboardAssistant {
  assistant_id: string;
  name: string;
  description: string;
  system_prompt: string;
  created_at: string;
}

interface Scheme {
  id: string;
  slug: string;
  scheme_name: string;
  scheme_code?: string;
  description: string;
  benefits: string;
  department?: string;
  state?: string;
  category: string;
  eligibility_rules: Record<string, unknown>;
  application_process: string;
  official_website?: string;
  is_active: boolean;
}

async function createAssistant(): Promise<BackboardAssistant> {
  console.log("🤖 Creating Backboard assistant...");

  const systemPrompt = `You are CitizenScheme AI Assistant, an expert on Indian government welfare schemes and benefits.

Your role is to help Indian citizens discover and understand government schemes they're eligible for.

Key responsibilities:
1. Answer questions about specific government schemes
2. Help users understand eligibility criteria
3. Guide users through application processes
4. Provide information about required documents
5. Recommend schemes based on user profile and circumstances

Guidelines:
- Be conversational, helpful, and empathetic
- Use simple language; avoid government jargon
- Always provide accurate, up-to-date information from your memory
- If asked about a scheme not in your memory, politely say it's not in your current database
- Encourage users to verify details on official government websites
- For application guidance, refer users to official application links

Context:
- You have access to detailed information about hundreds of Indian government schemes
- You can search this information when users ask questions
- You maintain context about the user's profile (age, income, state, etc.) when provided`;

  const response = await fetch(`${BACKBOARD_BASE_URL}/assistants`, {
    method: "POST",
    headers: {
      "X-API-Key": BACKBOARD_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "CitizenScheme AI Assistant",
      description: "AI assistant for Indian government schemes and citizen benefits",
      system_prompt: systemPrompt,
      tok_k: 10,
      embedding_provider: "openai",
      embedding_model_name: "text-embedding-3-large",
      embedding_dims: 3072,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create assistant: ${response.status} ${error}`);
  }

  const assistant: BackboardAssistant = await response.json();
  console.log(`✅ Created assistant: ${assistant.assistant_id}`);
  return assistant;
}

async function loadSchemes(assistantId: string): Promise<void> {
  console.log("📚 Loading schemes from database...");

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data: schemes, error } = await supabase
    .from("schemes")
    .select("*")
    .eq("is_active", true)
    .order("scheme_name");

  if (error || !schemes) {
    throw new Error(`Failed to fetch schemes: ${error?.message}`);
  }

  console.log(`📊 Found ${schemes.length} schemes`);
  console.log("💾 Adding schemes to assistant memory...");

  let successCount = 0;
  let errorCount = 0;

  for (const scheme of schemes as Scheme[]) {
    try {
      const memoryContent = formatSchemeForMemory(scheme);

      const response = await fetch(
        `${BACKBOARD_BASE_URL}/assistants/${assistantId}/memories`,
        {
          method: "POST",
          headers: {
            "X-API-Key": BACKBOARD_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: memoryContent,
            metadata: {
              type: "scheme",
              scheme_id: scheme.id,
              scheme_slug: scheme.slug,
              scheme_name: scheme.scheme_name,
              category: scheme.category,
              state: scheme.state || "All India",
              department: scheme.department || "Unknown",
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      successCount++;
      if (successCount % 10 === 0) {
        console.log(`  ✓ Added ${successCount}/${schemes.length} schemes...`);
      }

      // Rate limiting: wait 100ms between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      errorCount++;
      console.error(`  ✗ Failed to add ${scheme.scheme_name}: ${error}`);
    }
  }

  console.log(
    `\n✅ Memory loading complete: ${successCount} succeeded, ${errorCount} failed`
  );
}

function formatSchemeForMemory(scheme: Scheme): string {
  const parts: string[] = [];

  // Basic info
  parts.push(`Scheme Name: ${scheme.scheme_name}`);
  parts.push(`Category: ${scheme.category}`);
  if (scheme.scheme_code) parts.push(`Scheme Code: ${scheme.scheme_code}`);
  if (scheme.state) parts.push(`State: ${scheme.state}`);
  if (scheme.department) parts.push(`Department: ${scheme.department}`);

  // Description and benefits
  if (scheme.description) {
    parts.push(`\nDescription: ${scheme.description}`);
  }
  if (scheme.benefits) {
    parts.push(`\nBenefits: ${scheme.benefits}`);
  }

  // Eligibility
  if (scheme.eligibility_rules && Object.keys(scheme.eligibility_rules).length > 0) {
    parts.push(`\nEligibility Criteria:`);
    const rules = scheme.eligibility_rules;

    if (rules.age_min || rules.age_max) {
      const ageMin = rules.age_min || 0;
      const ageMax = rules.age_max || "No limit";
      parts.push(`- Age: ${ageMin} to ${ageMax} years`);
    }

    if (rules.gender && rules.gender !== "All") {
      parts.push(`- Gender: ${rules.gender}`);
    }

    if (rules.income_max) {
      parts.push(`- Maximum Annual Income: ₹${rules.income_max}`);
    }

    if (Array.isArray(rules.categories) && rules.categories.length > 0) {
      parts.push(`- Categories: ${rules.categories.join(", ")}`);
    }

    if (Array.isArray(rules.states) && rules.states.length > 0) {
      parts.push(`- Applicable States: ${rules.states.join(", ")}`);
    }

    if (Array.isArray(rules.documents_required) && rules.documents_required.length > 0) {
      parts.push(`\nRequired Documents:`);
      rules.documents_required.forEach((doc: string) => {
        parts.push(`- ${doc}`);
      });
    }
  }

  // How to apply
  if (scheme.application_process) {
    parts.push(`\nHow to Apply: ${scheme.application_process}`);
  }

  if (scheme.official_website) {
    parts.push(`Official Website: ${scheme.official_website}`);
  }

  return parts.join("\n");
}

async function main() {
  try {
    console.log("🚀 Starting Backboard initialization...\n");

    // Validate environment variables
    if (!BACKBOARD_API_KEY) {
      throw new Error("BACKBOARD_API_KEY is not set in environment");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error("Supabase environment variables are not set");
    }

    // Create assistant
    const assistant = await createAssistant();

    // Load schemes into memory
    await loadSchemes(assistant.assistant_id);

    console.log("\n" + "=".repeat(60));
    console.log("🎉 Backboard initialization complete!");
    console.log("=".repeat(60));
    console.log("\nAdd this to your .env.local file:");
    console.log(
      `\nBACKBOARD_ASSISTANT_ID=${assistant.assistant_id}\n`
    );
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ Initialization failed:", error);
    process.exit(1);
  }
}

main();
