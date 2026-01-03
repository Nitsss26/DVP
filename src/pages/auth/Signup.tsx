import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ArrowLeft, CheckCircle, Eye, EyeOff, AlertCircle, UserCheck } from 'lucide-react';
import { MOCK_OTP, User } from '../../types/auth';
import { toast } from 'sonner';

const Signup = () => {
    const navigate = useNavigate();
    const { registerUser } = useAuth();

    // State
    const [step, setStep] = useState<'role' | 'form' | 'verify' | 'password'>('role');
    const [role, setRole] = useState<'student' | 'employer'>('student');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Student Verification State
    const [studentFound, setStudentFound] = useState<boolean | null>(null);
    const [fetchedName, setFetchedName] = useState<string>('');

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        enrollmentNo: '',
        dob: '',
        companyName: '',
        designation: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: ''
    });

    const [otpData, setOtpData] = useState({
        emailOtp: '',
        sent: false
    });

    // Auto-fetch student name when enrollment number and DOB are entered
    useEffect(() => {
        const verifyStudentIdentity = async () => {
            if (role === 'student' && formData.enrollmentNo && formData.dob) {
                // Use backend API instead of Mock Data
                try {
                    const res = await fetch(`${API_BASE_URL}/api/public/registry?enrollment=${formData.enrollmentNo}`);
                    const data = await res.json();

                    if (data.students && data.students.length > 0) {
                        const student = data.students[0];

                        // Verify DOB
                        // DB DOB Format: DD/MM/YYYY typically
                        // Input DOB: YYYY-MM-DD
                        const [yyyy, mm, dd] = formData.dob.split('-');
                        const formattedInputDOB = `${dd}/${mm}/${yyyy}`;
                        const dataDOB = student.Details?.Profile?.DOB;

                        if (formattedInputDOB === dataDOB) {
                            setStudentFound(true);
                            setFetchedName(student.Details.Profile.StudentName);
                            setFormData(prev => ({ ...prev, name: student.Details.Profile.StudentName }));
                        } else {
                            // DOB Mismatch
                            setStudentFound(false);
                            setFetchedName('');
                            setFormData(prev => ({ ...prev, name: '' }));
                        }
                    } else {
                        // Not Found
                        setStudentFound(false);
                        setFetchedName('');
                        setFormData(prev => ({ ...prev, name: '' }));
                    }

                } catch (error) {
                    console.error("Verification Check Failed", error);
                    setStudentFound(false);
                }
            } else {
                setStudentFound(null);
                setFetchedName('');
            }
        };

        const timer = setTimeout(() => {
            verifyStudentIdentity();
        }, 800); // Debounce

        return () => clearTimeout(timer);
    }, [formData.enrollmentNo, formData.dob, role]);

    const handleSendOtps = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // For student, verify record was found
        if (role === 'student' && !studentFound) {
            toast.error("Please enter valid Enrollment Number and Date of Birth.");
            setIsLoading(false);
            return;
        }

        // Call Send OTP API
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });

            if (!res.ok) {
                const text = await res.text();
                let errMsg = "Failed to send OTP";
                try {
                    const err = JSON.parse(text);
                    errMsg = err.message || errMsg;
                } catch (e) {
                    errMsg = `Server Error (${res.status}): ${text.substring(0, 50)}`;
                }
                toast.error(errMsg);
                setIsLoading(false);
                return;
            }

            const data = await res.json();

            setOtpData({ ...otpData, sent: true });
            setStep('verify');

            if (data.debugOtp) {
                // FALLBACK DISPLAY (Demo Mode)
                toast.success(`OTP Generated: ${data.debugOtp}`, {
                    duration: 15000,
                    action: {
                        label: 'Copy',
                        onClick: () => navigator.clipboard.writeText(data.debugOtp)
                    }
                });
            } else {
                toast.success(`OTP sent to ${formData.email}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Verify OTPs and move to password step
    const handleVerifyOtps = async () => {
        setIsLoading(true);

        try {
            // Verify Email OTP
            const emailRes = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    otp: otpData.emailOtp
                })
            });

            if (!emailRes.ok) {
                const err = await emailRes.json();
                toast.error(err.message || "Invalid Email OTP");
                setIsLoading(false);
                return;
            }

            // If Employer, previously verified Mobile OTP (Mock). Now removed as per request.
            // Mobile OTP verification logic deleted.

            toast.success("Verification Successful! Now create your password.");
            setStep('password');

        } catch (error) {
            console.error(error);
            toast.error("Verification failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Create password and complete registration
    const handleCreatePassword = async () => {
        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        setIsLoading(true);

        const newUser: User = {
            uid: `${role}_${Date.now()}`,
            email: formData.email,
            name: formData.name,
            role: role,
            phone: formData.mobile || undefined,
            password: formData.password,
            ...(role === 'employer' ? {
                companyName: formData.companyName,
                designation: formData.designation
            } : {
                enrollmentNo: formData.enrollmentNo,
                dob: formData.dob
            })
        };

        try {
            await registerUser(newUser);
            toast.success("Account created successfully! You can now log in.");
            navigate('/login');
        } catch (error: any) {
            toast.error(error.message || "Registration failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Render Steps
    const renderRoleSelection = () => (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle>Choose Account Type</CardTitle>
                <CardDescription>Select your role to proceed with registration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <RadioGroup defaultValue="student" onValueChange={(v) => setRole(v as any)} className="grid grid-cols-2 gap-4">
                    <div>
                        <RadioGroupItem value="student" id="student" className="peer sr-only" />
                        <Label
                            htmlFor="student"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:text-blue-600 cursor-pointer text-center h-full"
                        >
                            <span className="text-xl font-bold mb-2">Student</span>
                            <span className="text-xs text-center text-gray-500">Access your academic profile & records</span>
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="employer" id="employer" className="peer sr-only" />
                        <Label
                            htmlFor="employer"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:text-blue-600 cursor-pointer text-center h-full"
                        >
                            <span className="text-xl font-bold mb-2">Employer</span>
                            <span className="text-xs text-center text-gray-500">Verify credentials & search registry</span>
                        </Label>
                    </div>
                </RadioGroup>
            </CardContent>
            <CardFooter>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base" onClick={() => setStep('form')}>Continue</Button>
            </CardFooter>
        </Card>
    );

    const renderStudentForm = () => (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle>Student Registration</CardTitle>
                <CardDescription>Verify your identity using your enrollment details.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSendOtps}>
                <CardContent className="space-y-5">
                    {/* Error Banner when student not found */}
                    {studentFound === false && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-red-800">No Record Found</p>
                                <p className="text-xs text-red-600 mt-1">
                                    The enrollment number or date of birth doesn't match our records.
                                    Please verify your details or contact the institute for assistance.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Success Banner when student found */}
                    {studentFound === true && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                            <UserCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-green-800">Identity Verified</p>
                                <p className="text-xs text-green-600 mt-1">
                                    Your record has been found. Please verify your name below.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 1. Enrollment Number */}
                    <div className="space-y-2">
                        <Label htmlFor="enrollment">Enrollment Number</Label>
                        <Input
                            id="enrollment"
                            required
                            value={formData.enrollmentNo}
                            onChange={e => setFormData({ ...formData, enrollmentNo: e.target.value.toUpperCase() })}
                            placeholder="R158237200015"
                            className="h-11 font-mono"
                        />
                    </div>

                    {/* 2. Date of Birth */}
                    <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input
                            id="dob"
                            type="date"
                            required
                            value={formData.dob}
                            onChange={e => setFormData({ ...formData, dob: e.target.value })}
                            className="h-11"
                        />
                    </div>

                    {/* 3. Full Name (Auto-fetched) */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            required
                            value={formData.name}
                            readOnly
                            placeholder={studentFound === false ? "Enter valid enrollment details above" : "Will be auto-filled"}
                            className={`h-11 ${studentFound ? 'bg-green-50 border-green-300 font-semibold' : 'bg-gray-50'}`}
                        />
                        {studentFound && (
                            <p className="text-xs text-green-600">✓ Name verified from university records</p>
                        )}
                    </div>

                    {/* 4. Email Address */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Email"
                            className="h-11"
                            disabled={!studentFound}
                        />
                        <p className="text-xs text-gray-500">OTP will be sent to this email for verification</p>
                    </div>

                    {/* 5. Phone Number */}
                    <div className="space-y-2">
                        <Label htmlFor="mobile">Phone Number</Label>
                        <Input
                            id="mobile"
                            type="tel"
                            required
                            value={formData.mobile}
                            onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                            placeholder="9876543210"
                            className="h-11"
                            disabled={!studentFound}
                        />
                        <p className="text-xs text-gray-500">OTP will be sent to this number (Demo: use 123456)</p>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-6">
                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base shadow-md"
                        disabled={isLoading || !studentFound}
                    >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Send OTP
                    </Button>
                    <Button variant="ghost" onClick={() => { setStep('role'); setStudentFound(null); }} className="w-full h-11">Back</Button>
                </CardFooter>
            </form>
        </Card>
    );

    const renderEmployerForm = () => (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle>Employer Registration</CardTitle>
                <CardDescription>Enter your company details to create an account.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSendOtps}>
                <CardContent className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Mohit Sharma" className="h-11" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="company">Company Name</Label>
                        <Input id="company" required value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} placeholder="Tech Corp" className="h-11" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="designation">Designation</Label>
                        <Input id="designation" required value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} placeholder="HR Manager" className="h-11" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="mohits@company.com" className="h-11" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <Input id="mobile" required value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} placeholder="9876543210" className="h-11" />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-6">
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base shadow-md" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Send OTPs
                    </Button>
                    <Button variant="ghost" onClick={() => setStep('role')} className="w-full h-11">Back</Button>
                </CardFooter>
            </form>
        </Card>
    );

    const renderVerification = () => (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                    <Button variant="ghost" size="icon" onClick={() => setStep('form')}><ArrowLeft className="h-4 w-4" /></Button>
                    <CardTitle>Verify Your Email</CardTitle>
                </div>
                <CardDescription>
                    Enter the OTP sent to {formData.email}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Email OTP</Label>
                    <Input
                        value={otpData.emailOtp}
                        onChange={e => setOtpData({ ...otpData, emailOtp: e.target.value })}
                        placeholder="Enter 6-digit Code"
                        className="h-11 text-center font-mono text-lg tracking-widest"
                    />
                </div>


            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base" onClick={handleVerifyOtps} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Verify OTP
                </Button>
            </CardFooter>
        </Card>
    );

    const renderPasswordCreation = () => (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                    <Button variant="ghost" size="icon" onClick={() => setStep('verify')}><ArrowLeft className="h-4 w-4" /></Button>
                    <CardTitle>Create Your Password</CardTitle>
                </div>
                <CardDescription>Set a secure password to protect your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                        <Input
                            id="newPassword"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Enter your password"
                            className="h-11 pr-10"
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
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                            placeholder="Confirm your password"
                            className="h-11 pr-10"
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
            <CardFooter className="flex flex-col space-y-4 pt-4">
                <Button className="w-full bg-green-600 hover:bg-green-700 h-11 text-base" onClick={handleCreatePassword} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    Create Account
                </Button>
            </CardFooter>
        </Card>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-lg space-y-8 flex flex-col items-center">
                <div className="text-center">
                    <img src="/barkatullah.png" alt="Logo" className="mx-auto h-20 w-20" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">Create your account</h2>
                </div>

                {step === 'role' && renderRoleSelection()}
                {step === 'form' && role === 'student' && renderStudentForm()}
                {step === 'form' && role === 'employer' && renderEmployerForm()}
                {step === 'verify' && renderVerification()}
                {step === 'password' && renderPasswordCreation()}

                <div className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-500">
                        Log in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
