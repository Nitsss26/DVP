import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useConcernStore } from "@/stores/useConcernStore";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Check } from "lucide-react";
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
    const { getHelpRequestsForStudent, respondToHelpRequest } = useConcernStore();

    const studentEnrl = currentUser?.uid || "R158237200015";
    const requests = getHelpRequestsForStudent(studentEnrl);

    const [responseText, setResponseText] = useState("");
    const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleRespond = () => {
        if (!selectedReqId || !responseText) return;

        respondToHelpRequest(selectedReqId, responseText);

        toast({ title: "Response Sent", description: "Your response has been sent to the employer." });
        setResponseText("");
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
                                            if (open) setSelectedReqId(req.id);
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
                                                        placeholder="Type your response here or paste a link to the document..."
                                                        value={responseText}
                                                        onChange={(e) => setResponseText(e.target.value)}
                                                        rows={5}
                                                    />
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={handleRespond} className="bg-blue-600">Send Response</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    ) : (
                                        <div className="border-t pt-3 mt-2">
                                            <p className="text-xs text-muted-foreground italic">
                                                You responded on {req.responseTimestamp ? new Date(req.responseTimestamp).toLocaleDateString() : ""}: "{req.studentResponse}"
                                            </p>
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
