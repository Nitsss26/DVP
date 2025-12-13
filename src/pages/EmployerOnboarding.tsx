import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Mail, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type OnboardingStep = "info" | "email" | "success";

export default function EmployerOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<OnboardingStep>("info");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const freeEmailDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];

  const validateEmail = (email: string) => {
    const emailDomain = email.split("@")[1];
    if (emailDomain && freeEmailDomains.includes(emailDomain.toLowerCase())) {
      setEmailError("Use your company domain email for faster verification.");
    } else {
      setEmailError("");
    }
  };

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !website || !email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Store employer info in localStorage
    localStorage.setItem("employerInfo", JSON.stringify({
      companyName,
      website,
      email,
      verified: false,
    }));

    setStep("email");
  };

  const handleResendEmail = () => {
    toast({
      title: "Email Sent",
      description: `Verification link resent to ${email}`,
    });
  };

  const handleChangeEmail = () => {
    setStep("info");
  };

  const handleVerifyEmail = () => {
    // Simulate email verification
    const employerInfo = JSON.parse(localStorage.getItem("employerInfo") || "{}");
    employerInfo.emailVerified = true;
    localStorage.setItem("employerInfo", JSON.stringify(employerInfo));
    setStep("success");
  };

  const progress = step === "info" ? 33 : step === "email" ? 66 : 100;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      {/* Page Header Area */}
      <div className="bg-white border-b border-slate-200 mb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-blue-600" />
                  Employer Registration
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                  create an account to request and verify academic credentials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between mb-2 text-sm font-medium">
              <span className={step === "info" ? "text-blue-600" : "text-slate-400"}>
                1. Company Info
              </span>
              <span className={step === "email" ? "text-blue-600" : "text-slate-400"}>
                2. Email Verification
              </span>
              <span className={step === "success" ? "text-blue-600" : "text-slate-400"}>
                3. Access Granted
              </span>
            </div>
            <Progress value={progress} className="h-2 bg-slate-200" indicatorClassName="bg-blue-600" />
          </div>

          {/* Step 1: Company Information */}
          {step === "info" && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Company Information</CardTitle>
                <CardDescription className="text-slate-500">
                  Tell us about your organization to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitInfo} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-slate-700">Company Name *</Label>
                    <Input
                      id="companyName"
                      placeholder="Acme Corporation"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-slate-700">Website *</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://acme.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      required
                      className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700">Business Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="hr@acme.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        validateEmail(e.target.value);
                      }}
                      required
                      className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {emailError && (
                      <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{emailError}</span>
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Continue
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Email Verification */}
          {step === "email" && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-center text-slate-900">Verify Your Email</CardTitle>
                <CardDescription className="text-center text-slate-500">
                  We've sent a verification link to <strong className="text-slate-900">{email}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg text-center text-sm text-slate-600 border border-slate-100">
                  Check your inbox and click the verification link to continue
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
                    onClick={handleResendEmail}
                  >
                    Resend Email
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
                    onClick={handleChangeEmail}
                  >
                    Change Email
                  </Button>
                </div>

                {/* Demo button to simulate verification */}
                <Button
                  onClick={handleVerifyEmail}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Verify Email (Demo)
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <Card className="border-slate-200 shadow-sm border-t-4 border-t-green-500">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-center text-slate-900">Email Verified!</CardTitle>
                <CardDescription className="text-center text-slate-500">
                  You now have limited access while we verify your organisation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
                  <p className="text-sm text-center text-amber-800">
                    <strong className="block mb-1 text-amber-900">Non-verified Employer</strong>
                    You can submit up to 3 verification requests per week.
                    Full access will be granted once your organisation is verified.
                  </p>
                </div>

                <Button
                  onClick={() => navigate("/employer/dashboard")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
