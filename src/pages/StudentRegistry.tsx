import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, GraduationCap, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getStudentsByBranchAndYear, AVAILABLE_BRANCHES } from "@/data/mockData";

export default function StudentRegistry() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("CSE");
  const [selectedYear, setSelectedYear] = useState<string>("2019"); // Default to 2019

  const navigate = useNavigate();

  // Get Students based on filters
  const students = getStudentsByBranchAndYear(selectedBranch, selectedYear);

  // Additional Search Filter
  const filteredStudents = students.filter((student) => {
    const term = searchTerm.toLowerCase();
    return (
      student.EnrlNo.toLowerCase().includes(term) ||
      student.Details.Profile.StudentName.toLowerCase().includes(term)
    );
  });

  // Debug Logging
  useEffect(() => {
    console.log(`[Registry] Filter - Branch: ${selectedBranch}, Year: ${selectedYear}`);
    if (filteredStudents.length > 0) {
      const s = filteredStudents[0].Details.Profile;
      console.log(`[Registry] First Result - BranchCode: ${s.BranchCode}, FolderYear: ${s.FolderYear}, Course: ${s.Course}`);
    } else {
      console.log("[Registry] No students found for filters.");
    }
  }, [selectedBranch, selectedYear, filteredStudents]);

  const handleViewCredential = (enrollmentNumber: string) => {
    navigate(`/verify/${enrollmentNumber}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      {/* Page Header Area */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 text-blue-600" />
                  Student Registry
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                  Official registry of verified graduates (Batch 2019-2021).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Filters Card */}
          <Card className="p-5 border-slate-200 shadow-sm bg-white">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by Name or Enrollment No..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 bg-slate-50 border-slate-200 focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="h-8 w-px bg-slate-200 hidden md:block" />
                <Filter className="w-4 h-4 text-slate-400 hidden md:block" />

                {/* Branch Filter */}
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="w-[180px] h-10 border-slate-200 bg-slate-50 text-slate-700">
                    <SelectValue placeholder="Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_BRANCHES.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Year Filter */}
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[140px] h-10 border-slate-200 bg-slate-50 text-slate-700">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2019">Batch 2019</SelectItem>
                    <SelectItem value="2020">Batch 2020</SelectItem>
                    <SelectItem value="2021">Batch 2021</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 border-t border-slate-100 pt-3">
              <p className="text-sm font-medium text-slate-500">
                Showing <span className="text-slate-900">{filteredStudents.length}</span> students
              </p>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                {selectedBranch} • {selectedYear}
              </Badge>
            </div>
          </Card>

          {/* Results Table */}
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50 border-slate-200">
                    <TableHead className="w-16 font-semibold text-slate-600">#</TableHead>
                    <TableHead className="font-semibold text-slate-600">Enrollment No</TableHead>
                    <TableHead className="font-semibold text-slate-600">Student Name</TableHead>
                    <TableHead className="font-semibold text-slate-600">Status</TableHead>
                    <TableHead className="text-right font-semibold text-slate-600">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-16 text-slate-500">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                            <Search className="w-8 h-8 text-slate-300" />
                          </div>
                          <p className="text-lg font-medium text-slate-700">No Records Found</p>
                          <p className="text-sm">We couldn't find any students matching your filters.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student, index) => (
                      <TableRow
                        key={student.EnrlNo}
                        className="hover:bg-blue-50/50 cursor-pointer border-slate-100 transition-colors"
                        onClick={() => handleViewCredential(student.EnrlNo)}
                      >
                        <TableCell className="font-medium text-slate-500 py-4">
                          {index + 1}
                        </TableCell>
                        <TableCell className="font-mono font-medium text-slate-700">
                          {student.EnrlNo}
                        </TableCell>
                        <TableCell className="text-slate-700 font-medium">
                          {student.Details.Profile.StudentName}
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-normal px-2.5 py-0.5">
                            Verified
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewCredential(student.EnrlNo);
                            }}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
