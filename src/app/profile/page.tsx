"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Briefcase,
  IndianRupee,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { UserProfile } from "../../../types/user";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) setProfile(data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!profile) return null;

  const initials = profile.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">My Profile</h1>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2 text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Header Card */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary">
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{profile.full_name || "User"}</h2>
                <p className="text-muted-foreground mb-4">{profile.email}</p>
                <div className="flex gap-3 flex-wrap">
                  <Badge
                    variant={profile.id_verified ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    {profile.id_verified ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    ID {profile.id_verified ? "Verified" : "Not Verified"}
                  </Badge>
                  <Badge
                    variant={profile.face_verified ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    {profile.face_verified ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    Face {profile.face_verified ? "Verified" : "Not Verified"}
                  </Badge>
                  <Badge
                    variant={profile.onboarding_completed ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    {profile.onboarding_completed ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    Onboarding {profile.onboarding_completed ? "Complete" : "Pending"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={profile.email}
              />
              <InfoItem
                icon={<Phone className="h-4 w-4" />}
                label="Phone"
                value={profile.phone || "Not provided"}
              />
              <InfoItem
                icon={<Calendar className="h-4 w-4" />}
                label="Date of Birth"
                value={
                  profile.date_of_birth
                    ? new Date(profile.date_of_birth).toLocaleDateString("en-IN")
                    : "Not provided"
                }
              />
              <InfoItem
                icon={<User className="h-4 w-4" />}
                label="Gender"
                value={profile.gender || "Not provided"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem
                label="State"
                value={profile.state || "Not provided"}
              />
              <InfoItem
                label="District"
                value={profile.address?.district || "Not provided"}
              />
              <div className="md:col-span-2">
                <InfoItem
                  label="Address Line"
                  value={profile.address?.line1 || "Not provided"}
                />
              </div>
              <InfoItem
                label="Pincode"
                value={profile.address?.pincode || "Not provided"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Additional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem
                icon={<Briefcase className="h-4 w-4" />}
                label="Occupation"
                value={profile.occupation || "Not provided"}
              />
              <InfoItem
                icon={<IndianRupee className="h-4 w-4" />}
                label="Annual Income"
                value={
                  profile.annual_income
                    ? `₹${profile.annual_income.toLocaleString("en-IN")}`
                    : "Not provided"
                }
              />
              <InfoItem
                label="Caste Category"
                value={profile.caste_category || "Not provided"}
              />
              <InfoItem
                label="Disability Status"
                value={profile.disability_status || "None"}
              />
            </div>
          </CardContent>
        </Card>

        {/* ID Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Identity Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem
                label="Aadhaar Number"
                value={
                  profile.aadhaar_number
                    ? `XXXX XXXX ${profile.aadhaar_number.slice(-4)}`
                    : "Not provided"
                }
              />
              <InfoItem
                label="Voter ID"
                value={profile.voter_id || "Not provided"}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="font-medium capitalize">{value}</p>
    </div>
  );
}
