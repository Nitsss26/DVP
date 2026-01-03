import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface GrantAccessModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GrantAccessModal({ open, onOpenChange }: GrantAccessModalProps) {
    const { grantAccess, grantedEmails, revokeAccess } = useAuth();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 800));

        grantAccess(email);
        toast.success(`Access granted for ${email}`);

        setIsLoading(false);
        setEmail('');
        // Keep modal open to add more or close? keeping open is actionable.
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                        Grant Portal Access
                    </DialogTitle>
                    <DialogDescription>
                        Authorize a new email address to access the Institute Portal via OTP authentication.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="col-span-3"
                                placeholder="staff@example.com"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                            Grant Access
                        </Button>
                    </DialogFooter>
                </form>

                <div className="border-t pt-4 mt-2">
                    <Label className="mb-3 block font-semibold text-gray-700">Granted Emails</Label>
                    {grantedEmails.length === 0 ? (
                        <p className="text-sm text-gray-500 italic text-center py-2">No emails granted access yet.</p>
                    ) : (
                        <ul className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                            {grantedEmails.map((emailStr) => (
                                <li key={emailStr} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md border border-gray-100">
                                    <span className="text-sm text-gray-700 truncate max-w-[280px]" title={emailStr}>{emailStr}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => {
                                            revokeAccess(emailStr);
                                            toast.success(`Access revoked for ${emailStr}`);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </DialogContent>
        </Dialog >
    );
}
