import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, ExternalLink } from "lucide-react";

interface CrossInstitutionStateProps {
    currentInstitutionName: string;
    correctInstitutionName: string;
    correctInstitutionSubdomain: string;
    enrollmentNumberMasked: string;
}

export function CrossInstitutionState({
    currentInstitutionName,
    correctInstitutionName,
    correctInstitutionSubdomain,
    enrollmentNumberMasked,
}: CrossInstitutionStateProps) {
    return (
        <div className="container mx-auto px-4 max-w-3xl py-12">
            <Card className="p-8 text-center">
                <div className="bg-muted/10 p-4 rounded-lg mb-6">
                    <Building2 className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-4">
                        This Enrollment Number Belongs to Another Institution
                    </h1>
                    <div className="text-left max-w-2xl mx-auto space-y-4">
                        <p className="text-muted-foreground">
                            This enrollment number is valid, but it is not associated with{" "}
                            <span className="font-semibold text-foreground">{currentInstitutionName}</span>.
                        </p>
                        <p className="text-muted-foreground">
                            It belongs to{" "}
                            <span className="font-semibold text-foreground">{correctInstitutionName}</span>.
                        </p>
                        <p className="text-muted-foreground">
                            To view this credential, please visit that institution's official verification portal.
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-2">Enrollment Number</p>
                    <p className="font-mono font-semibold text-lg">{enrollmentNumberMasked}</p>
                </div>

                <Button
                    size="lg"
                    onClick={() => window.location.href = `https://${correctInstitutionSubdomain}`}
                    className="gap-2"
                >
                    Go to {correctInstitutionName} Portal
                    <ExternalLink className="w-4 h-4" />
                </Button>
            </Card>
        </div>
    );
}
