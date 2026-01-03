import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Building2, ShieldCheck, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ApprovalModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: {
        id: string;
        employerName: string;
        employerEmail: string;
        purpose: string;
        requestedFields: string[];
    };
    onApprove: (requestId: string, selectedFields: string[]) => void;
    onDecline: (requestId: string) => void;
}

const FIELD_LABELS: Record<string, string> = {
    email: "Email Address",
    subjects: "Individual Subjects and Scores",
    division: "Division Reached (Honours Level)",
};

export function ApprovalModal({
    open,
    onOpenChange,
    request,
    onApprove,
    onDecline,
}: ApprovalModalProps) {
    const [selectedFields, setSelectedFields] = useState<string[]>(
        request.requestedFields
    );
    const { toast } = useToast();

    const handleFieldToggle = (fieldId: string) => {
        setSelectedFields((prev) =>
            prev.includes(fieldId)
                ? prev.filter((id) => id !== fieldId)
                : [...prev, fieldId]
        );
    };

    const handleApprove = () => {
        if (selectedFields.length === 0) {
            toast({
                title: "No Fields Selected",
                description: "Please select at least one field to share.",
                variant: "destructive",
            });
            return;
        }

        onApprove(request.id, selectedFields);
        toast({
            title: "✅ Request Approved",
            description: `${request.employerName} can now verify your credentials.`,
        });
        onOpenChange(false);
    };

    const handleDecline = () => {
        onDecline(request.id);
        toast({
            title: "Request Declined",
            description: `Verification request from ${request.employerName} has been declined.`,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        Approve Credential Request
                    </DialogTitle>
                    <DialogDescription>
                        Review the additional private information being requested. Basic credential details (name, degree, university, graduation year) are already publicly available.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Employer Info */}
                    <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="font-semibold text-foreground">
                                    {request.employerName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {request.employerEmail}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Purpose:</span>
                            <Badge variant="secondary">{request.purpose}</Badge>
                        </div>
                    </div>

                    {/* Field Selection */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">
                            Select Information to Share
                        </Label>
                        <div className="space-y-2">
                            {request.requestedFields.map((field) => (
                                <div
                                    key={field}
                                    className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                                >
                                    <Checkbox
                                        id={field}
                                        checked={selectedFields.includes(field)}
                                        onCheckedChange={() => handleFieldToggle(field)}
                                    />
                                    <Label
                                        htmlFor={field}
                                        className="flex-1 cursor-pointer font-medium"
                                    >
                                        {FIELD_LABELS[field] || field}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Info Notice */}
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 flex gap-2">
                        <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div className="text-sm text-muted-foreground">
                            <p className="font-medium text-foreground mb-1">
                                What happens after approval?
                            </p>
                            <p>
                                The employer will be able to verify your credential information.
                                You can revoke access anytime from your "My Grants" dashboard.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={handleDecline}>
                        Decline Request
                    </Button>
                    <Button onClick={handleApprove} variant="success">
                        <CheckCircle2 className="w-4 h-4" />
                        Approve & Share
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
