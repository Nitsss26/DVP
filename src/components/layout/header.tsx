import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Menu, LayoutDashboard, LogOut, User as UserIcon, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/credential/NotificationBell";
import { useAuth } from "@/context/AuthContext";
import { GrantAccessModal } from "./GrantAccessModal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);

    const isInstitute = currentUser?.role === 'institute';
    const isStudent = currentUser?.role === 'student';
    const isEmployer = currentUser?.role === 'employer';

    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-6">
                    <Link to="/" className="flex items-center gap-3 font-bold text-lg hover:opacity-90 transition-opacity">
                        <img
                            src="/barkatullah.png"
                            alt="Barkatullah University"
                            className="w-10 h-10 rounded-lg"
                        />
                        <span className="text-slate-800 hidden sm:inline">Barkatullah University</span>
                        <span className="text-slate-800 sm:hidden">BU Bhopal</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <nav className="hidden md:flex items-center gap-6 mr-4">
                            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                                Home
                            </Link>

                            {/* INSTITUTE NAGIVATION */}
                            {isInstitute && (
                                <>
                                    <Link to="/registry" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                                        Registry
                                    </Link>
                                    <Link to="/access-logs" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                                        Access Logs
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
                                        onClick={() => setIsGrantModalOpen(true)}
                                    >
                                        <Shield className="h-4 w-4" />
                                        Grant Access
                                    </Button>
                                </>
                            )}

                            {/* STUDENT NAVIGATION */}
                            {isStudent && (
                                <>
                                    <Link to="/verify/R158237200015" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                                        My Profile
                                    </Link>
                                    <Link to="/student/grants" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                                        My Grants
                                    </Link>
                                </>
                            )}

                            {/* EMPLOYER NAVIGATION */}
                            {isEmployer && (
                                <>
                                    <Link to="/employer/profile" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                                        My Profile
                                    </Link>
                                    <Link to="/employer/requests" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                                        My Requests
                                    </Link>
                                </>
                            )}
                        </nav>

                        <div className="h-5 w-px bg-slate-200 hidden md:block" />

                        <div className="flex items-center gap-2">
                            {/* Notifications */}
                            <NotificationBell />

                            {currentUser ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-gray-100 ring-2 ring-white">
                                            <span className="font-bold text-blue-600">
                                                {currentUser.name.charAt(0).toUpperCase()}
                                            </span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="end">
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                                                <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                                                <span className="text-xs font-semibold px-2 py-0.5 mt-1 rounded bg-blue-100 text-blue-800 w-fit capitalize">
                                                    {currentUser.role}
                                                </span>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />

                                        {isStudent && (
                                            <DropdownMenuItem onClick={() => navigate('/verify/R158237200015')}>
                                                <UserIcon className="mr-2 h-4 w-4" />
                                                <span>My Profile</span>
                                            </DropdownMenuItem>
                                        )}
                                        {isEmployer && (
                                            <DropdownMenuItem onClick={() => navigate('/employer/profile')}>
                                                <UserIcon className="mr-2 h-4 w-4" />
                                                <span>My Profile</span>
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={logout} className="text-red-600">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Log out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link to="/login">
                                        <Button variant="ghost" size="sm">Log in</Button>
                                    </Link>
                                    <Link to="/signup">
                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Sign up</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <GrantAccessModal open={isGrantModalOpen} onOpenChange={setIsGrantModalOpen} />
        </>
    );
}

