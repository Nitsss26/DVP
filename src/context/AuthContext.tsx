import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, INSTITUTE_EMAIL, INSTITUTE_PASS } from '../types/auth';

interface AuthContextType {
    currentUser: User | null;
    login: (user: User) => void;
    logout: () => void;
    grantAccess: (email: string) => void; // Institute Only
    isAccessGranted: (email: string) => boolean;
    grantedEmails: string[];
    revokeAccess: (email: string) => void;
    registerUser: (user: User) => void;
    findUser: (email: string) => User | undefined;
    updateUserPassword: (email: string, newPassword: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = "gog_mp_user";
const STORAGE_KEY_GRANTED = "gog_mp_granted_emails";
const STORAGE_KEY_REGISTERED_USERS = "gog_mp_registered_users"; // Simulates DB

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [grantedEmails, setGrantedEmails] = useState<string[]>([]);
    const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

    // Load from LocalStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem(STORAGE_KEY_USER);
        if (storedUser) {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) { console.error("Failed to parse user", e); }
        }

        const storedGranted = localStorage.getItem(STORAGE_KEY_GRANTED);
        if (storedGranted) {
            try {
                setGrantedEmails(JSON.parse(storedGranted));
            } catch (e) { console.error("Failed to parse granted emails", e); }
        }

        const storedReg = localStorage.getItem(STORAGE_KEY_REGISTERED_USERS);
        if (storedReg) {
            try {
                setRegisteredUsers(JSON.parse(storedReg));
            } catch (e) { console.error("Failed to parse registered users", e); }
        }
    }, []);

    const login = (user: User) => {
        setCurrentUser(user);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem(STORAGE_KEY_USER);
        window.location.href = "/"; // Force redirect to home
    };

    const grantAccess = (email: string) => {
        if (grantedEmails.includes(email)) return;
        const updated = [...grantedEmails, email];
        setGrantedEmails(updated);
        localStorage.setItem(STORAGE_KEY_GRANTED, JSON.stringify(updated));
    };

    const revokeAccess = (email: string) => {
        const updated = grantedEmails.filter(e => e !== email);
        setGrantedEmails(updated);
        localStorage.setItem(STORAGE_KEY_GRANTED, JSON.stringify(updated));
    };

    const isAccessGranted = (email: string) => {
        return grantedEmails.includes(email);
    };

    // Helper to simulate "Signing Up" - saving to "DB"
    const registerUser = (user: User) => {
        const updated = [...registeredUsers, user];
        setRegisteredUsers(updated);
        localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(updated));
        // Don't auto-login, redirect to login page instead
    };

    // Helper to find user in "DB"
    const findUser = (email: string): User | undefined => {
        // Mock Institute user is not in "DB", handled separately in Login page
        return registeredUsers.find(u => u.email === email);
    };

    // Update user password (for forgot password flow)
    const updateUserPassword = (email: string, newPassword: string) => {
        const updated = registeredUsers.map(user => {
            if (user.email === email) {
                return { ...user, password: newPassword };
            }
            return user;
        });
        setRegisteredUsers(updated);
        localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(updated));
    };

    return (
        <AuthContext.Provider value={{
            currentUser,
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
