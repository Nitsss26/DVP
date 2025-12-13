import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useVerificationStore } from "@/stores/useVerificationStore";
import { Building2, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function UniversityDashboard() {
    const requests = useVerificationStore((state) => state.requests);

    // Sort by newest
    const sortedRequests = [...requests].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const stats = {
        total: requests.length,
        approved: requests.filter(r => r.status === 'approved').length,
        pending: requests.filter(r => r.status === 'pending').length,
        rejected: requests.filter(r => r.status === 'rejected').length
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto">

                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-primary/10 p-3 rounded-xl">
                            <Building2 className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">University Verification Audit</h1>
                            <p className="text-muted-foreground">Monitor real-time access requests and verification activities.</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <Card className="p-4 bg-white shadow-sm border-l-4 border-l-blue-500">
                            <div className="text-sm text-muted-foreground font-medium">Total Requests</div>
                            <div className="text-3xl font-bold mt-1">{stats.total}</div>
                        </Card>
                        <Card className="p-4 bg-white shadow-sm border-l-4 border-l-green-500">
                            <div className="text-sm text-muted-foreground font-medium">Approved</div>
                            <div className="text-3xl font-bold mt-1 text-green-600">{stats.approved}</div>
                        </Card>
                        <Card className="p-4 bg-white shadow-sm border-l-4 border-l-yellow-500">
                            <div className="text-sm text-muted-foreground font-medium">Pending</div>
                            <div className="text-3xl font-bold mt-1 text-yellow-600">{stats.pending}</div>
                        </Card>
                        <Card className="p-4 bg-white shadow-sm border-l-4 border-l-red-500">
                            <div className="text-sm text-muted-foreground font-medium">Rejected</div>
                            <div className="text-3xl font-bold mt-1 text-red-600">{stats.rejected}</div>
                        </Card>
                    </div>

                    <Card className="shadow-md">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-bold">Access Log</h2>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Employer</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Requested Data</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedRequests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No verification requests yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedRequests.map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(req.timestamp).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="font-medium">{req.employerName}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{req.studentName}</div>
                                                <div className="text-xs text-muted-foreground font-mono">{req.studentEnrlNo}</div>
                                            </TableCell>
                                            <TableCell>
                                                {req.requestedFields.map(field => (
                                                    <Badge key={field} variant="outline" className="mr-1 text-xs">{field}</Badge>
                                                ))}
                                            </TableCell>
                                            <TableCell>
                                                {req.status === 'approved' && (
                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none flex w-fit items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Approved
                                                    </Badge>
                                                )}
                                                {req.status === 'rejected' && (
                                                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none flex w-fit items-center gap-1">
                                                        <XCircle className="w-3 h-3" /> Rejected
                                                    </Badge>
                                                )}
                                                {req.status === 'pending' && (
                                                    <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none flex w-fit items-center gap-1">
                                                        <Clock className="w-3 h-3" /> Pending
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>

                </div>
            </main>
            <Footer />
        </div>
    );
}
