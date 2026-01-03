import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useConcernStore } from "@/stores/useConcernStore";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Check, Loader2, Link as LinkIcon, ExternalLink, Upload, FileText } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function StudentHelpResponse() {
    const { toast } = useToast();
    const { currentUser } = useAuth();
    const { getHelpRequestsForStudent, respondToHelpRequest, fetchHelpRequests } = useConcernStore();

    // Fetch help requests from backend on mount
    useEffect(() => {
        fetchHelpRequests({ studentEnrlNo: currentUser?.enrollmentNo });
    }, [fetchHelpRequests, currentUser?.enrollmentNo]);

    const studentEnrl = currentUser?.enrollmentNo || currentUser?.uid || "R158237200015";
    const requests = getHelpRequestsForStudent(studentEnrl);

    const [responseText, setResponseText] = useState("");
    const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // File upload state in Dialog
    const [documentUrl, setDocumentUrl] = useState<string>('');
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        uploadData.append('upload_preset', 'DVP-Storage'); // Unsigned preset

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

    const handleRespond = () => {
        if (!selectedReqId || (!responseText && !documentUrl)) return;

        respondToHelpRequest(selectedReqId, responseText, documentUrl);

        toast({ title: "Response Sent", description: "Your response has been sent to the employer." });
        setResponseText("");
        setDocumentUrl("");
        setSelectedReqId(null);
        setIsDialogOpen(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Employer Help Requests</h1>
                    <p className="text-slate-500 mt-2">View and respond to queries or document requests from potential employers.</p>
                </div>

                <div className="space-y-4 max-w-4xl mx-auto">
                    {requests.length > 0 ? (
                        requests.map((req) => (
                            <Card key={req.id} className="border-l-4 border-l-blue-500 shadow-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                {req.employerName}
                                                {req.status === 'open' && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Action Required</Badge>}
                                                {req.status === 'responded' && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><Check className="w-3 h-3 mr-1" /> Responded</Badge>}
                                            </CardTitle>
                                            <CardDescription>
                                                Received: {new Date(req.timestamp).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-slate-50 p-4 rounded-lg text-slate-700 mb-4 text-sm">
                                        <span className="font-semibold block mb-1 text-slate-900">Request:</span>
                                        {req.requestDetails}
                                    </div>

                                    {req.status === 'open' ? (
                                        <Dialog open={isDialogOpen && selectedReqId === req.id} onOpenChange={(open) => {
                                            setIsDialogOpen(open);
                                            if (open) {
                                                setSelectedReqId(req.id);
                                                setDocumentUrl("");
                                                setResponseText("");
                                            }
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="gap-2">
                                                    <MessageSquare className="h-4 w-4" />
                                                    Respond
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Respond to {req.employerName}</DialogTitle>
                                                    <DialogDescription>
                                                        Provide the requested information or clarification.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="py-4">
                                                    <Textarea
                                                        placeholder="Type your response here..."
                                                        value={responseText}
                                                        onChange={(e) => setResponseText(e.target.value)}
                                                        rows={5}
                                                    />
                                                    <div className="mt-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-sm font-medium">Attach Document (Optional)</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="relative flex-1">
                                                                <input
                                                                    type="file"
                                                                    onChange={handleFileChange}
                                                                    disabled={uploading}
                                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                                />
                                                            </div>
                                                            {uploading && <Loader2 className="animate-spin h-5 w-5 text-blue-600" />}
                                                        </div>
                                                        {documentUrl && !uploading && (
                                                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                                                <Check className="w-3 h-3" /> File attached successfully
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={handleRespond} className="bg-blue-600">Send Response</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    ) : (
                                        <div className="border-t pt-3 mt-2">
                                            <div className="text-xs text-muted-foreground italic">
                                                <span className="block mb-1">You responded on {req.responseTimestamp ? new Date(req.responseTimestamp).toLocaleDateString() : ""}:</span>
                                                {req.studentResponse && <span className="block mb-1">"{req.studentResponse}"</span>}
                                                {req.responseDocumentUrl && (
                                                    <a
                                                        href={req.responseDocumentUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline flex items-center gap-1 mt-1 not-italic"
                                                    >
                                                        <FileText className="w-3 h-3" />
                                                        View Attached Document <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
                            <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-slate-900">No Requests</h3>
                            <p className="text-slate-500">You haven't received any help requests from employers yet.</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
