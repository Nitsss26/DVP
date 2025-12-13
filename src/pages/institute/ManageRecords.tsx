import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Plus, Upload, Search, FileDown, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LOCAL_STUDENTS_DATA, StudentData } from "@/data/mockData"; // Import mock data
import { StudentForm } from "@/components/institute/StudentForm";
import { BulkUpload } from "@/components/institute/BulkUpload";

export default function ManageRecords() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [students, setStudents] = useState<StudentData[]>(LOCAL_STUDENTS_DATA);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<StudentData | null>(null);

    // Filter students based on search
    const filteredStudents = students.filter((student) => {
        const term = searchTerm.toLowerCase();
        const name = student.Details?.Profile?.StudentName?.toLowerCase() || "";
        const enrl = student.EnrlNo?.toLowerCase() || "";
        return name.includes(term) || enrl.includes(term);
    });

    const handleAddStudent = (data: Partial<StudentData>) => {
        // In a real app, this would be an API call
        console.log("Adding student:", data);

        // Mock addition
        const newStudent = {
            EnrlNo: data.EnrlNo || `R${Date.now()}`,
            Details: {
                Profile: {
                    ...data.Details?.Profile,
                }
            },
            ExamRecords: []
        } as StudentData;

        setStudents([...students, newStudent]);
        setIsAddOpen(false);
        toast({
            title: "Student Added",
            description: `${data.Details?.Profile?.StudentName} has been added successfully.`,
        });
    };

    const handleEditStudent = (data: Partial<StudentData>) => {
        // In a real app, this would be an API call
        console.log("Editing student:", data);

        const updatedStudents = students.map(s =>
            s.EnrlNo === editingStudent?.EnrlNo ? { ...s, ...data } as StudentData : s
        );

        setStudents(updatedStudents);
        setEditingStudent(null);
        toast({
            title: "Student Updated",
            description: "Student record has been updated successfully.",
        });
    };

    const handleBulkUpload = (newStudents: StudentData[]) => {
        setStudents([...students, ...newStudents]);
        setIsBulkOpen(false);
        toast({
            title: "Bulk Upload Successful",
            description: `${newStudents.length} records have been added.`,
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manage Student Records</h1>
                        <p className="text-slate-500 mt-2">View, add, edit, and organize student registry data.</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-3">
                        <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2 border-slate-300">
                                    <Upload className="h-4 w-4" />
                                    Bulk Upload
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>Bulk Upload Students</DialogTitle>
                                    <DialogDescription>
                                        Upload a CSV file to add multiple students at once.
                                    </DialogDescription>
                                </DialogHeader>
                                <BulkUpload onUpload={handleBulkUpload} />
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4" />
                                    Add New Record
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Add New Student</DialogTitle>
                                    <DialogDescription>
                                        Enter the student's personal and academic details.
                                    </DialogDescription>
                                </DialogHeader>
                                <StudentForm onSubmit={handleAddStudent} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-6 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by name or enrollment no..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" size="sm" className="text-slate-600">
                        <FileDown className="h-4 w-4 mr-2" />
                        Export List
                    </Button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="font-semibold text-slate-700">Enrollment No.</TableHead>
                                <TableHead className="font-semibold text-slate-700">Student Name</TableHead>
                                <TableHead className="font-semibold text-slate-700">Course / Branch</TableHead>
                                <TableHead className="font-semibold text-slate-700">Batch</TableHead>
                                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <TableRow key={student.EnrlNo} className="hover:bg-slate-50 transition-colors">
                                        <TableCell className="font-medium text-slate-900">{student.EnrlNo}</TableCell>
                                        <TableCell className="font-medium text-slate-700">
                                            {student.Details?.Profile?.StudentName}
                                        </TableCell>
                                        <TableCell className="text-slate-600">
                                            {student.Details?.Profile?.Course} <br />
                                            <span className="text-xs text-slate-400">{student.Details?.Profile?.BranchCode}</span>
                                        </TableCell>
                                        <TableCell className="text-slate-600">{student.Details?.Profile?.Batch}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={() => setEditingStudent(student)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                {/* Edit Dialog */}
                                                <Dialog open={!!editingStudent && editingStudent.EnrlNo === student.EnrlNo} onOpenChange={(open) => !open && setEditingStudent(null)}>
                                                    <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle>Edit Student Record</DialogTitle>
                                                        </DialogHeader>
                                                        <StudentForm
                                                            defaultValues={student}
                                                            onSubmit={handleEditStudent}
                                                            isEditing
                                                        />
                                                    </DialogContent>
                                                </Dialog>

                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                        No students found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </main>
            <Footer />
        </div>
    );
}
