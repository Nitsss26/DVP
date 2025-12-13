import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { MOCK_OTP, User } from '../../types/auth';
import { toast } from 'sonner';
import { STUDENTS_DATA } from '../../data/mockData';

const Signup = () => {
    const navigate = useNavigate();
    const { registerUser } = useAuth();

    // State
    const [step, setStep] = useState<'role' | 'form' | 'verify'>('role');
    const [role, setRole] = useState<'student' | 'employer'>('student');
    const [isLoading, setIsLoading] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        enrollmentNo: '',
        dob: '',
        companyName: '',
        designation: '',
        email: '',
        mobile: '',
        password: '123456' // Default as per requirement
    });

    const [otpData, setOtpData] = useState({
        emailOtp: '',
        mobileOtp: '',
        sent: false
    });

    // Student Validation Check
    const validateStudentIdentity = () => {
        // Find student by Enrollment No using the helper or direct array search
        const student = STUDENTS_DATA.find(s => s.EnrlNo === formData.enrollmentNo);

        if (!student) {
            toast.error("Enrollment Number not found in University Records.");
            return false;
        }

        // 1. Name Check (First & Last Name loose match)
        // Data format: "FIRST MIDDLE LAST" or "FIRST LAST"
        const dataName = student.Details.Profile.StudentName.trim().toLowerCase();
        const inputName = formData.name.trim().toLowerCase();

        const dataParts = dataName.split(/\s+/);
        const inputParts = inputName.split(/\s+/);

        const dataFirst = dataParts[0];
        const dataLast = dataParts[dataParts.length - 1];

        const inputFirst = inputParts[0];
        const inputLast = inputParts[inputParts.length - 1];

        const isNameMatch = (dataFirst === inputFirst) && (dataLast === inputLast);

        // 2. DOB Check
        // Input format: YYYY-MM-DD
        // Data format: DD/MM/YYYY
        const [yyyy, mm, dd] = formData.dob.split('-');
        const formattedInputDOB = `${dd}/${mm}/${yyyy}`;
        const dataDOB = student.Details.Profile.DOB;

        const isDobMatch = formattedInputDOB === dataDOB;

        if (!isNameMatch) {
            toast.error("Name mismatch! First and Last name must match university records.");
            return false;
        }

        if (!isDobMatch) {
            toast.error("Date of Birth mismatch! Please check your DOB.");
            return false;
        }

        return true;
    };

    const handleSendOtps = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Validation Logic
        if (role === 'student' && !validateStudentIdentity()) {
            setIsLoading(false);
            return;
        }

        // Simulate sending OTPs
        await new Promise(r => setTimeout(r, 1500));
        setOtpData({ ...otpData, sent: true });
        setStep('verify');
        toast.success(`OTPs sent to ${formData.email} and ${formData.mobile}`);
        setIsLoading(false);
    };

    const handleVerifyAndRegister = async () => {
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 1000));

        if (otpData.emailOtp === MOCK_OTP && otpData.mobileOtp === MOCK_OTP) {
            // Register
            const newUser: User = {
                uid: `${role}_${Date.now()}`,
                email: formData.email,
                name: formData.name,
                role: role,
                phone: formData.mobile,
                ...(role === 'employer' ? {
                    companyName: formData.companyName,
                    designation: formData.designation
                } : {
                    enrollmentNo: formData.enrollmentNo,
                    dob: formData.dob
                })
            };

            registerUser(newUser);
            toast.success("Account verified and created successfully!");

            if (role === 'student') navigate('/verify/R158237200015');
            else navigate('/');

        } else {
            toast.error("Invalid OTPs. Please try again. (Hint: 123456)");
        }
        setIsLoading(false);
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
                            <span className="text-xs text-center text-gray-500">Access your academic profile</span>
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

    const renderForm = () => (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle>{role === 'student' ? 'Student Registration' : 'Employer Registration'}</CardTitle>
                <CardDescription>Enter your details to create an account.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSendOtps}>
                <CardContent className="space-y-6"> {/* Increased from 5 */}
                    {/* Common Fields */}
                    <div className="space-y-4"> {/* Added wrapper with spacing */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" className="h-11" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" className="h-11" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="mobile">Mobile Number</Label>
                            <Input id="mobile" required value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} placeholder="+91 9876543210" className="h-11" />
                        </div>
                    </div>

                    {/* Role Specific Fields */}
                    {role === 'student' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="enrollment">Enrollment Number</Label>
                                <Input id="enrollment" required value={formData.enrollmentNo} onChange={e => setFormData({ ...formData, enrollmentNo: e.target.value })} placeholder="R123..." className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dob">Date of Birth</Label>
                                <Input id="dob" type="date" required value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="h-11" />
                            </div>
                        </div>
                    )}

                    {role === 'employer' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="company">Company Name</Label>
                                <Input id="company" required value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} placeholder="Tech Corp" className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="designation">Designation</Label>
                                <Input id="designation" required value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} placeholder="HR Manager" className="h-11" />
                            </div>
                        </div>
                    )}
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
                    <CardTitle>Verify Contact Details</CardTitle>
                </div>
                <CardDescription>Enter the OTPs sent to your email and mobile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Email OTP (Hint: 123456)</Label>
                    <Input
                        value={otpData.emailOtp}
                        onChange={e => setOtpData({ ...otpData, emailOtp: e.target.value })}
                        placeholder="123456"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Mobile OTP (Hint: 123456)</Label>
                    <Input
                        value={otpData.mobileOtp}
                        onChange={e => setOtpData({ ...otpData, mobileOtp: e.target.value })}
                        placeholder="123456"
                    />
                </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base" onClick={handleVerifyAndRegister} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Verify & Register
                </Button>
            </CardFooter>
        </Card>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-lg space-y-8 flex flex-col items-center">
                <div className="text-center">
                    <img src="/barkatullah.png" alt="Logo" className="mx-auto h-20 w-20 grayscale" />
                    <h2 className="mt-4 text-2xl font-bold text-gray-900">Create your account</h2>
                </div>

                {step === 'role' && renderRoleSelection()}
                {step === 'form' && renderForm()}
                {step === 'verify' && renderVerification()}

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
