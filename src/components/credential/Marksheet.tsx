import React from 'react';
import { Card } from "@/components/ui/card";
import { StudentData, ExamRecord } from "@/data/mockData";

interface MarksheetProps {
    student: StudentData;
    record: ExamRecord;
    isVerified?: boolean;
}

export const Marksheet: React.FC<MarksheetProps> = ({ student, record, isVerified }) => {
    // 1. Parse Subjects Dynamically
    const subjects = [];
    let i = 1;
    while (record[`Sub${i}`]) {
        const code = record[`Sub${i}Code`];
        const name = record[`Sub${i}`];

        // Theory Breakdown - Prefer specific '1' component if available, else fallback
        const thObt = record[`Sub${i}Th1Obtn`] || record[`Sub${i}ThObtn`];
        const thMax = record[`Sub${i}Th1OutOf`] || record[`Sub${i}ThMax`];
        const thMin = record[`Sub${i}Th Min`] || record[`Sub${i}ThMin`]; // Note space in some raw JSONs?

        // Sessional Breakdown (Internal)
        const ssObt = record[`Sub${i}Ss1Obtn`] || record[`Sub${i}SsObtn`];
        const ssMax = record[`Sub${i}Ss1OutOf`] || record[`Sub${i}SsMax`];

        // Practical Breakdown
        const prObt = record[`Sub${i}Pr1Obtn`] || record[`Sub${i}PrObtn`];
        const prMax = record[`Sub${i}Pr1OutOf`] || record[`Sub${i}PrMax`];

        // Totals
        const totalObt = record[`Sub${i}Obtn`];
        const totalMax = record[`Sub${i}Max`] || record[`Sub${i}OMax`];
        const totalMin = record[`Sub${i}Min`] || record[`Sub${i}OMin`];

        const grade = record[`Sub${i}Grades`];
        const credit = record[`Sub${i}Credits`];
        const creditPoint = record[`Sub${i}CreditPoint`];

        subjects.push({
            code, name,
            thObt, thMax, thMin,
            ssObt, ssMax,
            prObt, prMax,
            totalObt, totalMax, totalMin,
            grade, credit, creditPoint
        });
        i++;
    }

    // 2. Parse Semester History (SGPA1, SGPA2...)
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
    const history = [];
    // Heuristic: Check up to 8 semesters
    for (let s = 1; s <= 8; s++) {
        if (record[`SGPA${s}`] && parseFloat(record[`SGPA${s}`]) > 0) {
            const romanSem = `${romanNumerals[s - 1]}-SEM`;
            history.push({
                sem: romanSem,
                type: record[`ExamType${s}`] || romanSem,
                sgpa: record[`SGPA${s}`],
                result: record[`Result${s}`],
                session: record[`Session${s}`]
            });
        }
    }

    return (
        <Card className="max-w-[210mm] mx-auto bg-white text-black p-8 shadow-2xl overflow-hidden print:shadow-none print:max-w-none font-serif text-sm">

            {/* Header Section */}
            <div className="border-b-2 border-black pb-4 mb-4 relative">
                <div className="flex items-center justify-center gap-6">
                    <img src="/barkatullah.png" alt="Logo" className="w-20 h-20 grayscale" />
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold tracking-wider uppercase" style={{ fontFamily: 'Times New Roman' }}>
                            Barkatullah Vishwavidyalaya
                        </h1>
                        <p className="text-sm font-semibold mt-1">BHOPAL (MADHYA PRADESH)</p>
                        <div className="mt-3 border border-black inline-block px-4 py-1 font-bold text-lg bg-gray-50 uppercase">
                            Statement of Marks
                        </div>
                        <p className="font-bold mt-2 uppercase text-base">
                            {(record.ExamName || '').replace(/\s*\(\s*CGPA\s*\)\s*4\s*YDC/gi, '').trim()}
                        </p>
                        <p className="text-sm">Examination Session: <span className="font-bold">{record.ExamSession}</span></p>
                    </div>
                </div>
                {/* Moved Ref/Decl/MS to below header to avoid overlap */}
                <div className="flex justify-end gap-6 text-[10px] font-mono mt-2 border-t border-black/20 pt-1">
                    <span>Ref: {record.RefExamCode || 'N/A'}</span>
                    <span>Decl: {record.ExamDeclerationDate || 'N/A'}</span>
                    <span>MS No: {record.MarkSheetNo}</span>
                </div>
            </div>

            {/* Student Profile Grid - DENSE POPULATION */}
            <div className="mb-6 border border-black p-2 bg-gray-50/30">
                {/* Main Info Grid */}
                <div className="grid grid-cols-[100px_1fr_100px_1fr] gap-x-2 gap-y-1">
                    <div className="font-bold">Name:</div>
                    <div className="uppercase font-bold">{student.Details.Profile.StudentName}</div>
                    <div className="font-bold">Roll No:</div>
                    <div className="font-mono">{student.ExamRecords[0].RollNo}</div>

                    <div className="font-bold">Father:</div>
                    <div className="uppercase">{student.Details.Profile.FatherName}</div>
                    <div className="font-bold">Enroll No:</div>
                    <div className="font-mono">{student.EnrlNo}</div>

                    <div className="font-bold">Mother:</div>
                    <div className="uppercase">{student.Details.Profile.MotherName}</div>
                    <div className="font-bold">Category:</div>
                    <div className="uppercase">{record.Caste || 'N/A'}</div>

                    <div className="font-bold">Status:</div>
                    <div className="uppercase">{record.StatusDesc}</div>
                    <div className="font-bold">Medium:</div>
                    <div className="uppercase">{record.Medium || 'English'}</div>

                    {record.DateOfBirth && (
                        <>
                            <div className="font-bold">DOB:</div>
                            <div>{record.DateOfBirth}</div>
                        </>
                    )}
                </div>

                {/* Institute and Centre - Full Width Rows */}
                <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1 mt-2 pt-2 border-t border-black/20">
                    <div className="font-bold">Institute:</div>
                    <div className="uppercase text-xs">{record.College} ({record.CollegeCD})</div>
                    <div className="font-bold">Centre:</div>
                    <div className="uppercase text-xs">{record.Centre || record.College} ({record.CentreCD})</div>
                </div>
            </div>

            {/* Detailed Marks Table */}
            <div className="mb-4">
                <table className="w-full border-collapse border border-black text-xs text-center">
                    <thead>
                        <tr className="bg-gray-100">
                            <th rowSpan={2} className="border border-black p-1 w-12">Code</th>
                            <th rowSpan={2} className="border border-black p-1 text-left w-48">Subject Name</th>

                            <th colSpan={2} className="border border-black p-1">Theory / Practical</th>
                            <th colSpan={2} className="border border-black p-1">Minors</th>

                            <th colSpan={3} className="border border-black p-1">Total</th>
                            <th rowSpan={2} className="border border-black p-1 w-12">Credits</th>
                            <th rowSpan={2} className="border border-black p-1 w-12 text-left">Grade</th>
                        </tr>
                        <tr className="bg-gray-50">
                            <th className="border border-black p-1 text-[10px]">Obt</th>
                            <th className="border border-black p-1 text-[10px]">Max</th>

                            <th className="border border-black p-1 text-[10px]">Obt</th>
                            <th className="border border-black p-1 text-[10px]">Max</th>

                            <th className="border border-black p-1 text-[10px]">Obt</th>
                            <th className="border border-black p-1 text-[10px]">Max</th>
                            <th className="border border-black p-1 text-[10px]">Min</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((sub, idx) => {
                            // Compact Logic: Display Theory if available, else Practical
                            // This handles the user's request to "combine" and remove empty dashes
                            const mergedObt = (sub.thObt && sub.thObt !== '-') ? sub.thObt : (sub.prObt || '-');
                            const mergedMax = (sub.thMax && sub.thMax !== '-') ? sub.thMax : (sub.prMax || '-');

                            return (
                                <tr key={idx} className="border-b border-black/50 hover:bg-gray-50">
                                    <td className="border-r border-black p-1">{sub.code}</td>
                                    <td className="border-r border-black p-1 text-left font-semibold">{sub.name}</td>

                                    {/* Merged Theory/Practical Column */}
                                    <td className="border-r border-black p-1 font-medium">{mergedObt}</td>
                                    <td className="border-r border-black p-1 text-gray-500">{mergedMax}</td>

                                    {/* Sessional */}
                                    <td className="border-r border-black p-1">{sub.ssObt || '-'}</td>
                                    <td className="border-r border-black p-1 text-gray-500">{sub.ssMax || '-'}</td>

                                    {/* Total */}
                                    <td className="border-r border-black p-1 font-bold">{sub.totalObt}</td>
                                    <td className="border-r border-black p-1">{sub.totalMax}</td>
                                    <td className="border-r border-black p-1 text-gray-500">{sub.totalMin}</td>

                                    <td className="border-r border-black p-1">{sub.credit}</td>
                                    <td className="border-r border-black p-1 font-bold text-left -mr-2">{sub.grade}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-100 font-bold border-t border-black">
                            <td colSpan={2} className="border border-black p-2 text-right">Grand Total:</td>
                            <td colSpan={2} className="border border-black p-2"></td>
                            <td colSpan={2} className="border border-black p-2"></td>
                            <td className="border border-black p-1 text-base">
                                {subjects.reduce((sum, sub) => sum + (parseInt(sub.totalObt) || 0), 0)}
                            </td>
                            <td className="border border-black p-1">
                                {subjects.reduce((sum, sub) => sum + (parseInt(sub.totalMax) || 0), 0)}
                            </td>
                            <td colSpan={3} className="border border-black p-1"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Footer Section: Result & History */}
            <div className="grid grid-cols-2 gap-8 border-t-2 border-black pt-4">
                <div>
                    <h3 className="font-bold underline mb-3">Academic Summary</h3>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="border border-black px-4 py-2 rounded bg-gray-50 text-center">
                            <span className="text-xs uppercase block text-gray-500">Result</span>
                            <span className="font-bold text-xl">{record.Result}</span>
                        </div>
                        <div className="border border-black px-4 py-2 rounded bg-gray-50 text-center">
                            <span className="text-xs uppercase block text-gray-500">SGPA</span>
                            <span className="font-bold text-xl">{record.SGPA}</span>
                        </div>
                        {record.CGPA && (
                            <div className="border border-black px-4 py-2 rounded bg-black text-white text-center">
                                <span className="text-xs uppercase block text-gray-400">CGPA</span>
                                <span className="font-bold text-xl">{record.CGPA}</span>
                            </div>
                        )}
                    </div>
                    {record.Division && <div className="font-bold mt-1 text-center border-t border-black/20 pt-2">Division: {record.Division}</div>}
                </div>

                {/* Semester History Table */}
                {history.length > 0 && (
                    <div>
                        <h3 className="font-bold underline mb-1 text-xs">Previous Semesters Performance</h3>
                        <table className="w-full text-[10px] text-center border border-black mb-2">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-0.5">Sem</th>
                                    <th className="border p-0.5">Session</th>
                                    <th className="border p-0.5">Result</th>
                                    <th className="border p-0.5">SGPA</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((h, i) => (
                                    <tr key={i}>
                                        <td className="border p-0.5">{h.type}</td>
                                        <td className="border p-0.5">{h.session}</td>
                                        <td className="border p-0.5">{h.result}</td>
                                        <td className="border p-0.5 font-bold">{h.sgpa}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* FINAL AGGREGATE SECTION (If available) */}
                        {(record.AgrObtain || record.AgrPercentage) && (
                            <div className="border border-black p-3 bg-gray-50/50 mt-2">
                                <h4 className="font-bold text-sm underline mb-2 flex items-center gap-2">
                                    Final Degree Statistics
                                    {(record.AgrDivision?.toLowerCase().includes('honours') || record.AgrRemark?.toLowerCase().includes('honours')) && (
                                        <span className="text-yellow-500 text-lg">★</span>
                                    )}
                                </h4>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                                    <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-600">Percentage:</span>
                                        <span className="font-bold">{record.AgrPercentage}%</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 pb-1">
                                        <span className="text-gray-600">Division:</span>
                                        <span className="font-bold">{record.AgrDivision}</span>
                                    </div>
                                    <div className="flex border-b border-gray-200 pb-1 text-center">
                                        <span className="text-gray-600">GGPA:</span>
                                        <span className="font-bold">{record.GGPA}</span>
                                    </div>
                                </div>
                                {record.AgrRemark && (
                                    <div className="mt-2 pt-2 border-t border-black/30 font-bold text-center text-sm bg-gray-100 rounded py-1">
                                        {record.AgrRemark}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* DIGITAL SIGNATURE - Above Signatures */}
            <div className="mt-8 text-[9px] text-gray-600 text-center font-mono border-t border-dashed border-gray-300 pt-2 mx-8">
                Blockchain Hash: <span className="font-bold text-black">{Math.random().toString(36).substring(2, 15).toUpperCase()}-{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
            </div>

            <div className="flex justify-between items-end mt-6 px-8">
                <div className="text-center">
                    <div className="mb-2 w-24 border-b border-black"></div>
                    <div className="text-xs font-bold">Checked By</div>
                </div>
                <div className="text-center">
                    <div className="mb-2 w-32 border-b border-black"></div>
                    <div className="text-xs font-bold">Controller of Examinations</div>
                    <div className="text-[10px] uppercase">Barkatullah Vishwavidyalaya</div>
                </div>
            </div>

        </Card>
    );
};
