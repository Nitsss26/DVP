import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useConcernStore } from "@/stores/useConcernStore";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Send, Clock, CheckCircle2, Search, Loader2, User } from "lucide-react";

// Student suggestion type
interface StudentSuggestion {
    EnrlNo: string;
    StudentName: string;
    College?: string;
    Course?: string;
}

export default function EmployerHelpRequest() {
    const { toast } = useToast();
    const { currentUser } = useAuth();
    const { createHelpRequest, getHelpRequestsForEmployer, fetchHelpRequests } = useConcernStore();

    // Fetch help requests from backend on mount
    useEffect(() => {
        fetchHelpRequests();
    }, [fetchHelpRequests]);

    const employerName = currentUser?.name || "Acme Corp";
    const employerId = currentUser?.uid || "emp_default";

    // All requests (filtered for this employer)
    const requests = getHelpRequestsForEmployer();

    // Autocomplete states
    const [enrlNo, setEnrlNo] = useState("");
    const [details, setDetails] = useState("");
    const [suggestions, setSuggestions] = useState<StudentSuggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentSuggestion | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Debounced search effect
    useEffect(() => {
        if (enrlNo.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/public/registry?search=${encodeURIComponent(enrlNo)}&limit=8`);
                const data = await res.json();

                if (data.students && data.students.length > 0) {
                    const mapped: StudentSuggestion[] = data.students.map((s: any) => ({
                        EnrlNo: s.EnrlNo || s._id,
                        StudentName: s.Details?.Profile?.StudentName || 'Unknown',
                        College: s.Details?.Profile?.College || '',
                        Course: s.Details?.Profile?.Course || ''
                    }));
                    setSuggestions(mapped);
                    setShowSuggestions(true);
                } else {
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            } catch (error) {
                console.error("Search error:", error);
                setSuggestions([]);
            }
            setIsSearching(false);
        }, 400); // 400ms debounce

        return () => clearTimeout(timer);
    }, [enrlNo]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectStudent = (student: StudentSuggestion) => {
        setEnrlNo(student.EnrlNo);
        setSelectedStudent(student);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const handleCreateRequest = (e: React.FormEvent) => {
        e.preventDefault();
        if (!enrlNo || !details) {
            toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
            return;
        }

        createHelpRequest({
            employerId,
            employerName,
            studentEnrlNo: enrlNo,
            studentName: selectedStudent?.StudentName || enrlNo, // Use real name if selected
            requestDetails: details,
        });

        toast({ title: "Request Sent", description: `Help request sent to student ${selectedStudent?.StudentName || enrlNo}.` });
        setEnrlNo("");
        setDetails("");
        setSelectedStudent(null);
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Request Information</h1>
                    <p className="text-slate-500 mt-2">Need clarification? Ask the student directly.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>New Query</CardTitle>
                                <CardDescription>Ask a student for missing documents or clarity.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreateRequest} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Student Enrollment No.</Label>
                                        <div className="relative">
                                            {isSearching ? (
                                                <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                                            ) : (
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            )}
                                            <Input
                                                ref={inputRef}
                                                className="pl-9"
                                                placeholder="Type to search (e.g. R158...)"
                                                value={enrlNo}
                                                onChange={(e) => {
                                                    setEnrlNo(e.target.value);
                                                    setSelectedStudent(null);
                                                }}
                                                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                                autoComplete="off"
                                            />

                                            {/* Suggestions Dropdown */}
                                            {showSuggestions && suggestions.length > 0 && (
                                                <div
                                                    ref={suggestionsRef}
                                                    className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                                                >
                                                    {suggestions.map((student, index) => (
                                                        <button
                                                            key={student.EnrlNo}
                                                            type="button"
                                                            onClick={() => handleSelectStudent(student)}
                                                            className={`w-full text-left px-3 py-2.5 hover:bg-blue-50 flex items-start gap-3 transition-colors ${index !== suggestions.length - 1 ? 'border-b border-slate-100' : ''
                                                                }`}
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <User className="w-4 h-4 text-slate-500" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-medium text-slate-900 truncate">{student.StudentName}</div>
                                                                <div className="text-xs text-blue-600 font-mono">{student.EnrlNo}</div>
                                                                {student.College && (
                                                                    <div className="text-xs text-slate-500 truncate mt-0.5">{student.College}</div>
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Selected student indicator */}
                                            {selectedStudent && (
                                                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-sm">
                                                    <span className="text-green-700">Selected: </span>
                                                    <span className="font-medium text-green-900">{selectedStudent.StudentName}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Query / Request Details</Label>
                                        <Textarea
                                            placeholder="Describe what you need (e.g., 'Please explain gap year')..."
                                            value={details}
                                            onChange={(e) => setDetails(e.target.value)}
                                            rows={5}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-blue-600">
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Request
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Table */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sent Requests</CardTitle>
                                <CardDescription>Status of your queries sent to students.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Details</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Response</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {requests.length > 0 ? (
                                            requests.map((req) => (
                                                <TableRow key={req.id}>
                                                    <TableCell>
                                                        <div className="font-medium text-slate-900">{req.studentName}</div>
                                                        <div className="text-xs text-muted-foreground">{req.studentEnrlNo}</div>
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate" title={req.requestDetails}>
                                                        {req.requestDetails}
                                                    </TableCell>
                                                    <TableCell>
                                                        {req.status === 'open' ? (
                                                            <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Awaiting</Badge>
                                                        ) : (
                                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Replied</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right text-sm max-w-[200px]">
                                                        {req.studentResponse ? (
                                                            <span className="text-slate-700 font-medium truncate block" title={req.studentResponse}>
                                                                "{req.studentResponse}"
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400">-</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                    No requests sent yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
