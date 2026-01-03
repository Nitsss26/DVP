import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, INSTITUTE_EMAIL, INSTITUTE_PASS } from '../types/auth';
import { toast } from 'sonner';

interface GrantAccessData {
    name: string;
    email: string;
    designation: string;
    password: string;
}

interface AuthContextType {
    currentUser: User | null;
    isLoading: boolean;
    // Core Auth
    verifyCredentials: (email: string, password: string) => Promise<{ user: User; token: string }>;
    startSession: (user: User, token: string) => void;
    login: (user: User) => Promise<void>; // Legacy wrapper, calls startSession internally if token present
    logout: () => void;
    // Registration
    registerUser: (user: User) => Promise<void>;
    // Institute Management
    grantAccess: (data: GrantAccessData) => Promise<void>;
    isAccessGranted: (email: string) => boolean;
    grantedEmails: User[]; // Changed to User[] objects for better UI
    revokeAccess: (email: string) => Promise<void>;
    // Helpers
    findUser: (email: string) => Promise<User | undefined>;
    updateUserPassword: (email: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [grantedEmails, setGrantedEmails] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                try {
                    // Optional: Verify token with backend /api/auth/me
                    // For now, load from storage to save latency
                    setCurrentUser(JSON.parse(storedUser));

                    // If institute, fetch staff list
                    const parsedUser = JSON.parse(storedUser);
                    if (parsedUser.role === 'institute') {
                        fetchStaffList(token);
                    }
                } catch (e) {
                    console.error("Auth init error", e);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const fetchStaffList = async (token: string) => {
        try {
            const res = await fetch('/api/institute/staff', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setGrantedEmails(data);
            }
        } catch (error) {
            console.error("Failed to fetch staff list", error);
        }
    };

    // 1. Verify Credentials (API Call)
    const verifyCredentials = async (email: string, password: string): Promise<{ user: User; token: string }> => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Login failed');
            }

            return { user: data, token: data.token };
        } catch (error: any) {
            console.error("Verify Credentials Error:", error);
            throw error;
        }
    };

    // 2. Start Session (Save to State & Storage)
    const startSession = (user: User, token: string) => {
        setCurrentUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        if (user.role === 'institute') {
            fetchStaffList(token);
        }
    };

    // Legacy Login Wrapper (adopts to components calling login(userObject))
    // We assume if a component calls this, it has already verified credentials or is doing a mock login.
    // However, to enforce backend, components should use verifyCredentials -> startSession.
    // For backward compatibility, if the passed user object has a token, we handle it.
    const login = async (user: User) => {
        // If the user object passed has a token (from backend response in Login page), use it.
        // But the User interface in simple auth.ts might not have token.
        // Only verifyCredentials returns token.
        // We will assume the caller handles startSession. 
        // This function is kept to satisfy interface but usually caller will use startSession logic.
        // If we strictly follow types, we might need to cast.

        // Use a dummy token if none provided (Fallback for magic accounts if backend didn't return one? Backend ALWAYS returns one now)
        // Check Login.tsx: it calls login(userToLogin). 
        // We will modify Login.tsx to call startSession instead.
        // So this function might become no-op or specific to purely frontend mock updates if any remain.
        console.warn("Legacy login() called. Prefer startSession().");
        setCurrentUser(user);
        // We don't have token here so we can't persist effectively for API calls.
        // User MUST update Login.tsx.
    };

    const logout = () => {
        setCurrentUser(null);
        setGrantedEmails([]);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = "/";
    };

    // Registration (API Call)
    const registerUser = async (user: User) => {
        try {
            // Map frontend User fields to Backend expected fields
            const payload = {
                ...user,
                // Ensure field names match backend expectations
                // Backend: enrollmentNo, dob, companyName, designation
                // Frontend: same
            };

            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            return;
        } catch (error: any) {
            console.error("Registration Error:", error);
            throw error;
        }
    };

    // Institute: Grant Access (Create Staff User)
    const grantAccess = async (data: GrantAccessData) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/institute/staff', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to grant access');
            }
            // Refresh list
            if (token) fetchStaffList(token);

        } catch (error: any) {
            console.error("Grant Access Error:", error);
            throw error;
        }
    };

    const revokeAccess = async (email: string) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/institute/staff/${email}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Failed to revoke access');
            }
            if (token) fetchStaffList(token);
        } catch (error: any) {
            console.error("Revoke Access Error:", error);
            toast.error(error.message);
        }
    };

    const isAccessGranted = (email: string) => {
        return grantedEmails.some(u => u.email === email);
    };

    // Helper: Find User (Mock -> API?)
    // This was used in Login.tsx to "check if user exists" locally.
    // With backend, we login to check. logic. 
    // We'll return undefined to force login flow.
    const findUser = async (email: string): Promise<User | undefined> => {
        // Not implemented on backend to allow public user search (security risk).
        // Login.tsx should rely on verifyCredentials throwing error instead.
        return undefined;
    };

    // Helper: Update Password
    const updateUserPassword = async (email: string, newPass: string) => {
        // Implement forgot password API if exists, or mock success
        // Backend doesn't have forgot-password endpoint yet.
        await new Promise(r => setTimeout(r, 1000));
        // toast.success("Password updated (Mock)");
    };

    return (
        <AuthContext.Provider value={{
            currentUser,
            isLoading,
            verifyCredentials,
            startSession,
            login,
            logout,
            grantAccess,
            isAccessGranted,
            grantedEmails,
            revokeAccess,
            registerUser,
            findUser,
            updateUserPassword
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
