import { useState } from "react";
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
import { Send, Clock, CheckCircle2, Search } from "lucide-react";

export default function EmployerHelpRequest() {
    const { toast } = useToast();
    const { currentUser } = useAuth();
    const { createHelpRequest, getHelpRequestsForEmployer } = useConcernStore();

    const employerName = currentUser?.name || "Acme Corp";
    const employerId = currentUser?.uid || "emp_default";

    // All requests (mock filtered for this employer)
    const requests = getHelpRequestsForEmployer();

    const [enrlNo, setEnrlNo] = useState("");
    const [details, setDetails] = useState("");

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
            studentName: "Student Mock", // Ideally fetch this
            requestDetails: details,
        });

        toast({ title: "Request Sent", description: `Help request sent to student ${enrlNo}.` });
        setEnrlNo("");
        setDetails("");
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
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                className="pl-9"
                                                placeholder="e.g. R158..."
                                                value={enrlNo}
                                                onChange={(e) => setEnrlNo(e.target.value)}
                                            />
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
