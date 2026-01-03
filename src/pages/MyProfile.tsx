import React from 'react';
import { useAuth } from '../context/AuthContext';
import { STUDENTS_DATA, getStudent } from '../data/mockData';
import { Marksheet } from '@/components/credential/Marksheet';
import { Button } from '@/components/ui/button';

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const MyProfile = () => {
    const { currentUser } = useAuth();

    // Employer Profile View
    if (currentUser.role === 'employer') {
        return (
            <div className="flex flex-col min-h-screen bg-slate-50">
                <Header />
                <main className="container mx-auto py-8 px-4 flex-1">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">
                                {currentUser.name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{currentUser.name}</h1>
                                <p className="text-gray-500">Employer Account</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <h2 className="text-lg font-semibold mb-4 border-b pb-2">Company Details</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-500">Company Name</label>
                                        <p className="font-medium">{currentUser.companyName || "Not Provided"}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Designation</label>
                                        <p className="font-medium">{currentUser.designation || "Not Provided"}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Work Email</label>
                                        <p className="font-medium">{currentUser.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Contact Number</label>
                                        <p className="font-medium flex items-center gap-2">
                                            {currentUser.phone || "Not Provided"}
                                            {currentUser.phone && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800 border border-green-200">
                                                    Verified
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <h2 className="text-lg font-semibold mb-4 border-b pb-2">Account Status</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-500">Verification Status</label>
                                        <div className="mt-1">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Member Since</label>
                                        <p className="font-medium">
                                            {currentUser.createdAt
                                                ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                                                : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="pt-2">
                                        <Button className="w-full" variant="outline" onClick={() => window.location.href = '/employer/requests'}>
                                            View Access Requests
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!currentUser.enrollmentNo) {
        return <div className="p-8 text-center text-red-600">No student profile found for this account.</div>;
    }

    // Fetch Student Record
    // Note: getStudent expects (enrl, year), but here we might just search by EnrlNo across all?
    // User said "match with any of the record". 
    // Let's find index.
    const student = STUDENTS_DATA.find(s => s.EnrlNo === (currentUser.enrollmentNo || "R158237200015"));

    if (!student) {
        return <div className="p-8 text-center bg-yellow-50 text-yellow-800">
            Record not found in the local registry for Enrollment No: {currentUser.enrollmentNo}.
            Please contact the University.
        </div>;
    }

    // Mock Exam Record for Marksheet View (using the first exam record found or synthesizing)
    const examRecord = student.ExamRecords[0]; // Simplification

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <Header />
            <main className="container mx-auto py-8 px-4 flex-1">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Academic Profile</h1>
                        <p className="text-gray-500">Welcome, {currentUser.name}</p>
                    </div>

                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-gray-400">
                                    {currentUser.name.charAt(0)}
                                </div>
                                <h2 className="mt-4 text-xl font-bold">{student.Details.Profile.StudentName}</h2>
                                <p className="text-gray-500">{student.EnrlNo}</p>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-500">Batch</span>
                                    <span className="font-semibold text-right">{student.Details.Profile.Batch}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-500">Father's Name</span>
                                    <span className="font-semibold text-right">{student.Details.Profile.FatherName}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-500">Mother's Name</span>
                                    <span className="font-semibold text-right">{student.Details.Profile.MotherName}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-500">Date of Birth</span>
                                    <span className="font-semibold text-right">{student.Details.Profile.DOB}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-500">Gender</span>
                                    <span className="font-semibold text-right">{student.Details.Profile.Gender}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-500">Category</span>
                                    <span className="font-semibold text-right">{student.Details.Profile.Category}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Marksheet View */}
                    <div className="lg:col-span-2">
                        {examRecord ? (
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="p-4 bg-orange-50 border-b border-orange-100 mb-4">
                                    <h3 className="font-bold text-orange-800">Latest Exam Record</h3>
                                </div>
                                <div className="px-4 pb-4 overflow-x-auto">
                                    <Marksheet student={student} record={examRecord} />
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 text-center border-2 border-dashed rounded-lg">
                                No exam records found.
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default MyProfile;
