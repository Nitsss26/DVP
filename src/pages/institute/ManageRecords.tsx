import { useState } from "react";
import { Link } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Plus, Upload, Search, FileDown, Pencil, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StudentData } from "@/data/mockData";
import { StudentForm } from "@/components/institute/StudentForm";
import { BulkUpload } from "@/components/institute/BulkUpload";
import { StudentMarksheetsView } from "@/components/institute/StudentMarksheetsView";

export default function ManageRecords() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [students, setStudents] = useState<StudentData[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<StudentData | null>(null);
    const [viewingStudent, setViewingStudent] = useState<StudentData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAllStudents = async (currentPage: number) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/institute/student?page=${currentPage}&limit=10`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();

                // Map backend list to frontend structure
                const mappedList: StudentData[] = data.students.map((s: any) => ({
                    EnrlNo: s.enrl_no,
                    Details: {
                        Profile: {
                            StudentName: s.student_name,
                            FatherName: s.father_name,
                            MotherName: s.mother_name,
                            DOB: s.dob || "N/A", // Backend needs to send DOB if available, adding robust fallback
                            Gender: s.gender,
                            Category: s.category || "N/A",
                            College: s.college_name,
                            Course: s.course,
                            Batch: s.batch,
                            BranchCode: s.branch_code || "N/A",
                            MaritalStatus: "N/A",
                            FolderYear: "N/A"
                        }
                    },
                    ExamRecords: []
                }));

                setStudents(mappedList);
                setTotalPages(data.pages);
                setTotalCount(data.total);
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to load students.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Load initial data
    useState(() => {
        fetchAllStudents(1);
    });

    // Handle page change
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            fetchAllStudents(newPage);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchAllStudents(1);
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/institute/student/${searchTerm}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (!response.ok) {
                if (response.status === 404) {
                    toast({
                        title: "Student Not Found",
                        description: `No student record found for enrollment no: ${searchTerm}`,
                        variant: "destructive"
                    });
                    setStudents([]);
                } else {
                    throw new Error("Search failed");
                }
                return;
            }

            const data = await response.json();

            // Map backend response to frontend StudentData structure
            const mappedStudent: StudentData = {
                EnrlNo: data.enrl_no || data._id,
                Details: {
                    Profile: {
                        StudentName: data.student_name,
                        FatherName: data.father_name,
                        MotherName: data.mother_name,
                        DOB: data.dob,
                        Gender: data.gender,
                        Category: data.category,
                        College: data.college_name || data.Details?.Profile?.College || "Geeks of Gurukul",
                        Course: data.course || "N/A",
                        Batch: data.batch || "N/A",
                        BranchCode: "N/A",
                        MaritalStatus: "N/A",
                        FolderYear: "N/A"
                    }
                },
                ExamRecords: data.results ? data.results.map((res: any) => ({
                    Semester: res.semester,
                    ExamName: res.exam_name,
                    AcademicYear: res.academic_year,
                    ExamSession: res.exam_session,
                    Result: res.result_status,
                    SGPA: res.sgpa,
                    Subjects: res.subjects?.map((sub: any) => ({
                        SubCode: sub.code,
                        SubName: sub.name,
                        TotalObt: sub.marks_obtained,
                        TotalMax: sub.max_marks,
                        Grade: sub.grade
                    })) || []
                })) : []
            };

            setStudents([mappedStudent]);
            setTotalPages(1);
            toast({
                title: "Student Found",
                description: `Records loaded for ${data.student_name}`,
            });

        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to search for student details.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddStudent = async (data: Partial<StudentData>) => {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };

            const payload = {
                EnrlNo: data.EnrlNo,
                Details: data.Details,
                ExamRecords: data.ExamRecords || []
            };

            const res = await fetch('/api/institute/student', {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to add student");
            }

            toast({
                title: "Student Added",
                description: `${data.Details?.Profile?.StudentName} has been added successfully.`,
            });
            setIsAddOpen(false);
            // Reload list
            fetchAllStudents(1);

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleEditStudent = async (data: Partial<StudentData>) => {
        if (!editingStudent) return;
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };

            const res = await fetch(`/api/institute/student/${editingStudent.EnrlNo}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to update student");
            }

            const updated = await res.json();

            // Update local state
            const updatedStudents = students.map(s =>
                s.EnrlNo === editingStudent.EnrlNo ? { ...s, ...data } as StudentData : s
            );

            setStudents(updatedStudents);
            setEditingStudent(null);
            toast({
                title: "Student Updated",
                description: "Student record has been updated successfully.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        }
    };

    const handleBulkUpload = async (newStudents: StudentData[]) => {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };

            const res = await fetch('/api/institute/bulk-upload', {
                method: 'POST',
                headers,
                body: JSON.stringify(newStudents)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Bulk upload failed");
            }

            const result = await res.json();

            toast({
                title: "Bulk Upload Successful",
                description: result.message || `${newStudents.length} records processed.`,
            });
            setIsBulkOpen(false);
            fetchAllStudents(1);
        } catch (error: any) {
            toast({
                title: "Upload Failed",
                description: error.message,
                variant: "destructive"
            });
        }
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

                </div>

                {/* Filters and Search */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-6 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by Enrollment No..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Button onClick={handleSearch} disabled={isLoading}>
                            {isLoading ? "Searching..." : "Search"}
                        </Button>
                    </div>
                    {/* <Button variant="ghost" size="sm" className="text-slate-600">
                        <FileDown className="h-4 w-4 mr-2" />
                        Export List
                    </Button> */}
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

                {/* Table */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="font-semibold text-slate-700">Enrollment No.</TableHead>
                                <TableHead className="font-semibold text-slate-700">Student Name</TableHead>
                                <TableHead className="font-semibold text-slate-700">College</TableHead>
                                <TableHead className="font-semibold text-slate-700">Father's Name</TableHead>
                                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.length > 0 ? (
                                students.map((student) => (
                                    <TableRow key={student.EnrlNo} className="hover:bg-slate-50 transition-colors">
                                        <TableCell className="font-medium text-slate-900">{student.EnrlNo}</TableCell>
                                        <TableCell className="font-medium text-slate-700">
                                            {student.Details?.Profile?.StudentName}
                                        </TableCell>
                                        <TableCell className="text-slate-600">
                                            {student.Details?.Profile?.College || "N/A"}
                                        </TableCell>
                                        <TableCell className="text-slate-600">{student.Details?.Profile?.FatherName}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    to={`/verify/${student.EnrlNo}`}
                                                    target="_blank"
                                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-100 hover:text-blue-700 h-8 w-8 text-slate-600"
                                                    title="View Verification Page"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>

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
                                        {isLoading ? "Searching database..." : "Enter an Enrollment Number to search."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-slate-500">
                        Showing {students.length} of {totalCount} records
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page <= 1 || isLoading}
                        >
                            Previous
                        </Button>
                        <div className="flex items-center gap-1 font-medium text-slate-600 px-2">
                            Page {page} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= totalPages || isLoading}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
