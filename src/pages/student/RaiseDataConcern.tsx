import { useState, useEffect } from "react";
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
import { Upload, FileText, Clock, CheckCircle, XCircle, Loader2, Link as LinkIcon, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

export default function RaiseDataConcern() {
    const { toast } = useToast();
    const { currentUser } = useAuth();
    const { raiseConcern, getConcernsForStudent, fetchConcerns } = useConcernStore();

    // Fetch concerns from backend on mount
    // Fetch concerns from backend on mount
    useEffect(() => {
        if (currentUser?.enrollmentNo) {
            console.log("Fetching concerns for:", currentUser.enrollmentNo);
            fetchConcerns(currentUser.enrollmentNo);
        }
    }, [fetchConcerns, currentUser]);

    // Student details from currentUser
    const studentEnrl = currentUser?.enrollmentNo || currentUser?.uid || "R158237200015";
    const studentName = currentUser?.name || "Nitesh Kumar";

    const concerns = getConcernsForStudent(studentEnrl);

    const [field, setField] = useState("");
    const [value, setValue] = useState("");
    const [documentUrl, setDocumentUrl] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState("");

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFileName(selectedFile.name);
        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        uploadData.append('upload_preset', 'DVP-Storage');

        try {
            const res = await fetch('https://api.cloudinary.com/v1_1/dwaepohvf/auto/upload', {
                method: 'POST',
                body: uploadData
            });
            const data = await res.json();

            if (res.ok) {
                let url = data.secure_url;
                if (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) {
                    url = url.replace('/upload/', '/upload/fl_attachment/');
                }
                setDocumentUrl(url);
                // removed success toast
            } else {
                toast({ title: "Upload Failed", description: data.error?.message || "Upload failed", variant: "destructive" });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Upload failed.", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

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
            proofDocName: fileName,
            documentUrl
        });

        toast({ title: "Concern Raised", description: "Your data correction request has been submitted." });
        setField("");
        setValue("");
        setDocumentUrl("");
        setFileName("");
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
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="file"
                                                onChange={handleFileChange}
                                                disabled={uploading}
                                            />
                                            {uploading && <Loader2 className="animate-spin h-5 w-5 text-blue-600" />}
                                        </div>
                                        {documentUrl && !uploading && <p className="text-xs text-green-600 mt-1">✓ File uploaded successfully</p>}
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
                                            <TableHead>Proof Document</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Admin Response</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(() => {
                                            // 1. Sort by Date (Newest First)
                                            const sortedConcerns = [...concerns].sort((a, b) =>
                                                new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                                            );

                                            // 2. Pagination Logic
                                            const itemsPerPage = 6;
                                            const totalPages = Math.ceil(sortedConcerns.length / itemsPerPage);
                                            // Ensure currentPage is valid
                                            const [currentPage, setCurrentPage] = useState(1);

                                            // Reset to page 1 if concerns change drastically (optional but good practice)
                                            useEffect(() => {
                                                setCurrentPage(1);
                                            }, [concerns.length]);

                                            const startIndex = (currentPage - 1) * itemsPerPage;
                                            const currentConcerns = sortedConcerns.slice(startIndex, startIndex + itemsPerPage);

                                            return (
                                                <>
                                                    {currentConcerns.length > 0 ? (
                                                        currentConcerns.map((c) => (
                                                            <TableRow key={c.id}>
                                                                <TableCell className="font-medium">{c.fieldToCorrect}</TableCell>
                                                                <TableCell>{c.proposedValue}</TableCell>
                                                                <TableCell>
                                                                    {c.proofDocName ? (
                                                                        <div className="flex items-center text-sm text-blue-600">
                                                                            <FileText className="w-4 h-4 mr-1 flex-shrink-0" />
                                                                            {c.documentUrl ? (
                                                                                <a
                                                                                    href={c.documentUrl}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="hover:underline flex items-center gap-1"
                                                                                    title={c.proofDocName} // Full name on hover
                                                                                >
                                                                                    {(() => {
                                                                                        const name = c.proofDocName || "";
                                                                                        if (name.length <= 25) return name;
                                                                                        const extIndex = name.lastIndexOf('.');
                                                                                        if (extIndex !== -1 && name.length - extIndex < 6) {
                                                                                            // Keep start + ... + ext
                                                                                            const ext = name.substring(extIndex);
                                                                                            return name.substring(0, 15) + "..." + ext;
                                                                                        }
                                                                                        return name.substring(0, 20) + "...";
                                                                                    })()}
                                                                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                                                                </a>
                                                                            ) : (
                                                                                <span>{c.proofDocName}</span>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400">-</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {c.status === 'pending' && <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>}
                                                                    {c.status === 'resolved' && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Resolved</Badge>}
                                                                    {c.status === 'rejected' && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>}
                                                                </TableCell>
                                                                <TableCell className="text-muted-foreground text-xs">
                                                                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', {
                                                                        day: '2-digit',
                                                                        month: 'short',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                        hour12: true
                                                                    }) : '-'}
                                                                </TableCell>
                                                                <TableCell className="text-right text-sm">
                                                                    {c.adminResponse || "-"}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                                No correction requests raised yet.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}

                                                    {/* Pagination Controls - Only show if more than 6 items */}
                                                    {sortedConcerns.length > 6 && (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="p-2">
                                                                <div className="flex items-center justify-end gap-2 py-2">
                                                                    <span className="text-xs text-muted-foreground mr-2">
                                                                        Page {currentPage} of {totalPages}
                                                                    </span>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0"
                                                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                                        disabled={currentPage === 1}
                                                                    >
                                                                        <ChevronLeft className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0"
                                                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                                        disabled={currentPage === totalPages}
                                                                    >
                                                                        <ChevronRight className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </>
                                            );
                                        })()}
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
