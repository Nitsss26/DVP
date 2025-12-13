import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { FieldChip } from "@/components/ui/field-chip";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Building2,
  Calendar,
  Award,
  ShieldCheck,
} from "lucide-react";

export default function EmployerVerificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data
  const credentialData = {
    status: "valid" as const,
    studentName: "Rajesh Kumar",
    degree: "B.E. Computer Science",
    university: "Govt Eng. College, Bhopal",
    rollNumber: "CS/2021/045",
    yearOfGraduation: "2025",
    issuedOn: "Sep 10, 2025",
    verifiedOn: "Oct 8, 2025",
    transactionHash: "0x1a2b3c4d5e6f7g8h9i0j",
    sharedFields: ["name", "degree", "university", "year"],
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/employer/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Status Card */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      Credential Verification
                    </h1>
                    <p className="text-muted-foreground">ID: {id}</p>
                  </div>
                </div>
                <StatusChip status={credentialData.status} />
              </div>
            </CardContent>
          </Card>

          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-semibold text-foreground">
                    {credentialData.studentName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Roll Number</p>
                  <p className="font-semibold text-foreground">
                    {credentialData.rollNumber}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Academic Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Degree</p>
                  <p className="font-semibold text-foreground">
                    {credentialData.degree}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Year of Graduation
                  </p>
                  <p className="font-semibold text-foreground">
                    {credentialData.yearOfGraduation}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Issuer (University)
                </p>
                <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-lg">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">
                    {credentialData.university}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shared Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Shared Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                The student has shared the following fields with you:
              </p>
              <div className="flex flex-wrap gap-2">
                {credentialData.sharedFields.map((field) => (
                  <FieldChip key={field} label={field.charAt(0).toUpperCase() + field.slice(1)} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Verification */}
          <Card className="bg-gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Blockchain Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Issued On</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-primary" />
                    <p className="font-semibold text-foreground">
                      {credentialData.issuedOn}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verified On</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-primary" />
                    <p className="font-semibold text-foreground">
                      {credentialData.verifiedOn}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Transaction Hash
                </p>
                <div className="bg-background p-3 rounded-lg border border-border font-mono text-sm break-all">
                  {credentialData.transactionHash}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer Note */}
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Verification powered by EDUChain
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
