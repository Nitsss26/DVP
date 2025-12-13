import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useConcernStore, DataConcern } from "@/stores/useConcernStore";
import { useToast } from "@/hooks/use-toast";
import { Check, X, FileText } from "lucide-react";

export default function StudentConcerns() {
    const { toast } = useToast();
    const { concerns, resolveConcern, rejectConcern } = useConcernStore();

    const handleAction = (id: string, action: 'resolve' | 'reject') => {
        const msg = action === 'resolve' ? "Data updated successfully." : "Proof insufficient.";
        if (action === 'resolve') resolveConcern(id, msg);
        else rejectConcern(id, msg);

        toast({ title: action === 'resolve' ? "Concern Resolved" : "Concern Rejected", description: "Status has been updated." });
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Student Governance</h1>
                    <p className="text-slate-500 mt-2">Manage data correction requests raised by students.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Data Correction Concerns</CardTitle>
                        <CardDescription>Review proof and approve or reject data changes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Field</TableHead>
                                    <TableHead>Proposed Value</TableHead>
                                    <TableHead>Proof</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {concerns.map((concern) => (
                                    <TableRow key={concern.id}>
                                        <TableCell>
                                            <div className="font-medium">{concern.studentName}</div>
                                            <div className="text-xs text-muted-foreground">{concern.studentEnrlNo}</div>
                                        </TableCell>
                                        <TableCell>{concern.fieldToCorrect}</TableCell>
                                        <TableCell className="font-mono text-xs">{concern.proposedValue}</TableCell>
                                        <TableCell>
                                            {concern.proofDocName ? (
                                                <div className="flex items-center gap-1 text-blue-600 text-sm hover:underline cursor-pointer">
                                                    <FileText className="w-3 h-3" /> {concern.proofDocName}
                                                </div>
                                            ) : <span className="text-muted-foreground text-xs">No doc</span>}
                                        </TableCell>
                                        <TableCell>
                                            {concern.status === 'pending' && <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>}
                                            {concern.status === 'resolved' && <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>}
                                            {concern.status === 'rejected' && <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {concern.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="h-8 w-8 hover:bg-green-100 hover:text-green-700 p-0"
                                                        variant="ghost"
                                                        onClick={() => handleAction(concern.id, 'resolve')}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="h-8 w-8 hover:bg-red-100 hover:text-red-700 p-0"
                                                        variant="ghost"
                                                        onClick={() => handleAction(concern.id, 'reject')}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                            {concern.status !== 'pending' && (
                                                <span className="text-xs text-muted-foreground">{concern.adminResponse}</span>
                                            )}
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
