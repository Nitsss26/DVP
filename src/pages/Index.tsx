import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusChip } from "@/components/ui/status-chip";
import {
  Shield,
  GraduationCap,
  Briefcase,
  CheckCircle,
  Search,
  User,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { getStudent, get8thSemesterRecord, StudentData, ExamRecord } from "@/data/mockData";

export default function Index() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [enrollmentInput, setEnrollmentInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<{ student: StudentData; record: ExamRecord } | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentInput.trim()) return;

    setLoading(true);
    setSearchResult(null);
    setIsVerified(false);

    try {
      // Query MongoDB via backend API
      const res = await fetch(`/api/public/registry?enrollment=${encodeURIComponent(enrollmentInput.trim())}`);
      const data = await res.json();

      if (data.students && data.students.length > 0) {
        const student = data.students[0];

        // Backend already maps data to correct format with PascalCase
        // Use it directly since registryController returns properly formatted data
        const mappedStudent: StudentData = {
          EnrlNo: student.EnrlNo || student._id,
          Details: {
            Profile: {
              StudentName: student.Details?.Profile?.StudentName || 'N/A',
              FatherName: student.Details?.Profile?.FatherName || 'N/A',
              MotherName: student.Details?.Profile?.MotherName || 'N/A',
              DOB: student.Details?.Profile?.DOB || 'N/A',
              Gender: student.Details?.Profile?.Gender || 'N/A',
              Category: student.Details?.Profile?.Category || 'N/A',
              MaritalStatus: 'N/A',
              College: student.Details?.Profile?.College || 'N/A',
              Course: student.Details?.Profile?.Course || 'N/A',
              Batch: student.Details?.Profile?.Batch || 'N/A',
              BranchCode: student.Details?.Profile?.BranchCode || 'N/A',
              FolderYear: student.Details?.Profile?.FolderYear || '2024'
            },
            Summary: {
              TotalMarks: 0,
              MaxMarks: 0,
              Division: 'N/A'
            }
          },
          ExamRecords: student.ExamRecords || []
        };

        // Find the highest/latest semester record
        let bestRecord = student.ExamRecords && student.ExamRecords.length > 0 ? student.ExamRecords[0] : null;

        if (student.ExamRecords && student.ExamRecords.length > 1) {
          // Sort by academic year (descending) then by semester number (descending)
          const sortedRecords = [...student.ExamRecords].sort((a: any, b: any) => {
            // Compare academic years first (e.g., "2021-2022" > "2019-2020")
            const yearA = a.AcademicYear || '';
            const yearB = b.AcademicYear || '';
            if (yearB > yearA) return 1;
            if (yearA > yearB) return -1;

            // If years are same, compare semester numbers
            const getSemNum = (rec: any) => {
              const examName = (rec.ExamName || rec.Semester || '').toUpperCase();
              // Extract semester number: "VI" = 6, "VIII" = 8, "II" = 2, etc.
              const romanMap: Record<string, number> = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10 };
              for (const [roman, num] of Object.entries(romanMap).reverse()) {
                if (examName.includes(`SEMESTER ${roman}`) || examName.includes(`SEM ${roman}`) || examName.includes(` ${roman} `)) {
                  return num;
                }
              }
              // Try numeric
              const numMatch = examName.match(/(\d+)\s*SEM/);
              if (numMatch) return parseInt(numMatch[1]);
              return 0;
            };
            return getSemNum(b) - getSemNum(a);
          });
          bestRecord = sortedRecords[0];
        }

        const latestRecord = bestRecord || {
          ExamName: 'Latest',
          Year: student.Details?.Profile?.Batch || '2024',
          Subjects: [],
          Summary: { Total: 0, Max: 0, Division: 'N/A' }
        };

        setSearchResult({ student: mappedStudent, record: latestRecord });
        setIsVerified(true);

        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        toast.error("No record found for this enrollment number.");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search. Please try again.");
    }

    setLoading(false);
  };

  const handleRequestAccess = () => {
    if (!currentUser) {
      toast.info("Please login as an employer to request access to student records.");
      navigate('/login', { state: { role: 'employer' } });
      return;
    }

    if (currentUser.role === 'employer' && searchResult) {
      navigate(`/verify/${searchResult.student.EnrlNo}`);
    } else if (currentUser.role === 'student') {
      if (currentUser.enrollmentNo === enrollmentInput) {
        navigate(`/verify/${enrollmentInput}`);
      } else {
        toast.error("Students can only view their own profile.");
      }
    } else {
      navigate(`/verify/${enrollmentInput}`);
    }
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

            {/* Search Box - Central Focus (Hidden for Students) */}
            {(!currentUser || currentUser.role !== 'student') && (
              <div className="max-w-2xl mx-auto mb-12 relative z-10">
                <form onSubmit={handleSearch} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="relative flex items-center bg-white rounded-xl shadow-2xl p-2">
                    <Search className="w-6 h-6 text-slate-400 ml-3" />
                    <Input
                      type="text"
                      placeholder="Enter Enrollment Number (e.g., R158237200015)"
                      className="border-0 shadow-none focus-visible:ring-0 text-lg h-12 text-slate-800 placeholder:text-slate-400 flex-1"
                      value={enrollmentInput}
                      onChange={(e) => {
                        setEnrollmentInput(e.target.value);
                        setIsVerified(false);
                      }}
                    />
                    {isVerified && (
                      <div className="flex items-center justify-center mr-2 animate-in fade-in zoom-in duration-300">
                        <div className="bg-green-100 p-1.5 rounded-full">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    )}
                    <Button
                      size="lg"
                      className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-8 h-12 rounded-lg text-base font-semibold transition-all"
                      disabled={loading}
                    >
                      {loading ? "Searching..." : "Verify Now"}
                    </Button>
                  </div>
                </form>
                <p className="mt-3 text-blue-200 text-sm">
                  * Enter the student's enrollment number to view their verified credential status.
                </p>
              </div>
            )}

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

        {/* Search Results Section - Shows when a student is found */}
        {searchResult && (
          <section ref={resultsRef} className="py-12 bg-slate-100 border-b border-slate-200">
            <div className="container mx-auto px-4 max-w-4xl">
              <Card className="p-6 border-l-4 border-l-blue-600 border-t border-r border-b border-slate-200 shadow-lg bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      {searchResult.student.Details.Profile.StudentPhoto ?
                        <img src={searchResult.student.Details.Profile.StudentPhoto} className="w-full h-full rounded-full object-cover" /> :
                        <User className="w-8 h-8" />
                      }
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">{searchResult.student.Details.Profile.StudentName}</h2>
                      <div className="flex items-center gap-2 text-slate-500 font-mono mt-1">
                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                        {searchResult.student.EnrlNo}
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Result & Status */}
                  <div className="flex justify-between items-start h-full">
                    {/* Result - Left Aligned */}
                    <div className="flex flex-col justify-center h-full">
                      <div className="text-xs text-slate-400 font-semibold uppercase mb-1">Result</div>
                      <div className="text-xl font-semibold text-slate-800 uppercase tracking-wide">
                        {searchResult.record.Result || searchResult.record.SubResult || 'NOT AVAILABLE'}
                      </div>
                    </div>

                    {/* Status - Right Aligned */}
                    <div className="text-right flex flex-col justify-center h-full">
                      <div className="text-xs text-slate-400 font-semibold uppercase mb-1">Status</div>
                      <StatusChip status="valid" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 border-t border-slate-100 pt-6">
                  {/* Top Left: Degree Program */}
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Degree Program</div>
                    <div className="font-semibold text-slate-800 text-lg leading-snug">
                      {searchResult.record.ExamName || 'N/A'}
                    </div>
                    <div className="text-slate-500 mt-1">{searchResult.record.Semester || searchResult.record.ExamType || ''}</div>
                  </div>

                  {/* Top Right: Institution */}
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Institution</div>
                    <div className="font-semibold text-slate-800 text-lg leading-snug">{searchResult.record.College || searchResult.student.Details?.Profile?.College || 'N/A'}</div>
                    <div className="text-slate-500 mt-1">Barkatullah University, Bhopal</div>
                  </div>

                  {/* Bottom Left: Session */}
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Session</div>
                    <div className="font-medium text-slate-700">{searchResult.record.AcademicYear || searchResult.student.Details?.Profile?.Batch || 'N/A'}</div>
                  </div>

                  {/* Bottom Right: Roll Number */}
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Roll Number</div>
                    <div className="font-medium text-slate-700 font-mono">{searchResult.record.RollNo || searchResult.student.ExamRecords[0]?.RollNo || 'NOT AVAILABLE'}</div>
                  </div>
                </div>

                {/* Request Access Section */}
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="bg-slate-50 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Lock className="w-5 h-5 text-slate-400" />
                      <span className="text-sm">
                        Personal details, contact info, and detailed marksheets require access permission.
                      </span>
                    </div>
                    <Button
                      onClick={handleRequestAccess}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 whitespace-nowrap"
                    >
                      {currentUser?.role === 'employer' ? 'Request Full Access' : 'Login to Request Access'}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        )}

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
