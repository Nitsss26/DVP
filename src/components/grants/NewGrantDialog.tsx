import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface NewGrantDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const AVAILABLE_FIELDS = [
    { id: "name", label: "Full Name" },
    { id: "roll", label: "Roll Number" },
    { id: "degree", label: "Degree / Program" },
    { id: "university", label: "Issuer (University)" },
    { id: "year", label: "Year of Graduation" },
    { id: "marks", label: "Marks / Grades" },
];

export function NewGrantDialog({ open, onOpenChange }: NewGrantDialogProps) {
    const [step, setStep] = useState(1);
    const [employerName, setEmployerName] = useState("");
    const [employerEmail, setEmployerEmail] = useState("");
    const [selectedFields, setSelectedFields] = useState<string[]>(["name", "degree", "university", "year"]);
    const { toast } = useToast();

    const handleFieldToggle = (fieldId: string) => {
        setSelectedFields(prev =>
            prev.includes(fieldId)
                ? prev.filter(id => id !== fieldId)
                : [...prev, fieldId]
        );
    };

    const handleNext = () => {
        if (step === 1 && (!employerName || !employerEmail)) {
            toast({
                title: "Missing Information",
                description: "Please fill in all employer details.",
                variant: "destructive",
            });
            return;
        }
        setStep(2);
    };

    const handleSubmit = () => {
        if (selectedFields.length === 0) {
            toast({
                title: "No Fields Selected",
                description: "Please select at least one field to share.",
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "✅ Grant Created",
            description: `${employerName} can now verify your credentials.`,
        });

        // Reset and close
        setStep(1);
        setEmployerName("");
        setEmployerEmail("");
        setSelectedFields(["name", "degree", "university", "year"]);
        onOpenChange(false);
    };

    const handleClose = () => {
        setStep(1);
        setEmployerName("");
        setEmployerEmail("");
        setSelectedFields(["name", "degree", "university", "year"]);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                {step === 1 ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Create New Sharing Permission</DialogTitle>
                            <DialogDescription>
                                Enter the employer details who will be able to verify your credentials.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="employer-name">Employer Name</Label>
                                <Input
                                    id="employer-name"
                                    placeholder="e.g. ABC Technologies"
                                    value={employerName}
                                    onChange={(e) => setEmployerName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="employer-email">Employer Email</Label>
                                <Input
                                    id="employer-email"
                                    type="email"
                                    placeholder="hr@abc.com"
                                    value={employerEmail}
                                    onChange={(e) => setEmployerEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button onClick={handleNext}>
                                Next
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Select Information to Share</DialogTitle>
                            <DialogDescription>
                                Choose which details {employerName} can verify when needed.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 py-4">
                            {AVAILABLE_FIELDS.map((field) => (
                                <div key={field.id} className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                                    <Checkbox
                                        id={field.id}
                                        checked={selectedFields.includes(field.id)}
                                        onCheckedChange={() => handleFieldToggle(field.id)}
                                    />
                                    <Label
                                        htmlFor={field.id}
                                        className="flex-1 cursor-pointer font-medium"
                                    >
                                        {field.label}
                                    </Label>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                            You can revoke access anytime in "My Sharing Permissions."
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setStep(1)}>
                                Back
                            </Button>
                            <Button onClick={handleSubmit} variant="success">
                                <CheckCircle2 className="w-4 h-4" />
                                Approve & Share
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
