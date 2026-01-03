import { ExamRecord } from "@/data/mockData";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface StudentMarksheetsViewProps {
    records: ExamRecord[];
}

export function StudentMarksheetsView({ records }: StudentMarksheetsViewProps) {
    if (!records || records.length === 0) {
        return <div className="text-center py-8 text-slate-500">No examination records found.</div>;
    }

    return (
        <div className="space-y-4 pr-1">
            {records.map((record, index) => (
                <Card key={index} className="border-slate-200 shadow-sm">
                    <CardHeader className="bg-slate-50/50 pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold text-slate-800">
                                    {record.Semester || record.ExamName}
                                </CardTitle>
                                <CardDescription>
                                    {record.ExamSession} • {record.AcademicYear}
                                </CardDescription>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 mb-1 justify-end">
                                    <span className="text-sm text-slate-500 font-medium">Result:</span>
                                    <Badge variant={record.Result === "PASS" ? "default" : "destructive"} className={record.Result === "PASS" ? "bg-green-600 hover:bg-green-700" : ""}>
                                        {record.Result}
                                    </Badge>
                                </div>
                                <div className="text-sm text-slate-600">
                                    SGPA: <span className="font-bold text-slate-900">{record.SGPA}</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value={`item-${index}`} className="border-none">
                                <AccordionTrigger className="px-6 py-3 text-sm text-blue-600 hover:text-blue-700 hover:no-underline">
                                    View Subject Details
                                </AccordionTrigger>
                                <AccordionContent className="px-0 pb-0">
                                    <Table>
                                        <TableHeader className="bg-slate-50">
                                            <TableRow>
                                                <TableHead className="pl-6 w-[100px]">Code</TableHead>
                                                <TableHead>Subject Name</TableHead>
                                                <TableHead className="text-right">Marks</TableHead>
                                                <TableHead className="text-right pr-6">Grade</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {record.Subjects && record.Subjects.map((subject: any, idx: number) => (
                                                <TableRow key={idx} className="hover:bg-slate-50">
                                                    <TableCell className="pl-6 font-medium text-slate-700">{subject.SubCode || subject.code}</TableCell>
                                                    <TableCell className="text-slate-600">{subject.SubName || subject.name}</TableCell>
                                                    <TableCell className="text-right tabular-nums">
                                                        {subject.TotalObt || subject.marks_obtained}
                                                        <span className="text-slate-400 text-xs ml-1">
                                                            / {subject.TotalMax || subject.max_marks}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6 font-medium">
                                                        {subject.Grade || subject.grade}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {!record.Subjects && (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-4 text-slate-500">
                                                        Subject details not available.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
