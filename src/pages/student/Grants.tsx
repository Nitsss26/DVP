import { Header } from "@/components/layout/header";
import { formatDateWithOffset } from "@/lib/utils";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useVerificationStore } from "@/stores/useVerificationStore";
import { useState, useEffect } from "react";
import { StudentApprovalModal } from "@/components/verification/StudentApprovalModal";
import { AlertTriangle, Key, Building, Calendar, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function StudentGrants() {
    const { requests, revokeAccess, rejectRequest, updateApprovedFields, fetchRequests } = useVerificationStore();
    const { currentUser } = useAuth();
    const [selectedRequest, setSelectedRequest] = useState<any>(null);

    // Fetch requests from backend on mount
    useEffect(() => {
        if (currentUser?.enrollmentNo) {
            fetchRequests({ studentEnrlNo: currentUser.enrollmentNo });
        } else {
            fetchRequests();
        }
    }, [currentUser?.enrollmentNo, fetchRequests]);

    const safeRequests = requests || [];

    // Filter requests for the logged-in student
    // If no currentUser (dev mode?), show all
    // toLowerCase() added for case-insensitive matching
    const studentRequests = currentUser?.enrollmentNo
        ? safeRequests.filter(r => r.studentEnrlNo.toLowerCase() === currentUser.enrollmentNo.toLowerCase())
        : safeRequests;

    const pending = studentRequests.filter(r => r.status === 'pending');
    const active = studentRequests.filter(r => r.status === 'approved');

    /* Debug info removed as requested */

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
            <Header />

            {/* Page Header Area */}
            <div className="bg-white border-b border-slate-200 mb-8">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                                    <Key className="w-8 h-8 text-blue-600" />
                                    Credential Requests
                                </h1>
                                <p className="text-slate-500 mt-2 text-lg">
                                    Manage which employers can view your verified academic records.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 container mx-auto px-4 pb-12">
                <div className="max-w-5xl mx-auto">

                    {/* Pending Requests Section */}
                    {pending.length > 0 && (
                        <div className="mb-10">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-orange-700">
                                <Clock className="w-5 h-5" />
                                Pending Requests ({pending.length})
                            </h2>
                            <div className="space-y-6">
                                {pending.map(req => (
                                    <Card key={req.id} className="p-6 border border-slate-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4">
                                                <div className="p-3 bg-blue-50 rounded-lg h-fit">
                                                    <Building className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-slate-900 leading-tight">{req.employerName}</h3>
                                                    <p className="text-sm text-slate-500 mb-2">{req.employerEmail}</p>

                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span>Requested on {req.timestamp ? formatDateWithOffset(req.timestamp) : "Recently"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-50 border-orange-100 flex items-center gap-1">
                                                Action Needed
                                            </Badge>
                                        </div>

                                        <div className="ml-[68px] mb-6 space-y-3">
                                            <div>
                                                <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Purpose</span>
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-800 hover:bg-slate-100">{req.purpose}</Badge>
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Requested Information</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {(req.requestedFields || []).map(f => (
                                                        <Badge key={f} variant="outline" className="text-slate-600 bg-slate-50 border-slate-200">
                                                            {f.replace('Individual ', '').replace('Address', '')}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 border-t border-slate-100 pt-4 mt-4 ml-[68px]">
                                            <Button
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                                                onClick={() => setSelectedRequest(req)}
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Review & Approve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                                onClick={() => {
                                                    rejectRequest(req.id);
                                                    toast.info("Request Declined");
                                                }}
                                            >
                                                Decline
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {pending.length === 0 && active.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200 shadow-sm">
                            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700">No Requests</h3>
                            <p className="text-slate-500">You don't have any active or pending verification requests.</p>
                        </div>
                    )}

                    {/* ACTIVE GRANTS - DETAILED VIEW WITH FIELD MANAGEMENT */}
                    {active.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-slate-200">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                                <Key className="w-5 h-5 text-green-600" />
                                Active Grants ({active.length})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {active.map(req => (
                                    <Card key={req.id} className="p-5 border border-slate-200 hover:border-blue-200 transition-colors bg-white shadow-sm flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-3">
                                                <div className="p-2.5 bg-blue-50 rounded-lg h-fit">
                                                    <Building className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 leading-tight">{req.employerName}</h3>
                                                    <p className="text-xs text-slate-500">{req.employerEmail}</p>
                                                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {req.timestamp ? formatDateWithOffset(req.timestamp) : "Recently"}
                                                        </span>
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[10px] px-1.5 py-0">
                                                            <CheckCircle className="w-2.5 h-2.5 mr-1" /> ACTIVE
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Requested vs Approved Fields */}
                                        <div className="flex-1 space-y-3 mb-4">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">Originally Requested</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {(req.requestedFields || []).map(f => (
                                                        <Badge key={f} variant="outline" className="text-slate-500 bg-slate-50 border-slate-100 text-[10px] px-1.5">
                                                            {f.replace('Individual ', '').replace('Address', '')}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold uppercase text-blue-600 block mb-1.5 flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Currently Shared
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {(req.approvedFields || []).map(f => (
                                                        <Badge key={f} className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 text-[10px] flex items-center gap-1 border px-1.5">
                                                            {f.replace('Individual ', '').replace('Address', '')}
                                                            <button
                                                                className="ml-1 text-blue-400 hover:text-red-500 hover:bg-red-50 rounded-full w-3.5 h-3.5 flex items-center justify-center transition-colors"
                                                                onClick={() => {
                                                                    // Remove this specific field
                                                                    const updatedFields = (req.approvedFields || []).filter(field => field !== f);
                                                                    if (updatedFields.length === 0) {
                                                                        revokeAccess(req.id);
                                                                        toast.success("All access revoked for " + req.employerName);
                                                                    } else {
                                                                        updateApprovedFields(req.id, updatedFields);
                                                                        toast.success(`Removed access to "${f}"`);
                                                                    }
                                                                }}
                                                                title={`Remove access to ${f}`}
                                                            >
                                                                ×
                                                            </button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 border-t border-slate-100 pt-3 mt-auto">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 h-8 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                                                onClick={() => setSelectedRequest(req)}
                                            >
                                                Edit Access
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="flex-1 h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => {
                                                    revokeAccess(req.id);
                                                    toast.success("All access revoked for " + req.employerName);
                                                }}
                                            >
                                                Revoke
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />

            {selectedRequest && (
                <StudentApprovalModal
                    request={selectedRequest}
                    open={!!selectedRequest}
                    onOpenChange={(open) => !open && setSelectedRequest(null)}
                />
            )}
        </div>
    );
}
