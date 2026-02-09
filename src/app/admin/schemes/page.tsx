"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Search, Trash2, Pencil, Globe, MapPin } from "lucide-react";
import { toast } from "sonner";
import type { Scheme } from "@/lib/types";

export default function AdminSchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function fetchSchemes() {
    try {
      const res = await fetch("/api/admin/schemes");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSchemes(json.schemes || []);
    } catch {
      toast.error("Failed to load schemes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/admin/schemes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      toast.success("Scheme deactivated");
      fetchSchemes();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Delete failed";
      toast.error(message);
    }
  };

  const filtered = schemes.filter(
    (s) =>
      s.scheme_name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold">Schemes ({schemes.length})</h1>
        <Link href="/admin/schemes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Scheme
          </Button>
        </Link>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, category, or department..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No schemes found.
            </CardContent>
          </Card>
        ) : (
          filtered.map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      {s.scheme_name}
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                      {s.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/schemes/new?edit=${s.id}`}>
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deactivate Scheme?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will deactivate &quot;{s.scheme_name}&quot;. It
                            won&apos;t appear in recommendations anymore.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(s.id)}>
                            Deactivate
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{s.category}</Badge>
                  <Badge variant="secondary">{s.department}</Badge>
                  {s.state ? (
                    <Badge variant="outline">
                      <MapPin className="mr-1 h-3 w-3" />
                      {s.state}
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <Globe className="mr-1 h-3 w-3" />
                      National
                    </Badge>
                  )}
                  {!s.is_active && <Badge variant="destructive">Inactive</Badge>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
