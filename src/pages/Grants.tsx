import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusChip } from "@/components/ui/status-chip";
import { FieldChip } from "@/components/ui/field-chip";
import { NewGrantDialog } from "@/components/grants/NewGrantDialog";
import { Search, Plus, Trash2, Eye, Filter } from "lucide-react";

export default function Grants() {
  const [isNewGrantOpen, setIsNewGrantOpen] = useState(false);
  // Mock data - in real app, this would be fetched from backend
  const grants = [
    {
      id: "1",
      employerName: "ABC Technologies",
      employerLogo: "🏢",
      sharedFields: ["Name", "Degree", "University", "Year"],
      status: "active" as const,
      grantedOn: "Oct 8, 2025",
    },
    {
      id: "2",
      employerName: "XYZ HR Solutions",
      employerLogo: "🏛️",
      sharedFields: ["Name", "Degree"],
      status: "active" as const,
      grantedOn: "Oct 12, 2025",
    },
  ];

  const EmptyState = () => (
    <Card className="p-12 text-center">
      <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Plus className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Active Grants Yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        You haven't shared your credentials with anyone yet.
        Grants appear here once you approve an employer request.
      </p>
      <Button onClick={() => setIsNewGrantOpen(true)}>
        <Plus className="w-4 h-4" />
        Create New Grant
      </Button>
    </Card>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-12 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              My Sharing Permissions
            </h1>
            <p className="text-muted-foreground">
              Manage employers who can verify your credentials
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by employer name..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4" />
              Filter by Status
            </Button>
            <Button onClick={() => setIsNewGrantOpen(true)}>
              <Plus className="w-4 h-4" />
              New Grant
            </Button>
          </div>

          {/* Grants List */}
          {grants.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {grants.map((grant) => (
                <Card key={grant.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Employer Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-4xl">{grant.employerLogo}</div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          {grant.employerName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Granted on {grant.grantedOn}
                        </p>
                      </div>
                    </div>

                    {/* Shared Fields */}
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-2">Shared Fields:</p>
                      <div className="flex flex-wrap gap-2">
                        {grant.sharedFields.map((field) => (
                          <FieldChip key={field} label={field} />
                        ))}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col gap-2 md:items-end">
                      <StatusChip status={grant.status} />
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                          Details
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4" />
                          Revoke
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Stats Card */}
          {grants.length > 0 && (
            <Card className="p-6 mt-8 bg-gradient-card">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary">{grants.length}</p>
                  <p className="text-sm text-muted-foreground">Active Grants</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-success">0</p>
                  <p className="text-sm text-muted-foreground">Expired Grants</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-warning">0</p>
                  <p className="text-sm text-muted-foreground">Revoked Grants</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>

      <Footer />
      
      <NewGrantDialog open={isNewGrantOpen} onOpenChange={setIsNewGrantOpen} />
    </div>
  );
}
