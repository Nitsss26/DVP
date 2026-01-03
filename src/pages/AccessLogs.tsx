import { Header } from "@/components/layout/header";
import { formatDateWithOffset } from "@/lib/utils";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { useVerificationStore } from "@/stores/useVerificationStore";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Shield, Clock, User, Building, Search, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export default function AccessLogs() {
    const { requests, fetchRequests } = useVerificationStore();
    const safeRequests = requests || [];
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch requests from backend on mount
    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const filteredRequests = safeRequests.filter(r =>
        r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.employerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.studentEnrlNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
            <Header />

            {/* Page Header Area */}
            <div className="bg-white border-b border-slate-200 mb-8">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                                <Shield className="w-8 h-8 text-blue-600" />
                                System Access Logs
                            </h1>
                            <p className="text-slate-500 mt-2 text-lg">
                                Audit trail of all credential verification requests and access events.
                            </p>
                        </div>
                        <div className="relative w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search logs..."
                                className="pl-10 h-11 bg-slate-50 border-slate-200 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 pb-12">
                <div className="w-full">

                    <Card className="overflow-hidden border-slate-200">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-100 text-slate-600 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="p-4 w-32">Timestamp</th>
                                    <th className="p-4 w-[18%]">Employer</th>
                                    <th className="p-4 w-[18%]">Student</th>
                                    <th className="p-4 w-[10%]">Purpose</th>
                                    <th className="p-4 w-[8%]">Status</th>
                                    <th className="p-4 w-[15%]">Access Requested</th>
                                    <th className="p-4 w-[15%]">Access Granted</th>
                                    <th className="p-4 w-28">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-slate-500">No logs found.</td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50 transition-colors align-top">
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDateWithOffset(req.timestamp)}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Building className="w-4 h-4 text-slate-400" />
                                                    <span className="font-medium text-slate-700">{req.employerName}</span>
                                                </div>
                                                <div className="text-xs text-slate-400 ml-6 break-all">{req.employerEmail}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-slate-400" />
                                                    <span className="font-medium text-slate-700">{req.studentName}</span>
                                                </div>
                                                <div className="text-xs text-slate-400 ml-6 font-mono">{req.studentEnrlNo}</div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline" className="bg-slate-50 font-normal">
                                                    {req.purpose}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <StatusBadge status={req.status} />
                                            </td>
                                            <td className="p-4 text-xs text-slate-500">
                                                <div className="flex flex-wrap gap-1">
                                                    {(req.requestedFields || []).map((field, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 border-slate-200 text-slate-600 bg-slate-50">
                                                            {field}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4 text-xs text-slate-500">
                                                {req.status === 'approved' ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {(req.approvedFields || []).map((field, idx) => (
                                                            <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 border-green-200 text-green-700 bg-green-50">
                                                                {field}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {req.status === 'approved' && (
                                                    <Link to={`/verify/${req.studentEnrlNo}`} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100 whitespace-nowrap w-fit transition-colors">
                                                        <ExternalLink className="w-3 h-3" /> View Data
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'approved') return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Allowed</Badge>;
    if (status === 'pending') return <Badge className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border border-yellow-200">Pending</Badge>;
    return <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border border-red-200">Denied</Badge>;
}
