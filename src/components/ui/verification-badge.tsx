import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VerificationBadgeProps {
    verified: boolean;
    className?: string;
    showTooltip?: boolean;
}

export function VerificationBadge({ verified, className, showTooltip = true }: VerificationBadgeProps) {
    const badge = (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all",
                verified
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-muted text-muted-foreground border-border",
                className
            )}
        >
            {verified ? (
                <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Employer
                </>
            ) : (
                <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    Non-verified Employer
                </>
            )}
        </span>
    );

    if (!showTooltip) {
        return badge;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {badge}
                </TooltipTrigger>
                <TooltipContent>
                    <p>
                        {verified
                            ? "Verified by Open Campus"
                            : "This employer has not completed verification yet"}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
