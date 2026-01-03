import { cn } from "@/lib/utils";

interface FieldChipProps {
    label: string;
    className?: string;
}

export function FieldChip({ label, className }: FieldChipProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20 transition-all",
                className
            )}
        >
            {label}
        </span>
    );
}
