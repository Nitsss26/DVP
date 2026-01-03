import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentData, AVAILABLE_BRANCHES } from "@/data/mockData";
import { useEffect } from "react";

interface StudentFormProps {
    onSubmit: (data: Partial<StudentData>) => void;
    defaultValues?: StudentData;
    isEditing?: boolean;
}

export function StudentForm({ onSubmit, defaultValues, isEditing = false }: StudentFormProps) {
    const { register, handleSubmit, setValue, reset } = useForm<any>({
        defaultValues: {
            EnrlNo: defaultValues?.EnrlNo || "",
            StudentName: defaultValues?.Details?.Profile?.StudentName || "",
            FatherName: defaultValues?.Details?.Profile?.FatherName || "",
            MotherName: defaultValues?.Details?.Profile?.MotherName || "",
            DOB: defaultValues?.Details?.Profile?.DOB || "",
            Gender: defaultValues?.Details?.Profile?.Gender || "",
            Category: defaultValues?.Details?.Profile?.Category || "",
            College: defaultValues?.Details?.Profile?.College || "",
            Course: defaultValues?.Details?.Profile?.Course || "",
            Batch: defaultValues?.Details?.Profile?.Batch || "",
            BranchCode: defaultValues?.Details?.Profile?.BranchCode || "",
        }
    });

    useEffect(() => {
        if (defaultValues) {
            reset({
                EnrlNo: defaultValues.EnrlNo,
                StudentName: defaultValues.Details?.Profile?.StudentName,
                FatherName: defaultValues.Details?.Profile?.FatherName,
                MotherName: defaultValues.Details?.Profile?.MotherName,
                DOB: defaultValues.Details?.Profile?.DOB,
                Gender: defaultValues.Details?.Profile?.Gender,
                Category: defaultValues.Details?.Profile?.Category,
                College: defaultValues.Details?.Profile?.College,
                Course: defaultValues.Details?.Profile?.Course,
                Batch: defaultValues.Details?.Profile?.Batch,
                BranchCode: defaultValues.Details?.Profile?.BranchCode,
            });
        }
    }, [defaultValues, reset]);

    const onFormSubmit = (formData: any) => {
        // Reconstruct the nested structure
        const structuredData: Partial<StudentData> = {
            EnrlNo: formData.EnrlNo,
            Details: {
                Profile: {
                    StudentName: formData.StudentName,
                    FatherName: formData.FatherName,
                    MotherName: formData.MotherName,
                    DOB: formData.DOB,
                    Gender: formData.Gender,
                    Category: formData.Category,
                    MaritalStatus: formData.MaritalStatus || defaultValues?.Details?.Profile?.MaritalStatus || "SINGLE",
                    College: formData.College,
                    Course: formData.Course,
                    Batch: formData.Batch,
                    BranchCode: formData.BranchCode,
                    FolderYear: defaultValues?.Details?.Profile?.FolderYear || "2023",
                }
            }
        };
        onSubmit(structuredData);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-2">
                    <Label htmlFor="EnrlNo">Enrollment No. *</Label>
                    <Input id="EnrlNo" {...register("EnrlNo", { required: true })} placeholder="e.g. R15..." disabled={isEditing} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="StudentName">Full Name *</Label>
                    <Input id="StudentName" {...register("StudentName", { required: true })} placeholder="Student Name" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="FatherName">Father's Name</Label>
                    <Input id="FatherName" {...register("FatherName")} placeholder="Father Name" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="MotherName">Mother's Name</Label>
                    <Input id="MotherName" {...register("MotherName")} placeholder="Mother Name" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="DOB">Date of Birth</Label>
                    <Input id="DOB" {...register("DOB")} placeholder="DD/MM/YYYY" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="Gender">Gender</Label>
                    <Select onValueChange={(val) => setValue("Gender", val)} defaultValue={defaultValues?.Details?.Profile?.Gender}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="Category">Category</Label>
                    <Select onValueChange={(val) => setValue("Category", val)} defaultValue={defaultValues?.Details?.Profile?.Category}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="GEN">General</SelectItem>
                            <SelectItem value="OBC">OBC</SelectItem>
                            <SelectItem value="SC">SC</SelectItem>
                            <SelectItem value="ST">ST</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="Course">Course</Label>
                    <Input id="Course" {...register("Course")} placeholder="e.g. B.E. CSE" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="BranchCode">Branch</Label>
                    <Select onValueChange={(val) => setValue("BranchCode", val)} defaultValue={defaultValues?.Details?.Profile?.BranchCode}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Branch" />
                        </SelectTrigger>
                        <SelectContent>
                            {AVAILABLE_BRANCHES.map(branch => (
                                <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="Batch">Batch</Label>
                    <Input id="Batch" {...register("Batch")} placeholder="e.g. 2020-2024" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="College">College/Institute</Label>
                    <Input id="College" {...register("College")} placeholder="College Name" />
                </div>

            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {isEditing ? "Update Student" : "Add Student"}
                </Button>
            </div>
        </form>
    );
}
