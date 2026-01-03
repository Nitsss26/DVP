import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusChip } from "@/components/ui/status-chip";
import { ExternalLink, Building2, User, Search, Lock, FileText, CheckCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudent, get8thSemesterRecord, StudentData, ExamRecord } from "@/data/mockData";
import { useVerificationStore } from "@/stores/useVerificationStore";
import { useAuth } from "@/context/AuthContext";
import { Marksheet } from "@/components/credential/Marksheet";
import { RequestVerificationModal } from "@/components/verification/RequestVerificationModal";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Interface for registered user contact info
interface RegisteredContact {
  email: string;
  phone: string;
  name: string;
  registeredAt?: string;
}

export default function VerifyCredential() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { requests, fetchRequests } = useVerificationStore();
  const [enrollmentNumber, setEnrollmentNumber] = useState("");

  const [mockStudent, setMockStudent] = useState<StudentData | undefined>(undefined);
  const [mock8thRec, setMock8thRec] = useState<ExamRecord | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [approvedFields, setApprovedFields] = useState<string[]>([]);
  const [requestStatus, setRequestStatus] = useState<'pending' | 'approved' | 'rejected' | 'none'>('none');

  // Registered user contact info (from signup database)
  const [registeredContact, setRegisteredContact] = useState<RegisteredContact | null>(null);

  const checkRequestStatus = (enrl: string) => {
    // 1. Full Access: Student (Own Profile) OR Institute (Any Profile)
    if ((currentUser?.role === 'student' && currentUser.enrollmentNo === enrl) ||
      (currentUser?.role === 'institute')) {
      setRequestStatus('approved');
      setApprovedFields(["Contact Information", "Personal Details", "Academic Summary & Division", "Detailed Subject Scores"]);
      return;
    }

    // 2. If not an employer (and not the specific student), no access request flow
    if (!currentUser || currentUser.role !== 'employer') {
      setRequestStatus('none');
      setApprovedFields([]);
      return;
    }

    // 3. Employer viewing -> Check Store
    // Filter by enrollment number (case-insensitive) and strict Employer ID
    const myRequests = requests.filter(r =>
      r.studentEnrlNo.toLowerCase() === enrl.toLowerCase() &&
      r.employerId === currentUser.uid
    );

    // Prioritize APPROVED request(s)
    // We aggregate permissions from ALL approved requests to ensure that if a user has multiple requests 
    // (e.g. one for "Personal" and one for "Marksheet"), they see BOTH.
    const approvedRequests = myRequests.filter(r => r.status === 'approved');

    if (approvedRequests.length > 0) {
      setRequestStatus('approved');

      // Merge all unique approved fields
      const mergedFields = new Set<string>();
      approvedRequests.forEach(req => {
        if (Array.isArray(req.approvedFields)) {
          req.approvedFields.forEach(field => mergedFields.add(field));
        }
      });

      setApprovedFields(Array.from(mergedFields));
    } else {
      // If no approved, show status of the LATEST request (Pending/Rejected)
      const latestReq = myRequests[0];
      if (latestReq) {
        setRequestStatus(latestReq.status);
        setApprovedFields([]);
      } else {
        setRequestStatus('none');
        setApprovedFields([]);
      }
    }
  };

  const handleSearch = async (termToSearch: string) => {
    if (!termToSearch.trim()) return;

    // Restrict students to only search their own enrollment number
    if (currentUser?.role === 'student' && currentUser.enrollmentNo) {
      if (termToSearch.toUpperCase() !== currentUser.enrollmentNo.toUpperCase()) {
        toast.error("Students can only view their own profile.");
        return;
      }
    }

    // Fetch latest requests from backend before checking status
    await fetchRequests();

    setLoading(true);
    setMockStudent(undefined);
    setMock8thRec(undefined);

    await new Promise(r => setTimeout(r, 300)); // Brief delay for UX

    let foundStudent: any = null;

    try {
      // 1. Try fetching from Backend API (MongoDB)
      console.log("Fetching student from backend API...");
      const response = await fetch(`/api/public/registry?enrollment=${encodeURIComponent(termToSearch)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.students && data.students.length > 0) {
          // Find exact match (case-insensitive)
          foundStudent = data.students.find((s: any) =>
            s.EnrlNo && s.EnrlNo.toLowerCase() === termToSearch.toLowerCase()
          );
        }
      }
    } catch (apiError) {
      console.error("Backend API error:", apiError);
    }

    // 2. Fallback to local mockData helper if API didn't return anything
    if (!foundStudent) {
      console.log("Not found in API, checking local mockData...");
      foundStudent = getStudent(termToSearch);
    }

    // 3. Fallback to temp_students.ts if still not found
    if (!foundStudent) {
      console.log("Not found in mockData, checking temp_students.ts...");
      try {
        const mod: any = await import('@/data/temp_students');
        const tempStudents = mod.STUDENTS_DATA || mod.default || [];
        if (Array.isArray(tempStudents)) {
          foundStudent = tempStudents.find((s: any) =>
            s.EnrlNo && s.EnrlNo.toLowerCase() === termToSearch.toLowerCase()
          );
        }
      } catch (e) {
        console.error("Failed to load temp_students fallback", e);
      }
    }

    if (foundStudent) {
      setMockStudent(foundStudent);

      // Find the highest/latest semester record (same logic as Index.tsx)
      let finalRecord = foundStudent.ExamRecords?.[0];

      if (foundStudent.ExamRecords && foundStudent.ExamRecords.length > 1) {
        // Sort by academic year (descending) then by semester number (descending)
        const sortedRecords = [...foundStudent.ExamRecords].sort((a: any, b: any) => {
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
        finalRecord = sortedRecords[0];
      }

      setMock8thRec(finalRecord);

      // Fetch registered user contact info from signup database
      try {
        const contactRes = await fetch(`/api/public/user-contact/${encodeURIComponent(foundStudent.EnrlNo)}`);
        const contactData = await contactRes.json();
        if (contactData.found) {
          setRegisteredContact({
            email: contactData.email,
            phone: contactData.phone,
            name: contactData.name,
            registeredAt: contactData.registeredAt
          });
        } else {
          setRegisteredContact(null);
        }
      } catch (e) {
        console.error("Failed to fetch contact info:", e);
        setRegisteredContact(null);
      }

      // Update URL if needed
      if (id !== termToSearch) {
        navigate(`/verify/${termToSearch}`, { replace: true });
      }
    } else {
      console.log("Student not found in any source.");
    }

    setLoading(false);
  };

  useEffect(() => {
    // Fetch latest requests from backend on mount
    fetchRequests();
    if (id) {
      setEnrollmentNumber(id);
      handleSearch(id);
    }
  }, [id]);

  useEffect(() => {
    if (mockStudent) {
      checkRequestStatus(mockStudent.EnrlNo);
    }
  }, [requests, mockStudent, currentUser]);

  const canViewPrivateDetails = requestStatus === 'approved';
  const hasAccessTo = (field: string) => canViewPrivateDetails && approvedFields.includes(field);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-5xl">

          {/* Header & Search Section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Credential Verification</h1>
            <p className="text-slate-500 max-w-2xl mx-auto mb-8">
              Enter an enrollment number to verify the student&apos;s academic standing on the blockchain.
            </p>

            <Card className="p-2 shadow-sm border-slate-200 max-w-2xl mx-auto bg-white">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    className="pl-10 border-0 focus-visible:ring-0 text-lg h-12"
                    placeholder="R158237200015"
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(enrollmentNumber)}
                  />
                </div>
                <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md" onClick={() => handleSearch(enrollmentNumber)} disabled={loading}>
                  {loading ? "Verifying..." : "Verify"}
                </Button>
              </div>
            </Card>
          </div>

          {/* Results Area */}
          {mockStudent && mock8thRec ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Card 1: Main Student Identity - Matches Screenshot 1 */}
              <Card className="p-6 border-l-4 border-l-blue-600 border-t border-r border-b border-slate-200 shadow-sm bg-white">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      {mockStudent.Details.Profile.StudentPhoto ?
                        <img src={mockStudent.Details.Profile.StudentPhoto} className="w-full h-full rounded-full object-cover" /> :
                        <User className="w-8 h-8" />
                      }
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">{mockStudent.Details.Profile.StudentName}</h2>
                      <div className="flex items-center gap-2 text-slate-500 font-mono mt-1">
                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                        {mockStudent.EnrlNo}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                    <div className="text-xs text-slate-400 font-semibold uppercase mb-1">Status</div>
                    <StatusChip status="valid" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-6">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Degree Program</div>
                    <div className="font-semibold text-slate-800 text-lg leading-snug">
                      {mock8thRec.ExamName || 'N/A'}
                    </div>
                    <div className="text-slate-500 mt-1">{mock8thRec.Semester || mock8thRec.ExamType || ''}</div>

                    {/* Session Field */}
                    <div className="mt-4">
                      <div className="text-xs font-bold text-slate-400 uppercase mb-1">Session</div>
                      <div className="font-medium text-slate-700">{mock8thRec.AcademicYear || mockStudent.Details?.Profile?.Batch || 'N/A'}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Institution</div>
                    <div className="font-semibold text-slate-800 text-lg leading-snug">{mock8thRec.College || mockStudent.Details?.Profile?.College || 'N/A'}</div>
                    <div className="text-slate-500 mt-1">Barkatullah University, Bhopal</div>

                    {/* Roll Number Field - Parallel to Session */}
                    <div className="mt-4">
                      <div className="text-xs font-bold text-slate-400 uppercase mb-1">Roll Number</div>
                      <div className="font-medium text-slate-700">{mock8thRec.RollNo || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card 2: Personal Details - Matches Screenshot 2 */}
              <Card className="p-6 border border-slate-200 shadow-sm bg-white">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  {hasAccessTo("Personal Details") ? "Personal Details Verified" : "Personal Details Locked"}
                </h3>

                {hasAccessTo("Personal Details") ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase mb-1">Father's Name</div>
                      <div className="font-medium text-slate-800 uppercase">{mockStudent.Details.Profile.FatherName}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase mb-1">Mother's Name</div>
                      <div className="font-medium text-slate-800 uppercase">{mockStudent.Details.Profile.MotherName}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase mb-1">Date of Birth</div>
                      <div className="font-medium text-slate-800">{mockStudent.Details.Profile.DOB}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase mb-1">Category</div>
                      <div className="font-medium text-slate-800 uppercase">{mockStudent.Details.Profile.Category}</div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-lg p-6 border border-slate-100 flex flex-col items-center justify-center text-center">
                    <Lock className="w-10 h-10 text-slate-300 mb-3" />
                    <p className="text-slate-600 font-medium mb-1">Personal details are private</p>
                    <p className="text-slate-500 text-sm mb-4">Request authorization from the student to view these details.</p>

                    {requestStatus === 'pending' ? (
                      <Badge className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50 text-base py-1 px-4 border-yellow-200">
                        Request Pending
                      </Badge>
                    ) : requestStatus === 'rejected' ? (
                      <Badge className="bg-red-50 text-red-700 hover:bg-red-50 text-base py-1 px-4 border-red-200">
                        Request Declined
                      </Badge>
                    ) : requestStatus === 'approved' ? (
                      <Badge className="bg-slate-100 text-slate-500 pointer-events-none">Access Not Granted</Badge>
                    ) : (
                      <RequestVerificationModal
                        studentEnrlNo={mockStudent.EnrlNo}
                        studentName={mockStudent.Details.Profile.StudentName}
                        onSuccess={() => checkRequestStatus(mockStudent.EnrlNo)}
                      />
                    )}
                  </div>
                )}
              </Card>

              {/* Card 3: Contact Info - Shows real registered data if available */}
              <Card className="p-6 border-l-4 border-l-green-500 border-t border-r border-b border-slate-200 shadow-sm bg-white">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Verified Contact Info</h3>
                {hasAccessTo("Contact Information") ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                    {registeredContact ? (
                      <>
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase mb-1">Email</div>
                          <div className="font-mono text-slate-700">
                            {registeredContact.email}
                            <span className="ml-2 text-xs text-green-600 font-sans">(Registered)</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase mb-1">Phone</div>
                          <div className="font-mono text-slate-700">{registeredContact.phone || 'N/A'}</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase mb-1">Email</div>
                          <div className="font-mono text-slate-700">{mockStudent.EnrlNo.toLowerCase()}@student.bu.ac.in</div>
                          <span className="text-xs text-amber-600">(Default - Not Registered)</span>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase mb-1">Phone</div>
                          <div className="font-mono text-slate-400">Not Available</div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 italic">
                    Contact info hidden. Request access to view.
                  </div>
                )}
              </Card>

              {/* Full Record Status */}
              <div className="flex items-center gap-2 px-1">
                {canViewPrivateDetails ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1.5 px-3 py-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Verification Access Granted
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 flex items-center gap-1.5 px-3 py-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Limited View
                  </Badge>
                )}
              </div>

              {/* Marksheet Component - Standard OR Locked View */}
              {hasAccessTo("Detailed Subject Scores") ? (
                <Marksheet
                  student={mockStudent}
                  record={mock8thRec}
                  isVerified={true}
                />
              ) : (
                <Card className="p-12 border border-slate-200 shadow-sm bg-white flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3 font-serif">Marksheet Locked</h3>
                  <p className="text-slate-500 max-w-md mb-8">
                    Detailed academic records are private. {requestStatus === 'approved' ? 'You have access to other details but not the full marksheet.' : 'You must request access from the student to view this full marksheet.'}
                  </p>
                  {requestStatus === 'none' && (
                    <RequestVerificationModal
                      studentEnrlNo={mockStudent.EnrlNo}
                      studentName={mockStudent.Details.Profile.StudentName}
                      onSuccess={() => checkRequestStatus(mockStudent.EnrlNo)}
                    />
                  )}
                  {requestStatus === 'pending' && <Badge className="bg-yellow-50 text-yellow-700 pointer-events-none">Request Sent (Pending)</Badge>}
                  {requestStatus === 'rejected' && <Badge className="bg-red-50 text-red-700 pointer-events-none">Request Rejected</Badge>}
                  {requestStatus === 'approved' && <Badge className="bg-slate-100 text-slate-500 pointer-events-none">Marksheet Access Not Granted</Badge>}
                </Card>
              )}

            </div>
          ) : (
            // Empty State
            id && !loading && (
              <div className="text-center py-20 opacity-50">
                <Search className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-medium text-slate-800">No Record Found</h3>
                <p className="text-slate-500">We couldn't find a record for enrollment number "{id}".</p>
              </div>
            )
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
