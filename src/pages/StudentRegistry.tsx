import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, GraduationCap, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config";

import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function StudentRegistry() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("All"); // Default All
  const [selectedYear, setSelectedYear] = useState<string>("All"); // Default All

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [globalCount, setGlobalCount] = useState(0);

  const navigate = useNavigate();

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // Assuming token is stored here
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '100',
        search: searchTerm,
        branch: selectedBranch === 'All' ? '' : selectedBranch,
        year: selectedYear === 'All' ? '' : selectedYear
      });

      const response = await fetch(`${API_BASE_URL}/api/public/registry?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setStudents(data.students);
        setTotalPages(data.pages);
        setTotalCount(data.totalCount);
        setGlobalCount(data.globalCount || 0);
      } else {
        console.error("Failed to fetch registry:", data.message);
      }
    } catch (error) {
      console.error("Error fetching registry:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, selectedBranch, selectedYear]); // Trigger on filter/page change

  // Debouce for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to page 1 on search
      fetchStudents();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleViewCredential = (enrollmentNumber: string) => {
    navigate(`/verify/${enrollmentNumber}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
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
                  Official registry of verified graduates.
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

                {/* Degree Program Filter - Based on actual BU directory structure */}
                <Select value={selectedBranch} onValueChange={(val) => { setSelectedBranch(val); setPage(1); }}>
                  <SelectTrigger className="w-[200px] h-10 border-slate-200 bg-slate-50 text-slate-700">
                    <SelectValue placeholder="Degree Program" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    <SelectItem value="All">All Degree Programs</SelectItem>
                    {/* Undergraduate Programs */}
                    <SelectItem value="B.A">B.A (Bachelor of Arts)</SelectItem>
                    <SelectItem value="B.A-B.ED">B.A-B.ED (Bachelor of Arts & Education)</SelectItem>
                    <SelectItem value="B.A.M.S">B.A.M.S (Bachelor of Ayurvedic Medicine & Surgery)</SelectItem>
                    <SelectItem value="B.A.S.L.P">B.A.S.L.P (Bachelor of Audiology Speech Language Pathology)</SelectItem>
                    <SelectItem value="B.B.A">B.B.A (Bachelor of Business Administration)</SelectItem>
                    <SelectItem value="B.C.A">B.C.A (Bachelor of Computer Applications)</SelectItem>
                    <SelectItem value="B.COM">B.COM (Bachelor of Commerce)</SelectItem>
                    <SelectItem value="B.D.S">B.D.S (Bachelor of Dental Surgery)</SelectItem>
                    <SelectItem value="B.ED">B.ED (Bachelor of Education)</SelectItem>
                    <SelectItem value="B.ED-M.ED">B.ED-M.ED (Integrated Education)</SelectItem>
                    <SelectItem value="B.H.M">B.H.M (Bachelor of Hotel Management)</SelectItem>
                    <SelectItem value="B.H.M.S">B.H.M.S (Bachelor of Homeopathic Medicine & Surgery)</SelectItem>
                    <SelectItem value="B.LIB">B.LIB (Bachelor of Library Science)</SelectItem>
                    <SelectItem value="B.M.L.T">B.M.L.T (Bachelor of Medical Lab Technology)</SelectItem>
                    <SelectItem value="B.P.E">B.P.E (Bachelor of Physical Education)</SelectItem>
                    <SelectItem value="B.P.T">B.P.T (Bachelor of Physiotherapy)</SelectItem>
                    <SelectItem value="B.PHARM">B.PHARM (Bachelor of Pharmacy)</SelectItem>
                    <SelectItem value="B.SC">B.SC (Bachelor of Science)</SelectItem>
                    <SelectItem value="B.SC-B.ED">B.SC-B.ED (Bachelor of Science & Education)</SelectItem>
                    <SelectItem value="B.U.M.S">B.U.M.S (Bachelor of Unani Medicine & Surgery)</SelectItem>
                    {/* Engineering Programs */}
                    <SelectItem value="CSE">CSE (Computer Science & Engineering)</SelectItem>
                    <SelectItem value="ECE">ECE (Electronics & Communication Engineering)</SelectItem>
                    <SelectItem value="IT">IT (Information Technology)</SelectItem>
                    <SelectItem value="CIVIL">CIVIL (Civil Engineering)</SelectItem>
                    <SelectItem value="MECH">MECH (Mechanical Engineering)</SelectItem>
                    {/* Postgraduate Programs */}
                    <SelectItem value="M.A">M.A (Master of Arts)</SelectItem>
                    <SelectItem value="M.A-M.SC">M.A-M.SC (Integrated Arts & Science)</SelectItem>
                    <SelectItem value="M.B.A">M.B.A (Master of Business Administration)</SelectItem>
                    <SelectItem value="M.B.B.S">M.B.B.S (Bachelor of Medicine & Surgery)</SelectItem>
                    <SelectItem value="M.C.A">M.C.A (Master of Computer Applications)</SelectItem>
                    <SelectItem value="M.COM">M.COM (Master of Commerce)</SelectItem>
                    <SelectItem value="M.ED">M.ED (Master of Education)</SelectItem>
                    <SelectItem value="M.F.SC">M.F.SC (Master of Fisheries Science)</SelectItem>
                    <SelectItem value="M.LIB">M.LIB (Master of Library Science)</SelectItem>
                    <SelectItem value="M.P.ED">M.P.ED (Master of Physical Education)</SelectItem>
                    <SelectItem value="M.P.M">M.P.M (Master of Personnel Management)</SelectItem>
                    <SelectItem value="M.P.T">M.P.T (Master of Physiotherapy)</SelectItem>
                    <SelectItem value="M.PHARM">M.PHARM (Master of Pharmacy)</SelectItem>
                    <SelectItem value="M.S.W">M.S.W (Master of Social Work)</SelectItem>
                    <SelectItem value="M.SC">M.SC (Master of Science)</SelectItem>
                    <SelectItem value="M.TECH">M.TECH (Master of Technology)</SelectItem>
                    {/* Law Programs */}
                    <SelectItem value="L.L.B">L.L.B (Bachelor of Laws)</SelectItem>
                    <SelectItem value="LL.M">LL.M (Master of Laws)</SelectItem>
                    {/* Diploma & Others */}
                    <SelectItem value="DIPLOMA">DIPLOMA (Diploma Programs)</SelectItem>
                    <SelectItem value="P.G.D.C.A">P.G.D.C.A (Post Graduate Diploma in Computer Applications)</SelectItem>
                    <SelectItem value="PG_DIPLOMA">PG DIPLOMA (Post Graduate Diploma)</SelectItem>
                    <SelectItem value="NURSING">NURSING (Nursing Programs)</SelectItem>
                    <SelectItem value="PH.D">PH.D (Doctor of Philosophy)</SelectItem>
                    {/* NEP Programs */}
                    <SelectItem value="NEP-B.A">NEP-B.A (National Education Policy - Arts)</SelectItem>
                    <SelectItem value="NEP-B.B.A">NEP-B.B.A (National Education Policy - Business)</SelectItem>
                    <SelectItem value="NEP-B.C.A">NEP-B.C.A (National Education Policy - Computer Apps)</SelectItem>
                    <SelectItem value="NEP-B.COM">NEP-B.COM (National Education Policy - Commerce)</SelectItem>
                    <SelectItem value="NEP-B.SC">NEP-B.SC (National Education Policy - Science)</SelectItem>
                    <SelectItem value="Other">Other Programs</SelectItem>
                  </SelectContent>
                </Select>

                {/* Year Filter */}
                <Select value={selectedYear} onValueChange={(val) => { setSelectedYear(val); setPage(1); }}>
                  <SelectTrigger className="w-[160px] h-10 border-slate-200 bg-slate-50 text-slate-700">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Years</SelectItem>
                    {/* Based on analysis: academic_year values are "2019-2020", "2020-2021", etc. */}
                    <SelectItem value="2021-2022">2021-2022</SelectItem>
                    <SelectItem value="2020-2021">2020-2021</SelectItem>
                    <SelectItem value="2019-2020">2019-2020</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 border-t border-slate-100 pt-3">
              <p className="text-sm font-medium text-slate-500">
                Showing <span className="text-slate-900">{totalCount}</span> of <span className="text-slate-900">{globalCount}</span> students
              </p>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                {selectedBranch === 'All' ? 'All Branches' : selectedBranch} • {selectedYear === 'All' ? 'All Years' : selectedYear}
              </Badge>
            </div>
          </Card>

          {/* Results Table */}
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-20 text-slate-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
                  Loading Registry Data...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50 border-slate-200">
                      <TableHead className="w-16 font-semibold text-slate-600">#</TableHead>
                      <TableHead className="font-semibold text-slate-600">Enrollment No</TableHead>
                      <TableHead className="font-semibold text-slate-600">Student Name</TableHead>
                      <TableHead className="font-semibold text-slate-600">Degree Program</TableHead>
                      <TableHead className="text-right font-semibold text-slate-600">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-16 text-slate-500">
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
                      students.map((student, index) => {
                        // Use server-side cleaned name
                        const displayCourse = student.Details?.Profile?.Course || 'NOT AVAILABLE';

                        return (
                          <TableRow
                            key={student.EnrlNo}
                            className="hover:bg-blue-50/50 cursor-pointer border-slate-100 transition-colors"
                            onClick={() => handleViewCredential(student.EnrlNo)}
                          >
                            <TableCell className="font-medium text-slate-500 py-4">
                              {(page - 1) * 10 + index + 1}
                            </TableCell>
                            <TableCell className="font-mono font-medium text-slate-700">
                              {student.EnrlNo}
                            </TableCell>
                            <TableCell className="text-slate-700 font-medium">
                              {student.Details.Profile.StudentName}
                            </TableCell>

                            <TableCell className="text-slate-600 text-sm">
                              {displayCourse}
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
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
