import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, XCircle, Clock } from "lucide-react";

type StatusType = "valid" | "invalid" | "revoked" | "expired" | "pending" | "active";

interface StatusChipProps {
    status: StatusType;
    className?: string;
}

const statusConfig = {
    valid: {
        label: "Valid",
        icon: CheckCircle2,
        className: "bg-success/10 text-success border-success/20",
    },
    active: {
        label: "Active",
        icon: CheckCircle2,
        className: "bg-success/10 text-success border-success/20",
    },
    invalid: {
        label: "Invalid",
        icon: XCircle,
        className: "bg-destructive/10 text-destructive border-destructive/20",
    },
    revoked: {
        label: "Revoked",
        icon: AlertCircle,
        className: "bg-warning/10 text-warning border-warning/20",
    },
    expired: {
        label: "Expired",
        icon: Clock,
        className: "bg-muted text-muted-foreground border-border",
    },
    pending: {
        label: "Pending",
        icon: Clock,
        className: "bg-primary/10 text-primary border-primary/20",
    },
};

export function StatusChip({ status, className }: StatusChipProps) {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all",
                config.className,
                className
            )}
        >
            <Icon className="w-3.5 h-3.5" />
            {config.label}
        </span>
    );
}
