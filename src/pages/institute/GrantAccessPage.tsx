import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Trash2, UserPlus, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GrantAccessPage() {
    const { toast } = useToast();
    const { grantedEmails, grantAccess, revokeAccess } = useAuth();

    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [designation, setDesignation] = useState("");
    const [password, setPassword] = useState(""); // In a real app, this might be auto-generated or handled via invite

    const handleGrant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !name || !designation || !password) {
            toast({
                title: "Validation Error",
                description: "All fields are required.",
                variant: "destructive"
            });
            return;
        }

        try {
            // API call via Context
            await grantAccess({ name, email, designation, password });

            toast({
                title: "Access Granted",
                description: `Access granted to ${name} (${email}).`,
            });

            // Reset form
            setName("");
            setEmail("");
            setDesignation("");
            setPassword("");
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to grant access.",
                variant: "destructive"
            });
        }
    };

    const handleRevoke = async (emailToRevoke: string) => {
        if (confirm(`Are you sure you want to revoke access for ${emailToRevoke}?`)) {
            await revokeAccess(emailToRevoke);
            toast({
                title: "Access Revoked",
                description: `Access for ${emailToRevoke} has been revoked.`,
                variant: "destructive"
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Staff Access Management</h1>
                    <p className="text-slate-500 mt-2">Grant and manage portal access for institute staff members.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Access Form */}
                    <div className="lg:col-span-1">
                        <Card className="border-slate-200 shadow-sm sticky top-24">
                            <CardHeader className="bg-slate-50 border-b border-slate-100">
                                <CardTitle className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5 text-blue-600" />
                                    Grant New Access
                                </CardTitle>
                                <CardDescription>
                                    Add a new staff member to the system.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleGrant} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g. Dr. Deepak"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="designation">Designation</Label>
                                        <Input
                                            id="designation"
                                            placeholder="e.g. Registrar"
                                            value={designation}
                                            onChange={(e) => setDesignation(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="jane@university.edu"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Temporary Password</Label>
                                        <Input
                                            id="password"
                                            type="text"
                                            placeholder="e.g. Temp@123"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <p className="text-xs text-slate-500">Provide this to the staff member for their first login.</p>
                                    </div>

                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-2">
                                        Grant Access
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Staff List */}
                    <div className="lg:col-span-2">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <ShieldCheck className="h-5 w-5 text-green-600" />
                                            Active Staff Members
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            List of all staff members with active access to the portal.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary" className="px-3 py-1">
                                        Total: {grantedEmails.length}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="pl-6">Staff Details</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right pr-6">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {grantedEmails.length > 0 ? (
                                            grantedEmails.map((user: any, index) => (
                                                <TableRow key={index} className="hover:bg-slate-50/50">
                                                    <TableCell className="pl-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-slate-900">
                                                                {user.name}
                                                            </span>
                                                            <span className="text-sm text-slate-500">{user.email}</span>
                                                            {user.designation && <span className="text-xs text-slate-400">{user.designation}</span>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-normal">
                                                            {user.role === 'institute' ? 'Institute Staff' : user.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Active
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                            onClick={() => handleRevoke(user.email)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                                                    No staff members have been granted access yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
