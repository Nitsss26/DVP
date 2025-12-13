import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationBannerProps {
    employerName: string;
    onApprove: () => void;
    onDismiss: () => void;
    className?: string;
}

export function NotificationBanner({
    employerName,
    onApprove,
    onDismiss,
    className,
}: NotificationBannerProps) {
    return (
        <div
            className={cn(
                "fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl mx-4",
                className
            )}
        >
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 shadow-lg backdrop-blur-sm">
                <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-foreground">
                            New Verification Request
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium text-foreground">{employerName}</span> wants to verify your credentials. Review and approve access?
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={onApprove}
                            className="bg-primary hover:bg-primary/90"
                        >
                            Review Request
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onDismiss}
                            className="h-8 w-8 p-0"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
