import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Lock, Mail, ShieldCheck, UserPlus } from 'lucide-react';
import { INSTITUTE_EMAIL, INSTITUTE_PASS, MOCK_OTP, User } from '../../types/auth';
import { toast } from 'sonner';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, verifyCredentials, startSession } = useAuth(); // Added methods

    const [loginRole, setLoginRole] = useState<'student' | 'employer'>('student');
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [showOtp, setShowOtp] = useState(false);

    // Temp storage for 2FA flow
    const [tempAuth, setTempAuth] = useState<{ user: User, token: string } | null>(null);

    // Effect to set initial role from location state
    React.useEffect(() => {
        const state = location.state as { role?: 'student' | 'employer' };
        if (state?.role) {
            setLoginRole(state.role);
        }
    }, [location]);

    // Student/Employer Login - Direct login without OTP
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Call Backend
            const { user, token } = await verifyCredentials(email, password);

            // Check Role Mismatch
            if (user.role !== loginRole) {
                toast.error(`Account found but it is a ${user.role}. Please switch tabs.`);
                setIsLoading(false);
                return;
            }

            // Success
            startSession(user, token);
            toast.success(`Welcome back, ${user.name}!`);

            if (user.role === 'student') {
                navigate(`/verify/${user.enrollmentNo || 'R158237200015'}`);
            } else {
                navigate('/employer/requests');
            }

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Invalid credentials. Please check your email and password.");
        } finally {
            setIsLoading(false);
        }
    };

    // Institute Login Handler (with OTP for granted users)
    const handleInstituteLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // 1. If OTP is already shown, verify OTP
        if (showOtp) {
            if (otp === "123456") {
                if (tempAuth) {
                    startSession(tempAuth.user, tempAuth.token);
                    toast.success("Access Granted! Welcome.");
                    navigate('/university/dashboard');
                } else {
                    toast.error("Session expired. Please login again.");
                    setShowOtp(false);
                }
            } else {
                toast.error("Invalid OTP.");
            }
            setIsLoading(false);
            return;
        }

        // 2. Initial Login (Verify Credentials)
        try {
            // Verify Password & Email on Backend
            const { user, token } = await verifyCredentials(email, password);

            if (user.role !== 'institute') {
                toast.error("Access Denied. This account is not an Institute account.");
                setIsLoading(false);
                return;
            }

            // Root Admin - Direct Access
            if (email === INSTITUTE_EMAIL) {
                startSession(user, token);
                toast.success("Welcome, Controller of Exams!");
                navigate('/university/dashboard');
                return;
            }

            // Staff - Show OTP
            setTempAuth({ user, token }); // Store for step 2
            setShowOtp(true);
            toast.info("Password verified. Please enter OTP sent to your email.");

        } catch (error: any) {
            toast.error(error.message || "Invalid Institute Credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <img src="/barkatullah.png" alt="Logo" className="mx-auto h-24 w-24 object-contain" />
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in</h2>
                </div>

                <Tabs defaultValue="student" className="w-full" onValueChange={(val) => { setLoginRole(val as any); setShowOtp(false); setOtp(""); }}>
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="student">Student</TabsTrigger>
                        <TabsTrigger value="employer">Employer</TabsTrigger>
                        <TabsTrigger value="institute">Institute</TabsTrigger>
                    </TabsList>

                    {/* STUDENT LOGIN */}
                    <TabsContent value="student">
                        <Card>
                            <CardHeader>
                                <CardTitle>Student Login</CardTitle>
                                <CardDescription>Enter your credentials to access your academic profile.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleLogin}>
                                <CardContent className="space-y-4">
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
                                                placeholder="••••••"
                                                className="pl-10 h-11"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col space-y-4 pt-6">
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Login
                                    </Button>
                                    <div className="text-center text-sm text-gray-500">
                                        New User ?{' '}
                                        <Link to="/signup" state={{ role: 'student' }} className="font-semibold text-blue-600 hover:text-blue-500 inline-flex items-center gap-1">
                                            <UserPlus className="h-3 w-3" /> Create Account
                                        </Link>
                                    </div>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    {/* EMPLOYER LOGIN */}
                    <TabsContent value="employer">
                        <Card>
                            <CardHeader>
                                <CardTitle>Employer Login</CardTitle>
                                <CardDescription>Login to request and verify candidate credentials.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleLogin}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="e-email">Work Email/ Contact Number</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="e-email"
                                                type="email"
                                                placeholder="employer@gog.com or 9876543210"
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
                                                placeholder="••••••"
                                                className="pl-10 h-11"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col space-y-4 pt-6">
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Login
                                    </Button>
                                    <div className="text-center text-sm text-gray-500">
                                        New User ?{' '}
                                        <Link to="/signup" state={{ role: 'employer' }} className="font-semibold text-blue-600 hover:text-blue-500 inline-flex items-center gap-1">
                                            <UserPlus className="h-3 w-3" /> Create Account
                                        </Link>
                                    </div>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    {/* INSTITUTE LOGIN */}
                    <TabsContent value="institute">
                        <Card>
                            <CardHeader>
                                <CardTitle>Institute Login</CardTitle>
                                <CardDescription>Access the University Registry and Dashboard.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleInstituteLogin}>
                                <CardContent className="space-y-4">
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
                                                        placeholder="••••••"
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
                                <CardFooter className="pt-6">
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
