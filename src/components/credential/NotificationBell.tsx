import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useVerificationStore, RequestStatus } from "@/stores/useVerificationStore";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function NotificationBell() {
    const { requests, currentUserRole, approveRequest, rejectRequest } = useVerificationStore();

    // Filter notifications based on role
    // Student sees "Pending" requests directed at them (Mock: Any pending request)
    // University sees newly created requests (Or we just show audit log link?)
    // Employer sees "Approved/Rejected" updates

    let notifications = [];

    if (currentUserRole === 'student') {
        notifications = requests.filter(r => r.status === 'pending');
    } else if (currentUserRole === 'employer') {
        notifications = requests.filter(r => r.status !== 'pending'); // See updates
    }

    // Sort by time
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const handleAction = (id: string, action: 'approve' | 'reject', employerName: string) => {
        if (action === 'approve') {
            approveRequest(id);
            toast.success(`Access granted to ${employerName}`);
        } else {
            rejectRequest(id);
            toast.error(`Access request rejected`);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[350px]">
                <DropdownMenuLabel>Notifications ({currentUserRole})</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No new notifications.
                    </div>
                ) : (
                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.map(n => (
                            <div key={n.id} className="p-3 border-b last:border-0 hover:bg-muted/50">
                                {currentUserRole === 'student' ? (
                                    <div className="space-y-2">
                                        <p className="text-sm">
                                            <span className="font-bold">{n.employerName}</span> requested access to your <span className="font-mono">{n.requestedFields.join(", ")}</span>.
                                        </p>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleAction(n.id, 'approve', n.employerName)} className="w-full bg-green-600 hover:bg-green-700 h-7 text-xs">
                                                Approve
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => handleAction(n.id, 'reject', n.employerName)} className="w-full h-7 text-xs">
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    // Employer View
                                    <div>
                                        <p className="text-sm">
                                            Request for <span className="font-bold">{n.studentName}</span> was
                                            {n.status === 'approved' ? (
                                                <Badge variant="outline" className="ml-1 text-green-600 border-green-200">Approved</Badge>
                                            ) : (
                                                <Badge variant="outline" className="ml-1 text-red-600 border-red-200">Rejected</Badge>
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(n.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
