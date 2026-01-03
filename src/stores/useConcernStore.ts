import { create } from 'zustand';

export type ConcernStatus = 'pending' | 'resolved' | 'rejected';
export type HelpRequestStatus = 'open' | 'responded' | 'closed';

export interface DataConcern {
    _id?: string;
    id?: string;
    studentEnrlNo: string;
    studentName: string;
    fieldToCorrect: string;
    proposedValue: string;
    proofDocName?: string;
    documentUrl?: string;
    status: ConcernStatus;
    timestamp?: string;
    createdAt?: string;
    adminResponse?: string;
}

export interface HelpRequest {
    _id?: string;
    id?: string;
    employerId: string;
    employerName: string;
    studentEnrlNo: string;
    studentName: string;
    requestDetails: string;
    status: HelpRequestStatus;
    timestamp: string;
    studentResponse?: string;
    responseTimestamp?: string;
    responseDocumentUrl?: string;
}

interface ConcernState {
    concerns: DataConcern[];
    helpRequests: HelpRequest[];
    isLoading: boolean;

    // Actions
    fetchConcerns: (studentEnrlNo?: string) => Promise<void>;
    fetchHelpRequests: (filter?: { studentEnrlNo?: string; employerId?: string }) => Promise<void>;
    raiseConcern: (concern: Omit<DataConcern, '_id' | 'id' | 'status' | 'timestamp'>) => Promise<void>;
    resolveConcern: (id: string, adminResponse: string) => Promise<void>;
    rejectConcern: (id: string, adminResponse: string) => Promise<void>;
    createHelpRequest: (req: Omit<HelpRequest, '_id' | 'id' | 'status' | 'timestamp'>) => Promise<void>;
    respondToHelpRequest: (id: string, response: string, documentUrl?: string) => Promise<void>;
    getConcernsForStudent: (enrlNo: string) => DataConcern[];
    getHelpRequestsForStudent: (enrlNo: string) => HelpRequest[];
    getHelpRequestsForEmployer: () => HelpRequest[];
}

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const useConcernStore = create<ConcernState>()((set, get) => ({
    concerns: [],
    helpRequests: [],
    isLoading: false,

    // Fetch concerns from API
    fetchConcerns: async (studentEnrlNo) => {
        set({ isLoading: true });
        try {
            // Use institute endpoint for all, or student endpoint for specific
            const url = studentEnrlNo
                ? `/api/student/concerns?enrlNo=${studentEnrlNo}`
                : '/api/institute/concerns';
            const res = await fetch(url, { headers: getAuthHeader() });
            if (res.ok) {
                const data = await res.json();
                const mapped = data.map((c: any) => ({ ...c, id: c._id }));
                set({ concerns: mapped });
            }
        } catch (error) {
            console.error('Failed to fetch concerns:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    // Fetch help requests from API
    fetchHelpRequests: async (filter) => {
        set({ isLoading: true });
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const isInstitute = user?.role === 'institute';

            let url = isInstitute ? '/api/institute/comm-logs' : '/api/employer/help-requests';

            if (filter?.studentEnrlNo && !isInstitute) {
                url = `/api/student/help-requests`;
            }

            const res = await fetch(url, { headers: getAuthHeader() });
            if (res.ok) {
                const data = await res.json();
                const mapped = data.map((h: any) => ({ ...h, id: h._id }));
                set({ helpRequests: mapped });
            }
        } catch (error) {
            console.error('Failed to fetch help requests:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    // Raise concern via API
    raiseConcern: async (data) => {
        try {
            const res = await fetch('/api/student/concern', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify(data)
            });
            const newConcern = await res.json();
            set((state) => ({
                concerns: [{ ...newConcern, id: newConcern._id }, ...state.concerns]
            }));
        } catch (error) {
            console.error('Failed to raise concern:', error);
            throw error;
        }
    },

    // Resolve concern (Institute action)
    resolveConcern: async (id, response) => {
        try {
            await fetch(`/api/institute/concern/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify({ status: 'resolved', adminResponse: response })
            });
            set((state) => ({
                concerns: state.concerns.map(c =>
                    (c._id === id || c.id === id) ? { ...c, status: 'resolved', adminResponse: response } : c
                )
            }));
        } catch (error) {
            console.error('Failed to resolve concern:', error);
        }
    },

    // Reject concern (Institute action)
    rejectConcern: async (id, response) => {
        try {
            await fetch(`/api/institute/concern/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify({ status: 'rejected', adminResponse: response })
            });
            set((state) => ({
                concerns: state.concerns.map(c =>
                    (c._id === id || c.id === id) ? { ...c, status: 'rejected', adminResponse: response } : c
                )
            }));
        } catch (error) {
            console.error('Failed to reject concern:', error);
        }
    },

    // Create help request via API
    createHelpRequest: async (data) => {
        try {
            const res = await fetch('/api/employer/help-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify(data)
            });
            const newReq = await res.json();
            set((state) => ({
                helpRequests: [{ ...newReq, id: newReq._id }, ...state.helpRequests]
            }));
        } catch (error) {
            console.error('Failed to create help request:', error);
            throw error;
        }
    },

    // Respond to help request (Student action)
    respondToHelpRequest: async (id, response, documentUrl) => {
        try {
            await fetch(`/api/student/help-request/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify({ responseText: response, documentUrl })
            });
            set((state) => ({
                helpRequests: state.helpRequests.map(h =>
                    (h._id === id || h.id === id)
                        ? { ...h, status: 'responded', studentResponse: response, responseDocumentUrl: documentUrl, responseTimestamp: new Date().toISOString() }
                        : h
                )
            }));
        } catch (error) {
            console.error('Failed to respond to help request:', error);
        }
    },

    getConcernsForStudent: (enrlNo) => get().concerns.filter(c => c.studentEnrlNo?.toLowerCase() === enrlNo?.toLowerCase()),
    getHelpRequestsForStudent: (enrlNo) => get().helpRequests.filter(h => h.studentEnrlNo?.toLowerCase() === enrlNo?.toLowerCase()),
    getHelpRequestsForEmployer: () => get().helpRequests
}));

