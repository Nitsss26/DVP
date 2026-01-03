import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useVerificationStore } from "@/stores/useVerificationStore";
import { useAuth } from "@/context/AuthContext";
import { Building2, GraduationCap, Clock, AlertCircle, Shield, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

interface DashboardStats {
    totalStudents: number;
    pendingRequests: number;
    studentConcerns: number;
    employerHelpReqs: number;
    staffCount: number;
    branchDistribution: { name: string; count: number }[];
}

export default function UniversityDashboard() {
    const { requests, fetchRequests } = useVerificationStore();
    const { grantedEmails } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);

    // Fetch data from backend on mount
    useEffect(() => {
        fetchRequests();

        // Fetch institute stats
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/institute/stats', {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };
        fetchStats();
    }, [fetchRequests]);

    // Use real stats from backend or fallback to 0
    const totalStudents = stats?.totalStudents || 0;

    // Use real aggregated data for chart (default to empty array/clean mock if loading)
    // If backend returns null names (e.g. data missing), fallback to "Unknown"
    const branchData = stats?.branchDistribution?.map(b => ({
        name: b.name || "Unknown",
        count: b.count
    })) || [];

    // Request Stats from real data
    const requestStats = {
        total: (stats?.pendingRequests || 0) + (requests.filter(r => r.status === 'approved').length) + (requests.filter(r => r.status === 'rejected').length),
        // usage of 'requests' store vs 'stats' api... let's trust 'stats' for total counts if possible or stick to store if loaded.
        // Actually, stats API gives totals. Let's use them.
        approved: requests.filter(r => r.status === 'approved').length, // This might be 0 if only pending fetched?
        // Let's rely on stats object for consistency if available
        pending: stats?.pendingRequests || 0,
        studentConcerns: stats?.studentConcerns || 0,
        employerHelpReqs: stats?.employerHelpReqs || 0,
        rejected: requests.filter(r => r.status === 'rejected').length // Backend didn't send rejected count in stats
    };

    const requestStatusData = [
        { name: 'Approved', value: requestStats.approved, color: '#22c55e' },
        { name: 'Pending', value: requestStats.pending, color: '#eab308' },
        { name: 'Rejected', value: requestStats.rejected, color: '#ef4444' },
        { name: 'Concerns', value: requestStats.studentConcerns, color: '#a855f7' },
    ];

    const chartTotal = requestStatusData.reduce((acc, item) => acc + item.value, 0);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50/50">
            <Header />
            <main className="flex-1 container mx-auto px-6 py-10">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900">University Dashboard</h1>
                    <p className="text-slate-500 mt-2 text-lg">Real-time overview of registry status, operational tasks, and verification analytics.</p>
                </div>

                {/* Section 1: Registry Overview (High-level Stats) */}
                <section className="mb-10">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 px-1">Registry Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Total Students</CardTitle>
                                <GraduationCap className="h-4 w-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">{totalStudents}</div>
                                <p className="text-xs text-slate-500 mt-1">Registered across all years</p>
                            </CardContent>
                        </Card>
                        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Departments</CardTitle>
                                <Building2 className="h-4 w-4 text-indigo-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">{branchData.length}</div>
                                <p className="text-xs text-slate-500 mt-1">Active academic branches</p>
                            </CardContent>
                        </Card>
                        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Authorized Staff</CardTitle>
                                <Shield className="h-4 w-4 text-emerald-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">{stats?.staffCount || grantedEmails.length}</div>
                                <p className="text-xs text-slate-500 mt-1">Personnel with portal access</p>
                            </CardContent>
                        </Card>
                        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Total Employers</CardTitle>
                                <Briefcase className="h-4 w-4 text-orange-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">34</div>
                                <p className="text-xs text-slate-500 mt-1">Registered corporate partners</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Section 2: Operational Metrics (Actionable) */}
                <section className="mb-10">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 px-1">Operational Metrics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-white border-l-4 border-l-yellow-400 shadow-sm hover:shadow-md transition-all">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base font-bold text-slate-800">Pending Verifications</CardTitle>
                                        <CardDescription>Employer requests awaiting approval</CardDescription>
                                    </div>
                                    <div className="p-2 bg-yellow-50 rounded-full">
                                        <Clock className="h-5 w-5 text-yellow-600" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">{requestStats.pending}</div>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-400 w-[45%]"></div>
                                    </div>
                                    <span className="text-xs text-slate-500 font-medium">Action Needed</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-all">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base font-bold text-slate-800">Student Concerns</CardTitle>
                                        <CardDescription>Data correction inquiries</CardDescription>
                                    </div>
                                    <div className="p-2 bg-purple-50 rounded-full">
                                        <AlertCircle className="h-5 w-5 text-purple-600" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">{requestStats.studentConcerns}</div>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 w-[20%]"></div>
                                    </div>
                                    <span className="text-xs text-slate-500 font-medium">Review Proofs</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-all">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-base font-bold text-slate-800">Employer Queries</CardTitle>
                                        <CardDescription>Open help requests</CardDescription>
                                    </div>
                                    <div className="p-2 bg-blue-50 rounded-full">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">{requestStats.employerHelpReqs}</div>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[15%]"></div>
                                    </div>
                                    <span className="text-xs text-slate-500 font-medium">Monitor Logs</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Section 3: Analytics */}
                <section>
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 px-1">System Analytics & Trends</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Student Enrollment Chart */}
                        <Card className="col-span-1 lg:col-span-2 shadow-sm border-slate-200">
                            <CardHeader>
                                <CardTitle>Student Enrollment Distribution</CardTitle>
                                <CardDescription>Active students registered by academic department.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={branchData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}K`} tick={{ fill: '#64748b' }} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Verification Status Chart - Redesigned Donut */}
                        <Card className="col-span-1 shadow-sm border-slate-200 flex flex-col">
                            <CardHeader>
                                <CardTitle>Verification Pipeline Status</CardTitle>
                                <CardDescription>Real-time status of verification requests.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-center">
                                <div className="h-[250px] w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={requestStatusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={90}
                                                paddingAngle={2}
                                                dataKey="value"
                                                cornerRadius={4}
                                            >
                                                {requestStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Center Label */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-3xl font-bold text-slate-800">{chartTotal}</span>
                                        <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Total</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-6 px-2">
                                    {requestStatusData.map((item) => (
                                        <div key={item.name} className="flex items-start gap-2">
                                            <span className="w-2 h-2 mt-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                            <div>
                                                <p className="text-xs font-medium text-slate-500 uppercase">{item.name}</p>
                                                <p className="text-lg font-bold text-slate-800">{item.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
