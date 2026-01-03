import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useVerificationStore, AccessRequest } from "@/stores/useVerificationStore";
import { formatDateWithOffset } from "@/lib/utils";

export default function EmployerRequests() {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState("all");
    const { requests: allRequests, fetchRequests } = useVerificationStore();

    // Fetch requests from backend on mount
    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // Filter requests for the current employer
    const myRequests = currentUser
        ? allRequests.filter(r => r.employerId === currentUser.uid)
        : [];

    // Reverse to show newest first
    const displayRequests = [...myRequests].reverse();

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
            case 'rejected': return <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
            default: return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
        }
    };

    if (!currentUser) return <div>Please log in</div>;

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <Header />
            <main className="container mx-auto px-4 py-8 flex-1">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Request Verification</h1>
                        <p className="text-slate-500">Manage your candidate credential access requests.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger value="all">All Requests</TabsTrigger>
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="approved">Approved</TabsTrigger>
                            <TabsTrigger value="rejected">Rejected</TabsTrigger>
                        </TabsList>
                        <div className="mt-4 space-y-4">
                            {displayRequests.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed">
                                    No requests found. Start by searching for a student on the Home page!
                                </div>
                            ) : displayRequests
                                .filter(r => activeTab === 'all' || r.status === activeTab)
                                .map((req) => (
                                    <Card key={req.id}>
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                                                    {(req.studentName || "S").charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold">{req.studentName}</h3>
                                                    <p className="text-sm text-gray-500">Enrl: {req.studentEnrlNo}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-xs text-gray-400">Request Date</p>
                                                    <p className="text-sm font-medium">{req.timestamp ? formatDateWithOffset(req.timestamp) : "Just now"}</p>
                                                </div>
                                                {getStatusBadge(req.status)}
                                                {req.status === 'approved' && (
                                                    <span className="text-xs text-green-600 hidden md:inline py-1 px-2 bg-green-50 rounded border border-green-100">
                                                        Access to {(req.approvedFields || []).length} fields
                                                    </span>
                                                )}
                                                {req.status === 'approved' && (
                                                    <Button variant="outline" size="sm" asChild className="ml-2">
                                                        <a href={`/verify/${req.studentEnrlNo}`}>View</a>
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    </Tabs>
                </div>
            </main>
            <Footer />
        </div>
    );
}
