import { create } from 'zustand';

export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'employer' | 'student' | 'university';

export interface AccessRequest {
    _id?: string;  // MongoDB ID
    id?: string;   // Alias for compatibility
    employerId: string;
    employerName: string;
    employerEmail?: string;
    purpose: string;
    documentUrl?: string;
    studentEnrlNo: string;
    studentName: string;
    requestedFields: string[];
    approvedFields: string[];
    status: RequestStatus;
    timestamp: string;
}

interface VerificationState {
    currentUserRole: UserRole;
    requests: AccessRequest[];
    isLoading: boolean;

    // Actions
    setRole: (role: UserRole) => void;
    fetchRequests: (filter?: { employerId?: string; studentEnrlNo?: string }) => Promise<void>;
    requestAccess: (req: Omit<AccessRequest, '_id' | 'id' | 'status' | 'timestamp' | 'approvedFields'>) => Promise<void>;
    approveRequest: (requestId: string, selectedFields: string[]) => Promise<void>;
    updateApprovedFields: (requestId: string, newFields: string[]) => Promise<void>;
    rejectRequest: (requestId: string) => Promise<void>;
    revokeAccess: (requestId: string) => Promise<void>;
    getRequestsForStudent: (enrlNo: string) => AccessRequest[];
    getRequestsForEmployer: () => AccessRequest[];
}

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const useVerificationStore = create<VerificationState>()((set, get) => ({
    currentUserRole: 'employer',
    requests: [],
    isLoading: false,

    setRole: (role) => set({ currentUserRole: role }),

    // Fetch requests from API
    fetchRequests: async (filter) => {
        set({ isLoading: true });
        try {
            let url = '/api/requests';
            const params = new URLSearchParams();
            if (filter?.employerId) params.append('employerId', filter.employerId);
            if (filter?.studentEnrlNo) params.append('studentEnrlNo', filter.studentEnrlNo);
            if (params.toString()) url += `?${params.toString()}`;

            const res = await fetch(url, { headers: getAuthHeader() });
            const data = await res.json();

            // Map _id to id for frontend compatibility
            const mapped = data.map((r: any) => ({ ...r, id: r._id }));
            set({ requests: mapped });
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    // Create new request via API
    requestAccess: async (reqData) => {
        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify(reqData)
            });
            const newRequest = await res.json();
            set((state) => ({
                requests: [{ ...newRequest, id: newRequest._id }, ...state.requests]
            }));
        } catch (error) {
            console.error('Failed to create request:', error);
            throw error;
        }
    },

    // Approve request via API
    approveRequest: async (requestId, selectedFields) => {
        try {
            const res = await fetch(`/api/requests/${requestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify({ status: 'approved', approvedFields: selectedFields })
            });
            const updated = await res.json();
            set((state) => ({
                requests: state.requests.map((req) =>
                    (req._id === requestId || req.id === requestId)
                        ? { ...updated, id: updated._id }
                        : req
                ),
            }));
        } catch (error) {
            console.error('Failed to approve request:', error);
        }
    },

    // Update approved fields
    updateApprovedFields: async (requestId, newFields) => {
        try {
            const res = await fetch(`/api/requests/${requestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify({ approvedFields: newFields })
            });
            const updated = await res.json();
            set((state) => ({
                requests: state.requests.map((req) =>
                    (req._id === requestId || req.id === requestId)
                        ? { ...updated, id: updated._id }
                        : req
                ),
            }));
        } catch (error) {
            console.error('Failed to update fields:', error);
        }
    },

    // Reject request via API
    rejectRequest: async (requestId) => {
        try {
            await fetch(`/api/requests/${requestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify({ status: 'rejected' })
            });
            set((state) => ({
                requests: state.requests.map((req) =>
                    (req._id === requestId || req.id === requestId)
                        ? { ...req, status: 'rejected' }
                        : req
                ),
            }));
        } catch (error) {
            console.error('Failed to reject request:', error);
        }
    },

    // Revoke/Delete request via API
    revokeAccess: async (requestId) => {
        try {
            await fetch(`/api/requests/${requestId}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
            set((state) => ({
                requests: state.requests.filter(req => req._id !== requestId && req.id !== requestId)
            }));
        } catch (error) {
            console.error('Failed to revoke access:', error);
        }
    },

    getRequestsForStudent: (enrlNo) => {
        return get().requests.filter(req => req.studentEnrlNo?.toLowerCase() === enrlNo?.toLowerCase());
    },

    getRequestsForEmployer: () => {
        return get().requests;
    },
}));

