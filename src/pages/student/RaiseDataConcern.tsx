import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useConcernStore, DataConcern } from "@/stores/useConcernStore";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Clock, CheckCircle, XCircle } from "lucide-react";

export default function RaiseDataConcern() {
    const { toast } = useToast();
    const { currentUser } = useAuth(); // Assuming student is logged in
    const { raiseConcern, getConcernsForStudent } = useConcernStore();

    // Mock student details if not fully available in currentUser
    const studentEnrl = currentUser?.uid || "R158237200015";
    const studentName = currentUser?.name || "Nitesh Kumar";

    const concerns = getConcernsForStudent(studentEnrl);

    const [field, setField] = useState("");
    const [value, setValue] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!field || !value) {
            toast({ title: "Error", description: "Please fill all required fields.", variant: "destructive" });
            return;
        }

        raiseConcern({
            studentEnrlNo: studentEnrl,
            studentName: studentName,
            fieldToCorrect: field,
            proposedValue: value,
            proofDocName: file ? file.name : undefined
        });

        toast({ title: "Concern Raised", description: "Your data correction request has been submitted." });
        setField("");
        setValue("");
        setFile(null);
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Raise Data Concern</h1>
                    <p className="text-slate-500 mt-2">Report incorrect data in your registry profile and track correction status.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>New Correction Request</CardTitle>
                                <CardDescription>Submit a request to correct your profile data.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Field to Correct</Label>
                                        <Input
                                            placeholder="Enter field name (e.g. Student Name)"
                                            value={field}
                                            onChange={(e) => setField(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Correct Value</Label>
                                        <Input
                                            placeholder="Enter the correct value"
                                            value={value}
                                            onChange={(e) => setValue(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Proof Document</Label>
                                        <Input
                                            type="file"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        />
                                        <p className="text-[10px] text-slate-500">Supported formats: PDF, JPG, PNG.</p>
                                    </div>
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Submit Request</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* History Section */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Request History</CardTitle>
                                <CardDescription>Logs of your data correction requests.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Field</TableHead>
                                            <TableHead>Proposed</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Admin Response</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {concerns.length > 0 ? (
                                            concerns.map((c) => (
                                                <TableRow key={c.id}>
                                                    <TableCell className="font-medium">{c.fieldToCorrect}</TableCell>
                                                    <TableCell>{c.proposedValue}</TableCell>
                                                    <TableCell>
                                                        {c.status === 'pending' && <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>}
                                                        {c.status === 'resolved' && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Resolved</Badge>}
                                                        {c.status === 'rejected' && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-xs">
                                                        {new Date(c.timestamp).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right text-sm">
                                                        {c.adminResponse || "-"}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                    No correction requests raised yet.
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
