import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { INSTITUTE_EMAIL, INSTITUTE_PASS, MOCK_OTP, User } from '../../types/auth'; // Added User
import { toast } from 'sonner';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAccessGranted, findUser } = useAuth();

    const [loginRole, setLoginRole] = useState<'student' | 'employer'>('student');
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [showOtp, setShowOtp] = useState(false);

    // Effect to set initial role from location state
    React.useEffect(() => {
        const state = location.state as { role?: 'student' | 'employer' };
        if (state?.role) {
            setLoginRole(state.role);
        }
    }, [location]);

    // Standard Login Handler
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API delay
        await new Promise(r => setTimeout(r, 600));

        // 1. Identify User Type & Validate Credentials
        let userToLogin: User | null = null;
        let isCredentialValid = false;

        // A. Check Demo/Magic Accounts
        if (password === "123456") {
            if (email === 'student@gog.com' && loginRole === 'student') {
                userToLogin = {
                    uid: 'demo_student_static_id',
                    email: email,
                    name: 'Pushpendra Kumar Banshkar',
                    role: 'student',
                    enrollmentNo: 'R158237200015',
                    dob: '1993-08-01'
                };
                isCredentialValid = true;
            } else if (email === 'employer@gog.com' && loginRole === 'employer') {
                userToLogin = {
                    uid: 'demo_employer_static_id',
                    email: email,
                    name: 'Rajesh Kumar',
                    role: 'employer',
                    phone: '+91 98765 43210',
                    companyName: 'Tata Consultancy Services',
                    designation: 'Senior HR Manager'
                };
                isCredentialValid = true;
            }
        }

        // B. Check Registered Users (if not magic)
        if (!isCredentialValid) {
            const foundUser = findUser(email);
            if (foundUser && foundUser.role === loginRole && password === "123456") {
                userToLogin = foundUser;
                isCredentialValid = true;
            }
        }

        // 2. Handle Authentication Flow
        if (!isCredentialValid) {
            // Check if user exists but with wrong role for better error msg
            const existingUser = findUser(email);
            if (existingUser && existingUser.role !== loginRole) {
                toast.error(`Account found but it is a ${existingUser.role}. Please switch tabs.`);
            } else {
                toast.error("Invalid credentials.");
            }
            setIsLoading(false);
            return;
        }

        // Step 1: Verify Password -> Show OTP
        if (!showOtp) {
            setShowOtp(true);
            toast.info("Password verified. Please enter OTP.");
            setIsLoading(false);
            return;
        }

        // Step 2: Verify OTP -> Login
        if (showOtp) {
            if (otp === "123456") {
                if (userToLogin) {
                    login(userToLogin);
                    toast.success(`Welcome back, ${userToLogin.name}!`);
                    if (userToLogin.role === 'student') navigate('/verify/R158237200015');
                    else navigate('/employer/requests');
                }
            } else {
                toast.error("Invalid OTP.");
            }
            setIsLoading(false);
            return;
        }
    };

    // Institute Login Handler
    const handleInstituteLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 600));

        // 1. Root Admin Login (Direct)
        if (email === INSTITUTE_EMAIL && password === INSTITUTE_PASS && !showOtp) {
            login({
                uid: 'inst_admin',
                email: email,
                name: 'Controller of Exams',
                role: 'institute'
            });
            toast.success("Welcome, Controller of Exams!");
            navigate('/university/dashboard');
            setIsLoading(false);
            return;
        }

        // 2. Granted Access Login (With OTP)
        if (isAccessGranted(email)) {
            // Step 1: Verify Password
            if (!showOtp) {
                if (password === "123456") {
                    setShowOtp(true);
                    toast.info("Password verified. Please enter OTP sent to your email.");
                    setIsLoading(false);
                    return;
                } else {
                    toast.error("Invalid credentials.");
                    setIsLoading(false);
                    return;
                }
            }

            // Step 2: Verify OTP
            else {
                if (otp === "123456") {
                    login({
                        uid: `staff_${Date.now()}`,
                        email: email,
                        name: 'Institute Staff Member',
                        role: 'institute'
                    });
                    toast.success("Access Granted! Welcome.");
                    navigate('/university/dashboard');
                    setIsLoading(false);
                    return;
                } else {
                    toast.error("Invalid OTP.");
                    setIsLoading(false);
                    return;
                }
            }
        }

        toast.error("Invalid Institute Credentials or Access Not Granted.");
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    {/* Colorful Logo */}
                    <img src="/barkatullah.png" alt="Logo" className="mx-auto h-24 w-24 object-contain" />
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in</h2>
                </div>

                <Tabs defaultValue="student" className="w-full" onValueChange={(val) => setLoginRole(val as any)}>
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="student">Student</TabsTrigger>
                        <TabsTrigger value="employer">Employer</TabsTrigger>
                        <TabsTrigger value="institute">Institute</TabsTrigger>
                    </TabsList>

                    <TabsContent value="student">
                        <Card>
                            <CardHeader>
                                <CardTitle>Student Login</CardTitle>
                                <CardDescription>Enter your credentials to access your academic profile.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleLogin}>
                                <CardContent className="space-y-6">
                                    {!showOtp ? (
                                        <>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="s-email">Email</Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            id="s-email"
                                                            type="email"
                                                            placeholder="student@gog.com"
                                                            className="pl-10 h-11"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <Label htmlFor="s-pass">Password</Label>
                                                        <Link to="/forgot-password" state={{ role: 'student' }} className="text-sm text-blue-600 hover:underline">
                                                            Forgot Password?
                                                        </Link>
                                                    </div>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            id="s-pass"
                                                            type="password"
                                                            placeholder="123456"
                                                            className="pl-10 h-11"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label htmlFor="s-otp">Enter OTP</Label>
                                            <div className="relative">
                                                <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
                                                <Input
                                                    id="s-otp"
                                                    type="text"
                                                    placeholder="123456"
                                                    className="pl-10 h-11 border-blue-200 focus:border-blue-500 font-mono text-center tracking-widest text-lg"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    required
                                                    autoFocus
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground text-center mt-2">
                                                OTP sent to {email}. (Use 123456)
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="pt-2">
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base shadow-sm mt-2" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {showOtp ? "Verify & Login" : "Student Login"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    <TabsContent value="employer">
                        <Card>
                            <CardHeader>
                                <CardTitle>Employer Login</CardTitle>
                                <CardDescription>Login to request and verify candidate credentials.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleLogin}>
                                <CardContent className="space-y-6">
                                    {!showOtp ? (
                                        <>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="e-email">Work Email</Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            id="e-email"
                                                            type="email"
                                                            placeholder="employer@gog.com"
                                                            className="pl-10 h-11"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <Label htmlFor="e-pass">Password</Label>
                                                        <Link to="/forgot-password" state={{ role: 'employer' }} className="text-sm text-blue-600 hover:underline">
                                                            Forgot Password?
                                                        </Link>
                                                    </div>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            id="e-pass"
                                                            type="password"
                                                            placeholder="123456"
                                                            className="pl-10 h-11"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label htmlFor="e-otp">Enter OTP</Label>
                                            <div className="relative">
                                                <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
                                                <Input
                                                    id="e-otp"
                                                    type="text"
                                                    placeholder="123456"
                                                    className="pl-10 h-11 border-blue-200 focus:border-blue-500 font-mono text-center tracking-widest text-lg"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    required
                                                    autoFocus
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground text-center mt-2">
                                                OTP sent to {email}. (Use 123456)
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="pt-2">
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base shadow-sm mt-2" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {showOtp ? "Verify & Login" : "Employer Login"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    <TabsContent value="institute">
                        <Card>
                            <CardHeader>
                                <CardTitle>Institute Login</CardTitle>
                                <CardDescription>Access the University Registry and Dashboard.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleInstituteLogin}>
                                <CardContent className="space-y-6">
                                    {!showOtp ? (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="i-email">Institute Email</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="i-email"
                                                        type="email"
                                                        placeholder="coe@gog.com"
                                                        className="pl-10 h-11"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="i-pass">Password</Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="i-pass"
                                                        type="password"
                                                        placeholder="123456"
                                                        className="pl-10 h-11"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label htmlFor="i-otp">Enter OTP</Label>
                                            <div className="relative">
                                                <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                                                <Input
                                                    id="i-otp"
                                                    type="text"
                                                    placeholder="123456"
                                                    className="pl-10 h-11 border-green-200 focus:border-green-500 font-mono text-center tracking-widest text-lg"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    required
                                                    autoFocus
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground text-center mt-2">
                                                OTP sent to {email}. (Use 123456)
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {showOtp ? "Verify & Login" : "Institute Login"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Login;
