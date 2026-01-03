import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config";

import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusChip } from "@/components/ui/status-chip";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { Progress } from "@/components/ui/progress";
import { Search, FileSearch, Clock, AlertCircle, Plus, Award, ExternalLink } from "lucide-react";
import { useVerificationStore } from "@/stores/useVerificationStore";
import { useAuth } from "@/context/AuthContext";

export default function EmployerDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { requests, fetchRequests } = useVerificationStore();
  const [employerInfo, setEmployerInfo] = useState<{
    companyName: string;
    verified: boolean;
    requestsUsed: number;
    requestsLimit: number;
  } | null>(null);

  useEffect(() => {
    // Fetch requests for this employer
    fetchRequests();

    // Fetch employer dashboard info from backend
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/employer/dashboard`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setEmployerInfo({
            companyName: data.companyName || currentUser?.companyName || "Your Company",
            verified: data.isVerified || false,
            requestsUsed: data.requestsUsed || 0,
            requestsLimit: data.requestsLimit || 3,
          });
        } else {
          // Fallback to current user info
          setEmployerInfo({
            companyName: currentUser?.companyName || "Your Company",
            verified: false,
            requestsUsed: requests.length,
            requestsLimit: 3,
          });
        }
      } catch (error) {
        // Fallback
        setEmployerInfo({
          companyName: currentUser?.companyName || "Your Company",
          verified: false,
          requestsUsed: requests.length,
          requestsLimit: 3,
        });
      }
    };
    fetchDashboard();
  }, [fetchRequests, currentUser?.companyName, requests.length]);

  // Use approved requests as "Shared Credentials"
  const approvedRequests = requests.filter(r => r.status === 'approved');

  const filteredCredentials = approvedRequests.filter(
    (req) =>
      req.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.studentEnrlNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!employerInfo) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Verification Status Banner */}
          {!employerInfo.verified && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-warning">
                  You are a Non-verified Employer — limited access until verified
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your verification is pending. You can still submit requests (limit {employerInfo.requestsLimit}/week).
                </p>
              </div>
            </div>
          )}

          {employerInfo.verified && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-4 flex items-start gap-3">
              <Award className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-success">
                  ✅ Congratulations! Your organisation is now a Verified Employer
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  You have full access to all features including unlimited verification requests.
                </p>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold">{employerInfo.companyName}</h1>
                  <VerificationBadge verified={employerInfo.verified} />
                </div>
                <p className="text-muted-foreground">
                  View and manage shared credentials from verified students
                </p>
              </div>
            </div>
            <Button onClick={() => navigate("/request")} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Request New Verification
            </Button>
          </div>

          {/* Quota Widget for Non-verified */}
          {!employerInfo.verified && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Request Quota</CardTitle>
                <CardDescription>
                  Upgrade to Verified Employer for higher limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Requests used this week</span>
                    <span className="font-semibold">
                      {employerInfo.requestsUsed} / {employerInfo.requestsLimit}
                    </span>
                  </div>
                  <Progress
                    value={(employerInfo.requestsUsed / employerInfo.requestsLimit) * 100}
                    className="h-2"
                  />
                  {employerInfo.requestsUsed >= employerInfo.requestsLimit && (
                    <p className="text-sm text-warning">
                      You've reached your weekly limit. Contact support for verification.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student name, degree, or university..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Credentials Table */}
          <Card>
            <CardHeader>
              <CardTitle>Shared Credentials</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredCredentials.length > 0 ? (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Enrollment No</TableHead>
                        <TableHead>University</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCredentials.map((credential) => (
                        <TableRow
                          key={credential._id || credential.id}
                          className="cursor-pointer hover:bg-accent/50"
                          onClick={() =>
                            navigate(`/verify?enrollment=${credential.studentEnrlNo}`)
                          }
                        >
                          <TableCell className="font-medium">
                            {credential.studentName}
                          </TableCell>
                          <TableCell>{credential.studentEnrlNo}</TableCell>
                          <TableCell>Barkatullah University</TableCell>
                          <TableCell>
                            <StatusChip status={credential.status === 'approved' ? 'valid' : 'pending'} />
                          </TableCell>
                          <TableCell>{credential.timestamp ? new Date(credential.timestamp).toLocaleDateString() : 'Recently'}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/verify?enrollment=${credential.studentEnrlNo}`);
                              }}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-muted/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileSearch className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No credentials found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Try adjusting your search criteria"
                      : "No credentials shared yet"}
                  </p>
                  {!searchQuery && (
                    <>
                      <p className="text-sm text-muted-foreground mb-6">
                        Pending approval from students will appear here once granted
                      </p>
                      <Button
                        onClick={() => navigate("/request")}
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Request Credential Verification
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
