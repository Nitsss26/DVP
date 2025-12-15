import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'employer' | 'student' | 'university';

export interface AccessRequest {
    id: string;
    employerId: string;
    employerName: string;
    employerEmail?: string;
    purpose: string;
    studentEnrlNo: string;
    studentName: string;
    requestedFields: string[]; // What they asked for
    approvedFields: string[];  // What student actually gave
    status: RequestStatus;
    timestamp: string;
}

interface VerificationState {
    currentUserRole: UserRole;
    requests: AccessRequest[];

    // Actions
    setRole: (role: UserRole) => void;
    requestAccess: (req: Omit<AccessRequest, 'id' | 'status' | 'timestamp' | 'approvedFields'>) => void;
    approveRequest: (requestId: string, selectedFields: string[]) => void;
    updateApprovedFields: (requestId: string, newFields: string[]) => void;
    rejectRequest: (requestId: string) => void;
    revokeAccess: (requestId: string) => void;
    getRequestsForStudent: (enrlNo: string) => AccessRequest[];
    getRequestsForEmployer: () => AccessRequest[];
    syncFromStorage: () => void; // New: manual sync from localStorage
}

const STORAGE_KEY = 'verification-store';

export const useVerificationStore = create<VerificationState>()(
    persist(
        (set, get) => ({
            currentUserRole: 'employer',
            requests: [],

            setRole: (role) => set({ currentUserRole: role }),

            requestAccess: (reqData) => {
                const newRequest: AccessRequest = {
                    id: Math.random().toString(36).substring(7),
                    ...reqData,
                    approvedFields: [], // Initially none
                    status: 'pending',
                    timestamp: new Date().toISOString(),
                };
                set((state) => ({ requests: [newRequest, ...state.requests] }));
            },

            approveRequest: (requestId, selectedFields) => {
                set((state) => ({
                    requests: state.requests.map((req) =>
                        req.id === requestId ? { ...req, status: 'approved', approvedFields: selectedFields } : req
                    ),
                }));
            },

            updateApprovedFields: (requestId, newFields) => {
                set((state) => ({
                    requests: state.requests.map((req) =>
                        req.id === requestId ? { ...req, approvedFields: newFields } : req
                    ),
                }));
            },

            rejectRequest: (requestId) => {
                set((state) => ({
                    requests: state.requests.map((req) =>
                        req.id === requestId ? { ...req, status: 'rejected' } : req
                    ),
                }));
            },

            revokeAccess: (requestId) => {
                set((state) => ({
                    requests: state.requests.filter(req => req.id !== requestId)
                }));
            },

            getRequestsForStudent: (enrlNo) => {
                return get().requests.filter(req => req.studentEnrlNo.toLowerCase() === enrlNo.toLowerCase());
            },

            getRequestsForEmployer: () => {
                return get().requests;
            },

            // Sync state from localStorage (used for cross-tab sync)
            syncFromStorage: () => {
                try {
                    const stored = localStorage.getItem(STORAGE_KEY);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        if (parsed?.state?.requests) {
                            set({ requests: parsed.state.requests });
                        }
                    }
                } catch (e) {
                    console.error('Failed to sync from storage:', e);
                }
            }
        }),
        {
            name: STORAGE_KEY,
        }
    )
);

// Cross-tab synchronization using storage event
if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY && event.newValue) {
            // Another tab updated the store, sync our state
            useVerificationStore.getState().syncFromStorage();
        }
    });

    // Also check for updates when the tab becomes visible (handles some edge cases)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            useVerificationStore.getState().syncFromStorage();
        }
    });
}
