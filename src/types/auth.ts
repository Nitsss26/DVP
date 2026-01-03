export type UserRole = 'student' | 'employer' | 'institute' | 'admin';

export interface User {
    uid: string;
    email: string;
    name: string;
    role: UserRole;
    phone?: string;
    password?: string;
    // Employer specifics
    companyName?: string;
    designation?: string;
    // Student specifics
    enrollmentNo?: string;
    dob?: string;
    // Account metadata
    createdAt?: string;
}

export interface AuthState {
    currentUser: User | null;
    isLoading: boolean;
}

export const MOCK_OTP = "123456";
export const INSTITUTE_EMAIL = "coe@gog.com";
export const INSTITUTE_PASS = "123456";
