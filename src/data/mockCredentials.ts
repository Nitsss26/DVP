export interface CredentialData {
    enrollmentNumber: string;
    status: "valid" | "invalid" | "revoked" | "expired";
    universityInfo: {
        universityName: string;
        collegeName: string;
        sessionYear: string;
    };
    studentInfo: {
        studentName: string;
        degreeName: string;
        degreeDescription: string;
        finalMarks: string;
        result: "Pass" | "Fail";
    };
    transactionHash: string;
    issuedOn: string;
}

export const mockCredentials: Record<string, CredentialData> = {
    "CS2021001": {
        enrollmentNumber: "CS2021001",
        status: "valid",
        universityInfo: {
            universityName: "Rajiv Gandhi Proudyogiki Vishwavidyalaya",
            collegeName: "Govt Engineering College, Bhopal",
            sessionYear: "2021-2025",
        },
        studentInfo: {
            studentName: "Rahul Sharma",
            degreeName: "Bachelor of Engineering",
            degreeDescription: "Computer Science and Engineering",
            finalMarks: "8.5 CGPA",
            result: "Pass",
        },
        transactionHash: "0x123abc456def789gh012ijk345mno678pqr",
        issuedOn: "Sep 10, 2025",
    },
    "CS2021002": {
        enrollmentNumber: "CS2021002",
        status: "valid",
        universityInfo: {
            universityName: "Rajiv Gandhi Proudyogiki Vishwavidyalaya",
            collegeName: "Govt Engineering College, Bhopal",
            sessionYear: "2021-2025",
        },
        studentInfo: {
            studentName: "Priya Patel",
            degreeName: "Bachelor of Engineering",
            degreeDescription: "Electronics and Communication Engineering",
            finalMarks: "9.1 CGPA",
            result: "Pass",
        },
        transactionHash: "0x234bcd567efg890hi123jkl456mno789pqr",
        issuedOn: "Sep 10, 2025",
    },
    "ME2020045": {
        enrollmentNumber: "ME2020045",
        status: "valid",
        universityInfo: {
            universityName: "Anna University",
            collegeName: "PSG College of Technology",
            sessionYear: "2020-2024",
        },
        studentInfo: {
            studentName: "Arjun Kumar",
            degreeName: "Master of Engineering",
            degreeDescription: "VLSI Design",
            finalMarks: "8.8 CGPA",
            result: "Pass",
        },
        transactionHash: "0x345cde678fgh901ij234klm567nop890qrs",
        issuedOn: "Jun 15, 2024",
    },
    "BT2021078": {
        enrollmentNumber: "BT2021078",
        status: "valid",
        universityInfo: {
            universityName: "Delhi University",
            collegeName: "St. Stephen's College",
            sessionYear: "2021-2024",
        },
        studentInfo: {
            studentName: "Sneha Reddy",
            degreeName: "Bachelor of Science",
            degreeDescription: "Biotechnology",
            finalMarks: "87.5%",
            result: "Pass",
        },
        transactionHash: "0x456def789ghi012jk345lmn678opq901rst",
        issuedOn: "May 20, 2024",
    },
    "EC2022011": {
        enrollmentNumber: "EC2022011",
        status: "revoked",
        universityInfo: {
            universityName: "VTU - Visvesvaraya Technological University",
            collegeName: "RV College of Engineering",
            sessionYear: "2022-2026",
        },
        studentInfo: {
            studentName: "Vikram Singh",
            degreeName: "Bachelor of Engineering",
            degreeDescription: "Electrical and Computer Engineering",
            finalMarks: "7.2 CGPA",
            result: "Pass",
        },
        transactionHash: "0x567efg890hij123kl456mno789pqr012stu",
        issuedOn: "Pending",
    },
};
