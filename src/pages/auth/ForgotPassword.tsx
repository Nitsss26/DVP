import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Mail, ShieldCheck, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_OTP } from '../../types/auth';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { findUser, updateUserPassword } = useAuth();

    const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Step 1: Send OTP to email
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Check if user exists
        const user = findUser(email);
        if (!user) {
            toast.error("No account found with this email address.");
            setIsLoading(false);
            return;
        }

        await new Promise(r => setTimeout(r, 1000));
        setIsLoading(false);
        setStep('otp');
        toast.success(`OTP sent to ${email}`);
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 1000));

        if (otp === MOCK_OTP) {
            toast.success("OTP verified! Create your new password.");
            setStep('password');
        } else {
            toast.error("Invalid OTP. Please try again. (Hint: 123456)");
        }
        setIsLoading(false);
    };

    // Step 3: Create new password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        setIsLoading(true);
        await new Promise(r => setTimeout(r, 1000));

        // Update password in context
        if (updateUserPassword) {
            updateUserPassword(email, newPassword);
        }

        toast.success("Password reset successfully! Please login with your new password.");
        navigate('/login');
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <img src="/barkatullah.png" alt="Logo" className="mx-auto h-20 w-20" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">Reset Password</h2>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            {step !== 'email' && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setStep(step === 'password' ? 'otp' : 'email')}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            )}
                            <CardTitle>
                                {step === 'email' && "Enter Your Email"}
                                {step === 'otp' && "Verify OTP"}
                                {step === 'password' && "Create New Password"}
                            </CardTitle>
                        </div>
                        <CardDescription>
                            {step === 'email' && "We'll send a verification code to your email."}
                            {step === 'otp' && `Enter the OTP sent to ${email}`}
                            {step === 'password' && "Choose a strong password for your account."}
                        </CardDescription>
                    </CardHeader>

                    {/* Step 1: Email */}
                    {step === 'email' && (
                        <form onSubmit={handleSendOtp}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Registered Email / Mobile Number</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter registered email or mobile number"
                                            className="pl-10 h-11"
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4 pt-6">
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Send OTP
                                </Button>
                                <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 text-center">
                                    ← Back to Login
                                </Link>
                            </CardFooter>
                        </form>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 'otp' && (
                        <form onSubmit={handleVerifyOtp}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="otp">Enter OTP (Hint: 123456)</Label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
                                        <Input
                                            id="otp"
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="123456"
                                            className="pl-10 h-11 text-center font-mono text-lg tracking-widest"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 text-center">
                                        Didn't receive? <button type="button" className="text-blue-600 hover:underline" onClick={() => toast.info("OTP resent!")}>Resend OTP</button>
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Verify OTP
                                </Button>
                            </CardFooter>
                        </form>
                    )}

                    {/* Step 3: Create New Password */}
                    {step === 'password' && (
                        <form onSubmit={handleResetPassword}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="newPassword"
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            className="pl-10 h-11 pr-10"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500">Must be at least 6 characters</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            className="pl-10 h-11 pr-10"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-6">
                                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-12 text-base " disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                    Reset Password
                                </Button>
                            </CardFooter>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;
