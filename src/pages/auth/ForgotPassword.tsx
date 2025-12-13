import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_OTP } from '../../types/auth';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [emailOtp, setEmailOtp] = useState("");
    const [mobileOtp, setMobileOtp] = useState(""); // Second OTP state

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API
        await new Promise(r => setTimeout(r, 1000));
        setIsLoading(false);
        setStep(2);
        toast.success(`OTP sent to ${email} and ${phone}`);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 1000));

        // Use standard mock OTP for both for simplicity, or we could require different ones.
        // For now, let's assume standard "123456" for both to make testing easy for the user.
        if (emailOtp === MOCK_OTP && mobileOtp === MOCK_OTP) {
            toast.success("Password reset link sent to your email!");
            // Logic ends here for mock
        } else {
            toast.error("Invalid OTPs. Please check both.");
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Link to="/login">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <CardTitle>Reset Password</CardTitle>
                    </div>
                    <CardDescription>
                        {step === 1 ? "Enter your details to receive verification codes." : "Enter the separate codes sent to your email and phone."}
                    </CardDescription>
                </CardHeader>
                <form onSubmit={step === 1 ? handleSendOtp : handleVerifyOtp}>
                    <CardContent className="space-y-6"> {/* Increased gap from space-y-4 to space-y-6 */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={step === 2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+91 98765 43210"
                                required
                                disabled={step === 2}
                            />
                        </div>
                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email-otp">Email OTP</Label>
                                    <Input
                                        id="email-otp"
                                        type="text"
                                        value={emailOtp}
                                        onChange={(e) => setEmailOtp(e.target.value)}
                                        placeholder="Enter Email OTP (123456)"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mobile-otp">Mobile OTP</Label>
                                    <Input
                                        id="mobile-otp"
                                        type="text"
                                        value={mobileOtp}
                                        onChange={(e) => setMobileOtp(e.target.value)}
                                        placeholder="Enter Mobile OTP (123456)"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500">Please enter the codes sent to your registered Email and Phone Number respectively.</p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {step === 1 ? "Send OTPs" : "Verify & Reset"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default ForgotPassword;
