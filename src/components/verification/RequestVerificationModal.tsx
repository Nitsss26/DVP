import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useVerificationStore } from "@/stores/useVerificationStore";

interface RequestVerificationModalProps {
    studentEnrlNo: string;
    studentName: string;
    onSuccess?: () => void;
}

export function RequestVerificationModal({ studentEnrlNo, studentName, onSuccess }: RequestVerificationModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { currentUser } = useAuth();
    const { requestAccess } = useVerificationStore();

    // Form State
    const [empName, setEmpName] = useState(currentUser?.companyName || currentUser?.name || "");
    const [empEmail, setEmpEmail] = useState(currentUser?.email || "");
    const [purpose, setPurpose] = useState("");

    // Checkboxes
    const [reqEmail, setReqEmail] = useState(false);
    const [reqSubjects, setReqSubjects] = useState(false);
    const [reqPersonal, setReqPersonal] = useState(false);
    const [reqSummary, setReqSummary] = useState(false);

    const handleSubmit = () => {
        if (!currentUser) {
            toast.error("You must be logged in to send a request.");
            return;
        }
        if (!empName || !empEmail || !purpose) {
            toast.error("Please fill all required fields");
            return;
        }

        const requestedFields = [];
        if (reqEmail) requestedFields.push("Contact Information");
        if (reqPersonal) requestedFields.push("Personal Details");
        if (reqSummary) requestedFields.push("Academic Summary & Division");
        if (reqSubjects) requestedFields.push("Detailed Subject Scores");

        // Send request to store
        requestAccess({
            employerId: currentUser.uid,
            employerName: empName,
            employerEmail: empEmail,
            purpose: purpose,
            studentEnrlNo: studentEnrlNo,
            studentName: studentName,
            requestedFields: requestedFields.length > 0 ? requestedFields : ["Basic Verification"]
        });

        toast.success("Verification request sent successfully!");
        setIsOpen(false);
        if (onSuccess) onSuccess();
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4" />
                    Request Verification
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Request Credential Verification</DialogTitle>
                    <p className="text-muted-foreground text-sm">Submit a verification request for a candidate's educational credentials</p>
                </DialogHeader>

                <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto px-1">
                    {/* Employer Details */}
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="empName">Employer Name *</Label>
                            <Input id="empName" placeholder="e.g. ABC Technologies" value={empName} onChange={(e) => setEmpName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="empEmail">Employer Email *</Label>
                            <Input id="empEmail" type="email" placeholder="hr@abc.com" value={empEmail} onChange={(e) => setEmpEmail(e.target.value)} />
                            <p className="text-[10px] text-muted-foreground">Verification results will be sent to this email address</p>
                        </div>
                    </div>

                    {/* Purpose */}
                    <div className="grid gap-2">
                        <Label>Purpose of Verification *</Label>
                        <Select onValueChange={setPurpose}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select purpose" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Hiring">Hiring</SelectItem>
                                <SelectItem value="Internship">Internship</SelectItem>
                                <SelectItem value="Background Check">Background Check</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Readonly Candidate ID */}
                    <div className="grid gap-2">
                        <Label>Candidate Credential ID *</Label>
                        <Input value={studentEnrlNo} disabled className="bg-muted" />
                        <p className="text-[10px] text-muted-foreground">Target candidate's enrollment number</p>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3 border rounded-lg p-4 bg-slate-50">
                        <h4 className="font-semibold text-sm">Additional Data to Request (Optional)</h4>
                        <p className="text-xs text-muted-foreground mb-3">Select which private information you need access to.</p>

                        <div className="flex items-start gap-3">
                            <Checkbox id="req1" checked={reqEmail} onCheckedChange={(c) => setReqEmail(!!c)} />
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="req1" className="font-medium cursor-pointer">Contact Information</Label>
                                <p className="text-muted-foreground text-[10px]">Email address and other contact details</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Checkbox id="reqPersonal" checked={reqPersonal} onCheckedChange={(c) => setReqPersonal(!!c)} />
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="reqPersonal" className="font-medium cursor-pointer">Personal Details</Label>
                                <p className="text-muted-foreground text-[10px]">Father's Name, Mother's Name, DOB, Category</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Checkbox id="reqSummary" checked={reqSummary} onCheckedChange={(c) => setReqSummary(!!c)} />
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="reqSummary" className="font-medium cursor-pointer">Academic Summary & Division</Label>
                                <p className="text-muted-foreground text-[10px]">CGPA, SGPA history, and Final Division/Honours</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Checkbox id="reqSubjects" checked={reqSubjects} onCheckedChange={(c) => setReqSubjects(!!c)} />
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="reqSubjects" className="font-medium cursor-pointer">Detailed Subject Scores</Label>
                                <p className="text-muted-foreground text-[10px]">Detailed breakdown of Theory/Practical marks per semester</p>
                            </div>
                        </div>
                    </div>

                    <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 sticky bottom-0">
                        <Send className="w-4 h-4 mr-2" />
                        Send Verification Request
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
