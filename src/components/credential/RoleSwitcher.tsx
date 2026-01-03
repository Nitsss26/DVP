import { Button } from "@/components/ui/button";
import { UserRole, useVerificationStore } from "@/stores/useVerificationStore";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { UserCircle, Briefcase, GraduationCap, Building2, ChevronDown } from "lucide-react";

import { useNavigate } from "react-router-dom";

export function RoleSwitcher() {
    const { currentUserRole, setRole } = useVerificationStore();
    const navigate = useNavigate();

    const roles: { role: UserRole; label: string; icon: any; defaultPath: string }[] = [
        { role: 'employer', label: 'Employer View', icon: Briefcase, defaultPath: '/employer/requests' },
        { role: 'student', label: 'Student View', icon: GraduationCap, defaultPath: '/student/grants' },
        { role: 'university', label: 'University View', icon: Building2, defaultPath: '/university/logs' },
    ];

    const current = roles.find(r => r.role === currentUserRole) || roles[0];
    const Icon = current.icon;

    const handleRoleChange = (role: UserRole, path: string) => {
        setRole(role);
        navigate(path);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 min-w-[150px] justify-between">
                    <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{current.label}</span>
                    </div>
                    <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Simulate User Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {roles.map((r) => (
                    <DropdownMenuItem
                        key={r.role}
                        onClick={() => handleRoleChange(r.role, r.defaultPath)}
                        className="gap-2"
                    >
                        <r.icon className="w-4 h-4" />
                        {r.label}
                        {currentUserRole === r.role && <div className="ml-auto w-2 h-2 rounded-full bg-green-500" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
