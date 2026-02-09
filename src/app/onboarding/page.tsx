"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import FaceCapture from "@/components/verification/FaceCapture";
import { toast } from "sonner";
import {
  FileUp,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Shield,
  User,
  Camera,
  Tags,
} from "lucide-react";

const STEPS = [
  { title: "Upload ID", icon: FileUp },
  { title: "Review Details", icon: User },
  { title: "Additional Info", icon: Shield },
  { title: "Face Verification", icon: Camera },
  { title: "Interests", icon: Tags },
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
  "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep",
];

const CASTE_CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"];
const OCCUPATIONS = ["Student", "Farmer", "Self-Employed", "Salaried", "Business", "Unemployed", "Homemaker", "Retired"];

const INTEREST_TAGS = [
  "Agriculture", "Healthcare", "Housing", "Energy", "Education",
  "Finance", "Social Welfare", "Women & Child", "Disability",
  "Employment", "Skill Development", "Rural Development",
  "Sanitation", "Food Security", "Insurance", "Pension",
];

interface OcrData {
  full_name: string | null;
  document_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: {
    line1: string | null;
    line2: string | null;
    city: string | null;
    district: string | null;
    state: string | null;
    pincode: string | null;
  } | null;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 1: Document upload
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("aadhaar");

  // Step 2: OCR data review
  const [ocrData, setOcrData] = useState<OcrData | null>(null);
  const [editedData, setEditedData] = useState({
    full_name: "",
    date_of_birth: "",
    gender: "",
    state: "",
  });

  // Step 3: Additional profile info
  const [profileData, setProfileData] = useState({
    phone: "",
    annual_income: "",
    caste_category: "",
    occupation: "",
    disability_status: "none",
  });

  // Step 5: Interest tags
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Step 1: Upload and OCR
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a document to upload.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", docType);

      const res = await fetch("/api/ocr", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "OCR failed");

      setOcrData(json.data);
      setEditedData({
        full_name: json.data.full_name || "",
        date_of_birth: json.data.date_of_birth || "",
        gender: json.data.gender || "",
        state: json.data.address?.state || "",
      });
      setStep(1);
      toast.success("Document scanned successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to process document";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2 → Step 3
  const handleReviewConfirm = () => {
    if (!editedData.full_name || !editedData.date_of_birth || !editedData.gender) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setStep(2);
  };

  // Step 3 → Step 4
  const handleAdditionalInfo = () => {
    setStep(3);
  };

  // Step 4: Face capture → Step 5
  const handleFaceComplete = useCallback(
    async (images: Record<"front" | "left" | "right", string>) => {
      setLoading(true);
      try {
        // Upload face images (also sets front face as avatar_url)
        const faceRes = await fetch("/api/upload/faces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(images),
        });
        if (!faceRes.ok) {
          const fj = await faceRes.json();
          throw new Error(fj.error || "Face upload failed");
        }

        toast.success("Face verified! Your front photo is now your profile picture.");
        setStep(4); // Go to interest tags step
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Step 5: Interest tags + complete profile
  const handleComplete = async () => {
    setLoading(true);
    try {
      const profileRes = await fetch("/api/profile/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: editedData.full_name,
          date_of_birth: editedData.date_of_birth,
          gender: editedData.gender,
          state: editedData.state,
          phone: profileData.phone || null,
          annual_income: profileData.annual_income
            ? Number(profileData.annual_income)
            : null,
          caste_category: profileData.caste_category || null,
          occupation: profileData.occupation || null,
          disability_status:
            profileData.disability_status === "none"
              ? null
              : profileData.disability_status,
          interested_tags: selectedTags,
        }),
      });
      if (!profileRes.ok) {
        const pj = await profileRes.json();
        throw new Error(pj.error || "Profile completion failed");
      }

      toast.success("Onboarding complete! Redirecting...");
      router.push("/home");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-(--neo-bg)">
      {/* Header */}
      <header className="neo-flat">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold">Onboarding</span>
          </div>
          <Badge variant="secondary">
            Step {step + 1} of {STEPS.length}
          </Badge>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Progress + Step Indicators */}
        <div className="mb-8">
          <Progress value={progress} className="mb-4" />
          <div className="flex justify-between">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className={`flex items-center gap-1.5 text-xs ${
                  i <= step
                    ? "font-medium text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {i < step ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <s.icon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{s.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === 0 && (
          <Card className="neo-card">
            <CardHeader>
              <CardTitle>Upload Your ID Document</CardTitle>
              <CardDescription>
                We&apos;ll use AI to extract your details automatically.
                Supported: Aadhaar, Voter ID, or other government IDs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger className="neo-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                    <SelectItem value="voter_id">Voter ID</SelectItem>
                    <SelectItem value="other">Other Government ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Upload Document</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="neo-input"
                  />
                </div>
                {file && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {file.name} ({(file.size / 1024).toFixed(0)} KB)
                  </p>
                )}
              </div>

              <Button
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-full neo-btn"
                size="lg"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileUp className="mr-2 h-4 w-4" />
                )}
                {loading ? "Scanning Document..." : "Scan & Extract"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Review OCR Data */}
        {step === 1 && (
          <Card className="neo-card">
            <CardHeader>
              <CardTitle>Review Extracted Details</CardTitle>
              <CardDescription>
                Please verify and correct the information extracted from your document.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ocrData?.document_number && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm text-muted-foreground">
                    Document Number:{" "}
                    <span className="font-mono font-medium text-foreground">
                      {ocrData.document_number}
                    </span>
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  className="neo-input"
                  value={editedData.full_name}
                  onChange={(e) =>
                    setEditedData({ ...editedData, full_name: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Input
                    className="neo-input"
                    value={editedData.date_of_birth}
                    onChange={(e) =>
                      setEditedData({ ...editedData, date_of_birth: e.target.value })
                    }
                    placeholder="DD/MM/YYYY"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <Select
                    value={editedData.gender}
                    onValueChange={(v) => setEditedData({ ...editedData, gender: v })}
                  >
                    <SelectTrigger className="neo-input">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>State</Label>
                <Select
                  value={editedData.state}
                  onValueChange={(v) => setEditedData({ ...editedData, state: v })}
                >
                  <SelectTrigger className="neo-input">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleReviewConfirm} className="flex-1 neo-btn">
                  Confirm & Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Additional Profile */}
        {step === 2 && (
          <Card className="neo-card">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                This helps us find more schemes you might be eligible for. All fields are optional.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  className="neo-input"
                  placeholder="10-digit mobile number"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Annual Income (INR)</Label>
                  <Input
                    type="number"
                    className="neo-input"
                    placeholder="e.g. 200000"
                    value={profileData.annual_income}
                    onChange={(e) => setProfileData({ ...profileData, annual_income: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Caste Category</Label>
                  <Select
                    value={profileData.caste_category}
                    onValueChange={(v) => setProfileData({ ...profileData, caste_category: v })}
                  >
                    <SelectTrigger className="neo-input">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {CASTE_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Occupation</Label>
                  <Select
                    value={profileData.occupation}
                    onValueChange={(v) => setProfileData({ ...profileData, occupation: v })}
                  >
                    <SelectTrigger className="neo-input">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {OCCUPATIONS.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Disability Status</Label>
                  <Select
                    value={profileData.disability_status}
                    onValueChange={(v) => setProfileData({ ...profileData, disability_status: v })}
                  >
                    <SelectTrigger className="neo-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Disability</SelectItem>
                      <SelectItem value="physical">Physical</SelectItem>
                      <SelectItem value="visual">Visual</SelectItem>
                      <SelectItem value="hearing">Hearing</SelectItem>
                      <SelectItem value="intellectual">Intellectual</SelectItem>
                      <SelectItem value="multiple">Multiple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleAdditionalInfo} className="flex-1 neo-btn">
                  Continue to Face Verification
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Face Capture */}
        {step === 3 && (
          <div className="space-y-4">
            {loading && (
              <div className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 p-4 text-primary">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-medium">Uploading face images...</span>
              </div>
            )}
            <FaceCapture onComplete={handleFaceComplete} />
            <Button variant="outline" onClick={() => setStep(2)} disabled={loading}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        )}

        {/* Step 5: Interest Tags */}
        {step === 4 && (
          <Card className="neo-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tags className="h-5 w-5" />
                Select Your Interests
              </CardTitle>
              <CardDescription>
                Choose the categories of government schemes you&apos;re most interested in.
                This helps us prioritize relevant recommendations for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {INTEREST_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "neo-flat hover:bg-muted/80"
                      }`}
                    >
                      {tag}
                      {isSelected && (
                        <CheckCircle2 className="ml-1 inline h-3.5 w-3.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedTags.length > 0 && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm text-muted-foreground mb-2">
                    Selected ({selectedTags.length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-1 neo-btn"
                  size="lg"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  {loading ? "Completing..." : "Complete Onboarding"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
