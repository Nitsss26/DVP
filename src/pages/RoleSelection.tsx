import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Building2, Check } from "lucide-react";

export default function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<"student" | "employer" | null>(null);

  const handleContinue = () => {
    if (selectedRole === "student") {
      navigate("/grants");
    } else if (selectedRole === "employer") {
      navigate("/employer/onboarding");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to EDUChain</h1>
          <p className="text-xl text-muted-foreground">
            Choose your role to get started with credential verification
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
          {/* Student Card */}
          <Card
            className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
              selectedRole === "student"
                ? "border-primary border-2 bg-primary/5"
                : "border-border"
            }`}
            onClick={() => setSelectedRole("student")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                I'm a Student
                {selectedRole === "student" && (
                  <Check className="w-6 h-6 text-primary" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base">
                View and share your verified credentials securely with employers and organizations.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Employer Card */}
          <Card
            className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
              selectedRole === "employer"
                ? "border-primary border-2 bg-primary/5"
                : "border-border"
            }`}
            onClick={() => setSelectedRole("employer")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <Building2 className="w-10 h-10 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                I'm an Employer
                {selectedRole === "employer" && (
                  <Check className="w-6 h-6 text-primary" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-base">
                Verify candidates and request credentials from students instantly and securely.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedRole}
            className="px-8"
          >
            Continue
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
