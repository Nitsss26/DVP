import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Using Textarea for simple CSV paste or standard file input styling
import { Upload, Download, FileText } from "lucide-react";
import { useState } from "react";
import { StudentData } from "@/data/mockData";

interface BulkUploadProps {
    onUpload: (data: StudentData[]) => void;
}

export function BulkUpload({ onUpload }: BulkUploadProps) {
    const [csvContent, setCsvContent] = useState("");

    // Sample CSV format
    const sampleCSV = `EnrlNo,StudentName,FatherName,Course,Batch\nR15CS001,Mohit Sharma,Richard Doe,B.E. CSE,2020-2024\nR15CS002,Jane Smith,Robert Smith,B.E. CSE,2020-2024`;

    const handleDownloadSample = () => {
        const blob = new Blob([sampleCSV], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample_students.csv';
        a.click();
    };

    const handleProcess = () => {
        // Simple CSV parser for demo
        const lines = csvContent.trim().split('\n');
        if (lines.length < 2) return; // Header + 1 row minimum

        const newStudents: StudentData[] = [];

        // Skipping header, processing rows
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length >= 2) {
                newStudents.push({
                    EnrlNo: cols[0]?.trim(),
                    Details: {
                        Profile: {
                            EnrlNo: cols[0]?.trim(),
                            StudentName: cols[1]?.trim(),
                            FatherName: cols[2]?.trim(),
                            Course: cols[3]?.trim(),
                            Batch: cols[4]?.trim() || "2023-2024",
                            Gender: "UNKNOWN",
                            // Add defaults for required fields
                        }
                    }
                } as any);
            }
        }

        if (newStudents.length > 0) {
            onUpload(newStudents);
            setCsvContent("");
        }
    };

    return (
        <div className="space-y-6 py-4">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                <h4 className="flex items-center text-sm font-semibold text-blue-800 mb-2">
                    <FileText className="h-4 w-4 mr-2" />
                    Instructions
                </h4>
                <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                    <li>Download the sample CSV format below.</li>
                    <li>Fill in the student details (Enrollment No, Name, etc.).</li>
                    <li>Paste the CSV content or upload the file (Paste supported for now).</li>
                </ul>
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 bg-white text-blue-700 hover:bg-blue-50 border-blue-200"
                    onClick={handleDownloadSample}
                >
                    <Download className="h-3 w-3 mr-2" />
                    Download Sample CSV
                </Button>
            </div>

            <div className="space-y-2">
                <Label>Paste CSV Data</Label>
                <Textarea
                    placeholder="EnrlNo,StudentName,FatherName,Course,Batch..."
                    className="min-h-[150px] font-mono text-sm"
                    value={csvContent}
                    onChange={(e) => setCsvContent(e.target.value)}
                />
            </div>

            <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleProcess} disabled={!csvContent} className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Process & Upload
                </Button>
            </div>
        </div>
    );
}
