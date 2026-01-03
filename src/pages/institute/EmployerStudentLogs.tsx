import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useConcernStore } from "@/stores/useConcernStore";
import { useEffect } from "react";

import { ExternalLink } from "lucide-react";

export default function EmployerStudentLogs() {
    const { helpRequests, fetchHelpRequests } = useConcernStore();

    // Fetch help requests from backend on mount
    useEffect(() => {
        fetchHelpRequests();
    }, [fetchHelpRequests]);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Communication Logs</h1>
                    <p className="text-slate-500 mt-2">Audit trail of interactions between Employers and Students.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Help Request Logs</CardTitle>
                        <CardDescription>Monitor additional data requests from employers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>Employer</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Request</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Latest Response</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {helpRequests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(req.timestamp).toLocaleDateString()}
                                            <div className="text-[10px]">{new Date(req.timestamp).toLocaleTimeString()}</div>
                                        </TableCell>
                                        <TableCell className="font-medium">{req.employerName}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{req.studentName}</div>
                                            <div className="text-xs text-muted-foreground">{req.studentEnrlNo}</div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={req.requestDetails}>
                                            {req.requestDetails}
                                        </TableCell>
                                        <TableCell>
                                            {req.status === 'open' && <Badge variant="outline">Open</Badge>}
                                            {req.status === 'responded' && <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Responded</Badge>}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] text-sm">
                                            {req.studentResponse ? (
                                                <div>
                                                    <span className="truncate block" title={req.studentResponse}>{req.studentResponse}</span>
                                                    {req.responseDocumentUrl && (
                                                        <a
                                                            href={req.responseDocumentUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-blue-600 flex items-center gap-1 mt-1 hover:underline"
                                                        >
                                                            <ExternalLink className="w-3 h-3" /> View Attachment
                                                        </a>
                                                    )}
                                                </div>
                                            ) : <span className="text-slate-400 italic">No response yet</span>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
