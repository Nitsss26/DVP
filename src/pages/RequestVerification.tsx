import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useVerificationStore } from "@/stores/useVerificationStore";
import { useAuth } from "@/context/AuthContext";

export default function RequestVerification() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { requestAccess } = useVerificationStore();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    employerName: "",
    employerEmail: "",
    purpose: "",
    credentialId: "",
    requestedFields: [] as string[],
  });

  // Pre-fill form from URL parameters or Auth Context
  useEffect(() => {
    const credentialId = searchParams.get('credentialId');

    setFormData(prev => ({
      ...prev,
      credentialId: credentialId || prev.credentialId,
      employerName: currentUser?.companyName || currentUser?.name || prev.employerName,
      employerEmail: currentUser?.email || prev.employerEmail
    }));
  }, [searchParams, currentUser]);

  const handleFieldToggle = (fieldId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      requestedFields: checked
        ? [...prev.requestedFields, fieldId]
        : prev.requestedFields.filter(id => id !== fieldId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.employerName || !formData.employerEmail || !formData.purpose || !formData.credentialId) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Map UI field IDs to readable names if needed, or keep them as is. 
    // The previous implementation used readable names like "Contact Information".
    // Let's map them for consistency with the badges in StudentGrants.
    const fieldMapping: Record<string, string> = {
      email: "Contact Information",
      subjects: "Detailed Subject Scores",
      division: "Academic Summary & Division"
    };

    const mappedFields = formData.requestedFields.map(f => fieldMapping[f] || f);

    // Create Request via Store
    requestAccess({
      employerId: currentUser?.uid || `emp_${Date.now()}`,
      employerName: formData.employerName,
      employerEmail: formData.employerEmail,
      purpose: formData.purpose,
      studentEnrlNo: formData.credentialId,
      studentName: searchParams.get('studentName') || "Candidate", // Best effort name
      requestedFields: mappedFields.length > 0 ? mappedFields : ["Basic Verification"],
    });

    // Show success message
    toast.success("Verification request sent successfully!", {
      description: "The credential holder will be notified to approve your request.",
    });

    // Reset form and clear URL parameters
    setFormData({
      employerName: currentUser?.companyName || currentUser?.name || "",
      employerEmail: currentUser?.email || "",
      purpose: "",
      credentialId: "",
      requestedFields: [],
    });

    // Clear URL parameters
    setSearchParams({});
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 py-12 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                For Employers
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Request Credential Verification
            </h1>
            <p className="text-muted-foreground">
              Submit a verification request for a candidate's educational credentials
            </p>
          </div>

          {/* Form Card */}
          <Card className="p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Employer Name */}
              <div className="space-y-2">
                <Label htmlFor="employerName" className="text-base font-semibold">
                  Employer Name *
                </Label>
                <Input
                  id="employerName"
                  type="text"
                  placeholder="e.g. ABC Technologies"
                  value={formData.employerName}
                  onChange={(e) => setFormData({ ...formData, employerName: e.target.value })}
                  className="h-11"
                />
              </div>

              {/* Employer Email */}
              <div className="space-y-2">
                <Label htmlFor="employerEmail" className="text-base font-semibold">
                  Employer Email *
                </Label>
                <Input
                  id="employerEmail"
                  type="email"
                  placeholder="hr@abc.com"
                  value={formData.employerEmail}
                  onChange={(e) => setFormData({ ...formData, employerEmail: e.target.value })}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Verification results will be sent to this email address
                </p>
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <Label htmlFor="purpose" className="text-base font-semibold">
                  Purpose of Verification *
                </Label>
                <Select
                  value={formData.purpose}
                  onValueChange={(value) => setFormData({ ...formData, purpose: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hiring">Hiring</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="background-check">Background Check</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Credential ID */}
              <div className="space-y-2">
                <Label htmlFor="credentialId" className="text-base font-semibold">
                  Candidate Credential ID *
                </Label>
                <Input
                  id="credentialId"
                  type="text"
                  placeholder={formData.credentialId || "Enter enrollment number"}
                  value={formData.credentialId}
                  onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                  className="h-11 font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  {searchParams.get('studentName') && (
                    <span className="text-primary font-medium">
                      Request for: {searchParams.get('studentName')} ({searchParams.get('degree')})
                    </span>
                  )}
                  {!searchParams.get('studentName') && (
                    "Enter the candidate's enrollment number"
                  )}
                </p>
              </div>

              {/* Additional Data Selection */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Additional Data to Request (Optional)
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select which private information you need access to. Basic credential details are already publicly available.
                </p>
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="email"
                      checked={formData.requestedFields.includes("email")}
                      onCheckedChange={(checked) => handleFieldToggle("email", !!checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="email" className="font-medium cursor-pointer">
                        Email Address
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Student's contact email address
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="subjects"
                      checked={formData.requestedFields.includes("subjects")}
                      onCheckedChange={(checked) => handleFieldToggle("subjects", !!checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="subjects" className="font-medium cursor-pointer">
                        Individual Subjects and Scores
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Detailed breakdown of academic performance
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="division"
                      checked={formData.requestedFields.includes("division")}
                      onCheckedChange={(checked) => handleFieldToggle("division", !!checked)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="division" className="font-medium cursor-pointer">
                        Division Reached (Honours Level)
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Academic honours and distinctions achieved
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" size="lg" className="w-full">
                <Send className="w-4 h-4" />
                Send Verification Request
              </Button>
            </form>
          </Card>

          {/* Help Text */}

        </div>
      </main>

      <Footer />
    </div>
  );
}
