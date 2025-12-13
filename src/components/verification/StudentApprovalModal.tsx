import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useVerificationStore, AccessRequest } from "@/stores/useVerificationStore";
import { toast } from "sonner";
import { Building2, CheckCircle, Info } from "lucide-react";

interface StudentApprovalModalProps {
    request: AccessRequest;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function StudentApprovalModal({ request, open, onOpenChange }: StudentApprovalModalProps) {
    const { approveRequest, rejectRequest, updateApprovedFields } = useVerificationStore();

    // State to track which fields the student wants to grant
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    // Is this an edit of an existing approved grant?
    const isEditing = request.status === 'approved';

    useEffect(() => {
        if (open) {
            // For editing approved grants: start with currently approved fields
            // For pending requests: start with all requested fields
            if (isEditing && request.approvedFields?.length > 0) {
                setSelectedItems([...request.approvedFields]);
            } else {
                setSelectedItems([...request.requestedFields]);
            }
        }
    }, [open, request, isEditing]);

    const handleToggle = (item: string) => {
        if (selectedItems.includes(item)) {
            setSelectedItems(selectedItems.filter(i => i !== item));
        } else {
            setSelectedItems([...selectedItems, item]);
        }
    };

    const handleApprove = () => {
        if (selectedItems.length === 0) {
            toast.error("You must select at least one field to approve, or decline the request.");
            return;
        }

        if (isEditing) {
            // Editing an existing grant - use updateApprovedFields
            updateApprovedFields(request.id, selectedItems);
            toast.success(`Access updated! Now sharing ${selectedItems.length} fields.`);
        } else {
            // New approval
            approveRequest(request.id, selectedItems);
            toast.success(`Access granted for ${selectedItems.length} fields!`);
        }
        onOpenChange(false);
    };

    const handleDecline = () => {
        rejectRequest(request.id);
        toast.error("Request declined.");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <TickShieldIcon />
                        <span className="font-semibold text-lg">Approve Credential Request</span>
                    </div>
                </DialogHeader>

                <p className="text-sm text-muted-foreground mb-4">
                    Review the additional private information being requested. Basic credential details (name, degree, university) are already publicly available.
                </p>

                {/* Employer Card */}
                <div className="bg-slate-50 p-4 rounded-xl border mb-6 flex items-start gap-4">
                    <div className="bg-blue-100 p-2.5 rounded-lg">
                        <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{request.employerName}</h3>
                        <p className="text-sm text-muted-foreground">{request.employerEmail}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-medium text-slate-500">Purpose:</span>
                            <Badge variant="secondary" className="bg-slate-200 hover:bg-slate-200 text-slate-700">{request.purpose}</Badge>
                        </div>
                    </div>
                </div>

                {/* Selection List */}
                <div className="mb-6">
                    <h4 className="font-semibold mb-3">Select Information to Share</h4>
                    <div className="space-y-3">
                        {request.requestedFields.map((field) => (
                            <div key={field} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                <Checkbox
                                    checked={selectedItems.includes(field)}
                                    onCheckedChange={() => handleToggle(field)}
                                />
                                <Label className="font-medium cursor-pointer flex-1" onClick={() => handleToggle(field)}>
                                    {field}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Alert */}
                <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-xs flex gap-2 mb-6">
                    <Info className="w-4 h-4 shrink-0" />
                    <p>
                        <span className="font-bold">What happens after approval?</span><br />
                        The employer will be able to verify your credential information immediately. You can revoke access anytime from your dashboard.
                    </p>
                </div>

                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={handleDecline}>Decline Request</Button>
                    <Button className="bg-green-600 hover:bg-green-700 gap-2" onClick={handleApprove}>
                        <CheckCircle className="w-4 h-4" />
                        Approve & Share
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function TickShieldIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
