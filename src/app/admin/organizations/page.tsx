"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, CheckCircle2, XCircle, Clock, Building2 } from "lucide-react";
import { toast } from "sonner";

interface Organization {
  id: string;
  owner_id: string;
  name: string;
  work_email: string;
  description: string | null;
  website: string | null;
  state: string | null;
  district: string | null;
  verified: boolean;
  created_at: string;
}

interface OrgSchemeRequest {
  id: string;
  org_id: string;
  scheme_data: Record<string, unknown>;
  status: string;
  admin_notes: string | null;
  created_at: string;
  organizations?: Organization;
}

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [requests, setRequests] = useState<OrgSchemeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"orgs" | "requests">("orgs");

  async function fetchData() {
    try {
      const res = await fetch("/api/admin/organizations");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setOrgs(json.organizations || []);
      setRequests(json.requests || []);
    } catch {
      toast.error("Failed to load organizations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleVerify(orgId: string, verified: boolean) {
    try {
      const res = await fetch("/api/admin/organizations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orgId, verified }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(verified ? "Organization verified" : "Verification removed");
      fetchData();
    } catch {
      toast.error("Action failed");
    }
  }

  async function handleRequestAction(requestId: string, status: string, admin_notes?: string) {
    try {
      const res = await fetch("/api/admin/organizations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status, admin_notes }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Request ${status}`);
      fetchData();
    } catch {
      toast.error("Action failed");
    }
  }

  const filteredOrgs = orgs.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.work_email.toLowerCase().includes(search.toLowerCase()) ||
      (o.state || "").toLowerCase().includes(search.toLowerCase())
  );

  const pendingRequests = requests.filter((r) => r.status === "pending");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <div className="flex gap-2">
          <Button
            variant={tab === "orgs" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("orgs")}
          >
            <Building2 className="mr-1 h-4 w-4" />
            Orgs ({orgs.length})
          </Button>
          <Button
            variant={tab === "requests" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("requests")}
          >
            <Clock className="mr-1 h-4 w-4" />
            Requests ({pendingRequests.length})
          </Button>
        </div>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search organizations..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {tab === "orgs" ? (
        <div className="grid gap-3">
          {filteredOrgs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No organizations found.
              </CardContent>
            </Card>
          ) : (
            filteredOrgs.map((org) => (
              <Card key={org.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{org.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{org.work_email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {org.verified ? (
                        <Badge variant="success">Verified</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {org.state && <Badge variant="outline">{org.state}</Badge>}
                    {org.district && <Badge variant="outline">{org.district}</Badge>}
                    {org.website && (
                      <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                        {org.website}
                      </a>
                    )}
                  </div>
                  {org.description && (
                    <p className="text-sm text-muted-foreground mb-3">{org.description}</p>
                  )}
                  <div className="flex gap-2">
                    {!org.verified ? (
                      <Button size="sm" onClick={() => handleVerify(org.id, true)}>
                        <CheckCircle2 className="mr-1 h-4 w-4" /> Verify
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleVerify(org.id, false)}>
                        <XCircle className="mr-1 h-4 w-4" /> Unverify
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No scheme requests.
              </CardContent>
            </Card>
          ) : (
            requests.map((req) => {
              const sd = req.scheme_data as Record<string, string>;
              return (
                <Card key={req.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{sd.scheme_name || "Untitled"}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Category: {sd.category || "—"} • Dept: {sd.department || "—"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          req.status === "approved"
                            ? "success"
                            : req.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {req.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {sd.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {sd.description}
                      </p>
                    )}
                    {req.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleRequestAction(req.id, "approved")}>
                          <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRequestAction(req.id, "rejected")}>
                          <XCircle className="mr-1 h-4 w-4" /> Reject
                        </Button>
                      </div>
                    )}
                    {req.admin_notes && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Admin notes: {req.admin_notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
