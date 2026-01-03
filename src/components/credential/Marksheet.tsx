import React from 'react';
import { Card } from "@/components/ui/card";
import { StudentData, ExamRecord } from "@/data/mockData";

interface MarksheetProps {
    student: StudentData;
    record: ExamRecord;
    isVerified?: boolean;
}

export const Marksheet: React.FC<MarksheetProps> = ({ student, record, isVerified }) => {
    // 1. Parse Subjects from API's Subjects array (NEW FORMAT)
    // The API now returns record.Subjects as an array
    const subjects = (record.Subjects || []).map((sub: any) => {
        // Infer Max from Min if Max is missing: Min 50 -> Max 100, Min 25 -> Max 50
        let inferredMax = sub.TotalMax || '--';
        if (inferredMax === '--' || !inferredMax) {
            const minMarks = parseInt(sub.MinMarks, 10);
            if (!isNaN(minMarks)) {
                inferredMax = (minMarks * 2).toString(); // Min 50 -> Max 100, Min 25 -> Max 50
            }
        }

        return {
            code: sub.SubCode || '--',
            name: sub.SubName || '--',
            thObt: sub.Theory || sub.TotalObt || '--',
            thMax: inferredMax,
            thMin: sub.MinMarks || '--',
            ssObt: '--', // No separate sessional data in our DB
            ssMax: '--',
            prObt: sub.Practical || '--',
            prMax: '--',
            totalObt: sub.TotalObt || '--',
            totalMax: inferredMax,
            totalMin: sub.MinMarks || '--',
            grade: sub.Grade || '--',
            credit: sub.Credits || '--',
            creditPoint: sub.GradePoint || '--',
            subResult: sub.SubResult || '--'
        };
    });

    // Fallback: If Subjects array is empty, try old Sub1/Sub2 format
    if (subjects.length === 0) {
        let i = 1;
        while (record[`Sub${i}`]) {
            const code = record[`Sub${i}Code`];
            const name = record[`Sub${i}`];
            const thObt = record[`Sub${i}Th1Obtn`] || record[`Sub${i}ThObtn`];
            const thMax = record[`Sub${i}Th1OutOf`] || record[`Sub${i}ThMax`];
            const thMin = record[`Sub${i}Th Min`] || record[`Sub${i}ThMin`];
            const ssObt = record[`Sub${i}Ss1Obtn`] || record[`Sub${i}SsObtn`];
            const ssMax = record[`Sub${i}Ss1OutOf`] || record[`Sub${i}SsMax`];
            const prObt = record[`Sub${i}Pr1Obtn`] || record[`Sub${i}PrObtn`];
            const prMax = record[`Sub${i}Pr1OutOf`] || record[`Sub${i}PrMax`];
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
                grade, credit, creditPoint, subResult: '--'
            });
            i++;
        }
    }

    // 2. Parse Semester History
    // Strategy: Look at ALL ExamRecords in student.ExamRecords to build history.
    // MongoDB stores each semester as a separate object with Result, SGPA, Semester fields.
    // Also check for flattened fields (Result1, SGPA1) within the current record as fallback.

    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

    // Determine total semesters based on course duration
    const examName = record.ExamName || '';
    let totalSemesters = 8; // default to 8 semesters (4 year course)
    if (examName.includes('2 YDC') || examName.includes('2YDC') || examName.includes('2YRS') || examName.toLowerCase().includes('2 year')) {
        totalSemesters = 4;
    } else if (examName.includes('3 YDC') || examName.includes('3YDC') || examName.includes('3YRS') || examName.toLowerCase().includes('3 year')) {
        totalSemesters = 6;
    } else if (examName.includes('5 YDC') || examName.includes('5YDC') || examName.includes('5YRS') || examName.toLowerCase().includes('5 year')) {
        totalSemesters = 10;
    }

    // Build semester history from student.ExamRecords array
    const history: Array<{ sem: string, result: string, sgpa: string }> = [];

    // Create a map of semester number to record data from ExamRecords array
    const semesterMap: { [key: number]: { result: string, sgpa: string } } = {};

    if (student && student.ExamRecords && Array.isArray(student.ExamRecords)) {
        for (const examRec of student.ExamRecords) {
            // Extract semester number from Semester field (e.g., "1 SEM", "2 SEM", "3 SEM")
            const semField = examRec.Semester || '';
            const semMatch = semField.match(/(\d+)/);
            if (semMatch) {
                const semNum = parseInt(semMatch[1], 10);
                semesterMap[semNum] = {
                    result: examRec.Result || 'NOT AVAILABLE',
                    sgpa: examRec.SGPA || 'NOT AVAILABLE'
                };
            }
        }
    }

    // Also check for flattened fields in the current record (SGPA1, Result1, etc.)
    for (let s = 1; s <= totalSemesters; s++) {
        const rawResult = record[`Result${s}`];
        const rawSGPA = record[`SGPA${s}`];
        if ((rawResult || rawSGPA) && !semesterMap[s]) {
            semesterMap[s] = {
                result: rawResult || 'NOT AVAILABLE',
                sgpa: rawSGPA || 'NOT AVAILABLE'
            };
        }
    }

    // Build final history array
    for (let s = 1; s <= totalSemesters; s++) {
        const semName = `${romanNumerals[s - 1]}-SEM`;
        const semData = semesterMap[s] || { result: 'NOT AVAILABLE', sgpa: 'NOT AVAILABLE' };

        history.push({
            sem: semName,
            result: semData.result,
            sgpa: semData.sgpa
        });
    }

    return (
        <Card className="max-w-[210mm] mx-auto bg-white text-black p-8 shadow-2xl overflow-hidden print:shadow-none print:max-w-none font-serif text-sm">

            {/* Header Section */}
            <div className="border-b-2 border-black pb-2 mb-2 font-serif">
                <div className="flex items-start justify-between">
                    {/* Logo on Left */}
                    <div className="w-20">
                        <img src="/barkatullah.png" alt="BU Logo" className="w-16 h-16 object-contain" />
                    </div>

                    {/* Center Content */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <h1 className="text-3xl font-bold tracking-wider uppercase mb-1" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                            Barkatullah Vishwavidyalaya
                        </h1>
                        <p className="text-sm font-bold mb-2">BHOPAL (MADHYA PRADESH)</p>

                        <div className="border border-black px-6 py-1 font-bold text-lg mb-2">
                            STATEMENT OF MARKS
                        </div>

                        <h2 className="font-bold text-lg uppercase mb-1">
                            {(record.ExamName || '').replace(/\s*\(\s*CGPA\s*\)\s*4\s*YDC/gi, '').trim()}
                        </h2>
                        <p className="text-sm font-medium">
                            Examination Session: <span className="font-bold uppercase">{record.ExamSession}</span>
                        </p>
                    </div>

                    {/* Spacer for balance */}
                    <div className="w-20"></div>
                </div>

                {/* Ref/Decl/MS No - Right aligned, below exam session, like reference image */}
                <div className="text-right text-[11px] mt-2">
                    <span>Ref: <span className="font-bold">{record.RefExamCode || 'N/A'}</span></span>
                    <span className="ml-6">Decl: <span className="font-bold">{record.ExamDeclerationDate || 'N/A'}</span></span>
                    <span className="ml-6">MS No: <span className="font-bold">{record.MarkSheetNo || '1'}</span></span>
                </div>
            </div>

            {/* Student Profile - Split Left/Right Layout from Screenshot */}
            <div className="mb-4 border-t-2 border-b-2 border-black py-2">
                <div className="flex justify-between gap-8">
                    {/* Left Column Group */}
                    <div className="flex-1 grid grid-cols-[80px_1fr] gap-y-1 text-sm">
                        <div className="font-bold">Name:</div>
                        <div className="uppercase font-bold">{student.Details.Profile.StudentName || 'NOT AVAILABLE'}</div>

                        <div className="font-bold">Father:</div>
                        <div className="uppercase">{student.Details.Profile.FatherName || 'NOT AVAILABLE'}</div>

                        <div className="font-bold">Mother:</div>
                        <div className="uppercase">{student.Details.Profile.MotherName || record.MotherName || 'NOT AVAILABLE'}</div>

                        <div className="font-bold">Status:</div>
                        <div className="uppercase">{record.StatusDesc || 'REGULAR'}</div>

                        <div className="font-bold">DOB:</div>
                        <div>{record.DOB || 'NOT AVAILABLE'}</div>
                    </div>

                    {/* Right Column Group */}
                    <div className="flex-1 grid grid-cols-[80px_1fr] gap-y-1 text-sm">
                        <div className="font-bold">Roll No:</div>
                        <div className="font-mono font-bold">{student.ExamRecords[0]?.RollNo || 'NOT AVAILABLE'}</div>

                        <div className="font-bold">Enroll No:</div>
                        <div className="font-mono">{student.EnrlNo || 'NOT AVAILABLE'}</div>

                        <div className="font-bold">Category:</div>
                        <div className="uppercase">{record.Category || 'NOT AVAILABLE'}</div>

                        <div className="font-bold">Medium:</div>
                        <div className="uppercase">{record.Medium || 'NOT AVAILABLE'}</div>
                    </div>
                </div>

                {/* Institute / Centre - Full Width Below */}
                <div className="mt-3 pt-2 border-t border-black/30 grid grid-cols-[80px_1fr] gap-y-1 text-sm">
                    <div className="font-bold">Institute:</div>
                    <div className="uppercase truncate">
                        {record.College || 'NOT AVAILABLE'}
                    </div>

                    <div className="font-bold">Centre:</div>
                    <div className="uppercase truncate">
                        {record.Centre || record.College || 'NOT AVAILABLE'}
                    </div>
                </div>
            </div>

            {/* Detailed Marks Table */}
            <div className="mb-6">
                <table className="w-full border-collapse border border-black text-xs text-center font-serif">
                    <thead>
                        <tr className="bg-white">
                            <th rowSpan={2} className="border border-black p-1 w-10">Code</th>
                            <th rowSpan={2} className="border border-black p-1 text-left w-48 pl-2">Subject Name</th>

                            <th colSpan={2} className="border border-black p-1">Theory / Practical</th>
                            <th colSpan={2} className="border border-black p-1">Minors</th>

                            <th colSpan={3} className="border border-black p-1">Total</th>
                            <th rowSpan={2} className="border border-black p-1 w-10">Credits</th>
                            <th rowSpan={2} className="border border-black p-1 w-10">Grade</th>
                        </tr>
                        <tr className="bg-white">
                            <th className="border border-black p-1 w-10">Obt</th>
                            <th className="border border-black p-1 w-10">Max</th>

                            <th className="border border-black p-1 w-10">Obt</th>
                            <th className="border border-black p-1 w-10">Max</th>

                            <th className="border border-black p-1 w-10 font-bold">Obt</th>
                            <th className="border border-black p-1 w-10">Max</th>
                            <th className="border border-black p-1 w-10">Min</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map((sub, idx) => {
                            // Compact Logic: Display Theory if available, else Practical
                            const mergedObt = (sub.thObt && sub.thObt !== '-') ? sub.thObt : (sub.prObt || '-');
                            const mergedMax = (sub.thMax && sub.thMax !== '-') ? sub.thMax : (sub.prMax || '-');

                            return (
                                <tr key={idx} className="border-b border-black/50">
                                    <td className="border-r border-black p-1.5">{sub.code}</td>
                                    <td className="border-r border-black p-1.5 text-left font-bold pl-2">{sub.name}</td>

                                    <td className="border-r border-black p-1.5">{mergedObt}</td>
                                    <td className="border-r border-black p-1.5 text-gray-500">{mergedMax}</td>

                                    <td className="border-r border-black p-1.5">{sub.ssObt === '--' ? '-' : sub.ssObt}</td>
                                    <td className="border-r border-black p-1.5 text-gray-500">{sub.ssMax === '--' ? '-' : sub.ssMax}</td>

                                    <td className="border-r border-black p-1.5 font-bold">{sub.totalObt}</td>
                                    <td className="border-r border-black p-1.5">{sub.totalMax}</td>
                                    <td className="border-r border-black p-1.5 text-gray-500">{sub.totalMin === '--' ? '-' : sub.totalMin}</td>

                                    <td className="border-r border-black p-1.5">{sub.credit === '--' ? '-' : sub.credit}</td>
                                    <td className="border-black p-1.5">{sub.grade === '--' ? '-' : sub.grade}</td>
                                </tr>
                            );
                        })}
                        {/* Grand Total Row - Calculate from subjects */}
                        {(() => {
                            const grandObt = subjects.reduce((sum, sub) => {
                                const val = parseInt(sub.totalObt, 10);
                                return sum + (isNaN(val) ? 0 : val);
                            }, 0);
                            const grandMax = subjects.reduce((sum, sub) => {
                                const val = parseInt(sub.totalMax, 10);
                                return sum + (isNaN(val) ? 0 : val);
                            }, 0);
                            return (
                                <tr className="border-t-2 border-black font-bold bg-gray-50/50">
                                    <td colSpan={6} className="text-right p-2 pr-4 border-r border-black">Grand Total:</td>
                                    <td className="border-r border-black p-2">{grandObt || record.TotalObt}</td>
                                    <td className="border-r border-black p-2">{grandMax || record.TotalMax}</td>
                                    <td colSpan={3} className="border-black"></td>
                                </tr>
                            );
                        })()}
                    </tbody>
                </table>
            </div>

            {/* Footer Layout: Left (Academic Summary) vs Right (History + Stats) */}
            <div className="flex gap-8 mb-8 font-serif">

                {/* LEFT: Academic Summary */}
                <div className="flex-1">
                    <h3 className="font-bold underline mb-3 text-sm uppercase">Academic Summary</h3>

                    <div className="flex gap-4 mb-4">
                        <div className="border border-black p-2 text-center w-32 flex flex-col justify-center min-h-[60px]">
                            <div className="text-[10px] uppercase text-gray-600 mb-1">RESULT</div>
                            <div className="font-bold text-sm leading-tight break-words">{record.Result}</div>
                        </div>

                        <div className="border border-black p-2 text-center w-32 flex flex-col justify-center min-h-[60px]">
                            <div className="text-[10px] uppercase text-gray-600 mb-1">SGPA</div>
                            <div className="font-bold text-sm leading-tight break-words">{record.SGPA}</div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Previous Semesters & Final Stats */}
                <div className="w-[380px]">
                    {/* Previous Semesters Performance - Matching reference image exactly */}
                    <h3 className="font-bold text-sm uppercase text-center mb-2" style={{ textDecoration: 'underline' }}>PREVIOUS SEMESTERS PERFORMANCE</h3>

                    <table className="w-full border-2 border-black mb-4 text-center text-xs">
                        <thead>
                            <tr className="border-b-2 border-black">
                                <th className="border-r-2 border-black p-2 font-bold">Sem</th>
                                <th className="border-r-2 border-black p-2 font-bold">Result</th>
                                <th className="p-2 font-bold">SGPA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((h, i) => (
                                <tr key={i} className="border-b border-black">
                                    <td className="border-r-2 border-black p-2 font-bold">{h.sem}</td>
                                    <td className="border-r-2 border-black p-2">{h.result}</td>
                                    <td className="p-2 font-bold">{h.sgpa}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Final Degree Statistics - Matching reference image exactly */}
                    <table className="w-full border-2 border-black text-xs">
                        <thead>
                            <tr>
                                <th colSpan={3} className="border-b-2 border-black p-2 text-left font-bold text-sm">Final Degree Statistics</th>
                            </tr>
                            <tr className="border-b-2 border-black">
                                <th className="border-r-2 border-black p-2 font-bold">Percentage</th>
                                <th className="border-r-2 border-black p-2 font-bold">GGPA</th>
                                <th className="p-2 font-bold">Division</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border-r-2 border-black p-2 text-center font-bold">{record.AgrPercentage || record.Percentage || '-'}%</td>
                                <td className="border-r-2 border-black p-2 text-center font-bold">{record.GGPA || record.CGPA || '-'}</td>
                                <td className="p-2 text-center font-bold uppercase">{record.AgrDivision || record.Division || '-'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Signatures */}
            <div className="mt-12 pt-8 border-t border-dotted border-black/30 flex justify-between items-end font-serif px-8">
                <div className="text-center">
                    <div className="font-bold border-t border-black px-8 pt-1 text-sm">Checked By</div>
                </div>

                <div className="text-center">
                    <div className="font-bold px-8 pt-1 text-sm">Controller of Examinations</div>
                    <div className="text-[10px] uppercase">BARKATULLAH VISHWAVIDYALAYA</div>
                </div>
            </div>

            <div className="mt-8 text-[10px] text-gray-400 font-mono text-center">
                Blockchain Hash: {isVerified ? 'VERIFIED-ON-CHAIN-ABC123XYZ' : 'PENDING'}
            </div>
        </Card>
    );
};
