import { readFileSync } from "fs";
import { join } from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.local");
  console.error("Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

async function applyMigration() {
  try {
    const migrationPath = join(process.cwd(), "supabase/migrations/006_fix_rls_recursion.sql");
    const sql = readFileSync(migrationPath, "utf-8");

    console.log("📄 Applying migration: 006_fix_rls_recursion.sql\n");

    // Use Supabase's REST API to execute raw SQL
    console.log("⚠️  Please apply this migration manually in Supabase Dashboard > SQL Editor:\n");
    console.log("=" .repeat(60));
    console.log(sql);
    console.log("=" .repeat(60));
  } catch (error) {
    console.error("❌ Migration failed:", error);
    console.log("\n📋 Manual migration required:");
    console.log("1. Go to Supabase Dashboard > SQL Editor");
    console.log("2. Copy contents from: supabase/migrations/006_fix_rls_recursion.sql");
    console.log("3. Run the SQL");
    process.exit(1);
  }
}

applyMigration();
