import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Shield,
  GraduationCap,
  Briefcase,
  CheckCircle,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { toast } from "sonner";

export default function Index() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [enrollmentInput, setEnrollmentInput] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentInput.trim()) return;

    if (!currentUser) {
      toast.error("Please login to verify credentials.");
      navigate('/login');
      return;
    }

    if (currentUser.role === 'student' && currentUser.enrollmentNo !== enrollmentInput) {
      toast.error("Students can only view their own profile.");
      return;
    }

    // If Employer/Institute or Matching Student (though student view is profile)
    // Redirecting to registry/verify path
    navigate(`/verify/${enrollmentInput}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Header />

      <main className="flex-1">
        {/* Hero Section - Clean Blue */}
        <section className="relative overflow-hidden bg-[#3B82F6] py-24 lg:py-32">
          {/* Abstract Blue Shapes/Gradient */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-400 opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500 opacity-20 blur-3xl"></div>

          <div className="container relative mx-auto px-4 text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-8">
              <Shield className="w-4 h-4 text-blue-100" />
              <span className="text-sm font-medium text-blue-50 tracking-wide uppercase">
                Official Blockchain Verification Portal
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight">
              Verify Academic Credentials <br className="hidden md:block" />
              <span className="text-blue-100">Instantly & Securely</span>
            </h1>

            <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Barkatullah University introduces a tamper-proof degree verification system powered by blockchain technology.
              Trusted by students, employers, and institutions worldwide.
            </p>

            {/* Search Box - Central Focus */}
            <div className="max-w-2xl mx-auto mb-12 relative z-10">
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative flex items-center bg-white rounded-xl shadow-2xl p-2">
                  <Search className="w-6 h-6 text-slate-400 ml-3" />
                  <Input
                    type="text"
                    placeholder="Enter Enrollment Number (e.g., R1900456)"
                    className="border-0 shadow-none focus-visible:ring-0 text-lg h-12 text-slate-800 placeholder:text-slate-400"
                    value={enrollmentInput}
                    onChange={(e) => setEnrollmentInput(e.target.value)}
                  />
                  <Button size="lg" className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-8 h-12 rounded-lg text-base font-semibold transition-all">
                    Verify Now
                  </Button>
                </div>
              </form>
              <p className="mt-3 text-blue-200 text-sm">
                * Enter the student's enrollment number to view their verified credential status.
              </p>
            </div>

            {/* Quick Action Buttons */}
            {!currentUser && (
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => navigate('/login', { state: { role: 'student' } })}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-12 px-6 rounded-full"
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Student Login
                </Button>
                <Button
                  onClick={() => navigate('/login', { state: { role: 'employer' } })}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-12 px-6 rounded-full"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Employer Login
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center w-full max-w-3xl mx-auto mb-16">
              <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-2">Process</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How Verification Works</h3>
              <p className="text-slate-600 text-lg">
                Our platform ensures data privacy and authenticity through a three-step consent-based verification process.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Step 1 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-50 rounded-2xl transform transition-transform group-hover:scale-105 duration-300"></div>
                <div className="relative p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Search className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">1. Employer Request</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Employers or verifiers search for a student and request access to their specific academic records.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-50 rounded-2xl transform transition-transform group-hover:scale-105 duration-300"></div>
                <div className="relative p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">2. Student Consent</h4>
                  <p className="text-slate-600 leading-relaxed">
                    The student receives a notification and grants permission to share their verified data securely.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-50 rounded-2xl transform transition-transform group-hover:scale-105 duration-300"></div>
                <div className="relative p-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Shield className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">3. Instant Verification</h4>
                  <p className="text-slate-600 leading-relaxed">
                    The blockchain ensures the record is authentic, tamper-proof, and instantly available for review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Stats / Trust Section */}
        <section className="py-20 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
                <div className="text-slate-600 font-medium">Tamper Proof</div>
              </div>
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-slate-600 font-medium">Availability</div>
              </div>
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="text-4xl font-bold text-blue-600 mb-2">AES-256</div>
                <div className="text-slate-600 font-medium">Bank-Grade Security</div>
              </div>
              <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="text-4xl font-bold text-blue-600 mb-2">Instant</div>
                <div className="text-slate-600 font-medium">Global Verification</div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 text-center">
            <Card className="bg-[#3B82F6] text-white p-12 rounded-3xl overflow-hidden relative border-none shadow-2xl max-w-5xl mx-auto">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-16 -mb-16"></div>

              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Built for the Modern University Ecosystem</h2>
                <p className="text-blue-50 text-lg mb-8 max-w-2xl mx-auto">
                  Empowering students with ownership of their achievements and providing employers with trusted, instant verification.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {!currentUser && (
                    <Button
                      size="lg"
                      className="bg-white text-[#3B82F6] hover:bg-blue-50 font-bold px-8 h-12"
                      onClick={() => navigate('/login')}
                    >
                      University Admin Portal
                    </Button>
                  )}
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white bg-transparent hover:bg-white/10 hover:text-white px-8 h-12"
                  >
                    Contact Support
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
