import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ConcernStatus = 'pending' | 'resolved' | 'rejected';
export type HelpRequestStatus = 'open' | 'responded' | 'closed';

export interface DataConcern {
    id: string;
    studentEnrlNo: string;
    studentName: string;
    fieldToCorrect: string;
    proposedValue: string;
    proofDocName?: string; // Mock file name
    status: ConcernStatus;
    timestamp: string;
    adminResponse?: string;
}

export interface HelpRequest {
    id: string;
    employerId: string;
    employerName: string;
    studentEnrlNo: string;
    studentName: string;
    requestDetails: string; // What employer needs
    status: HelpRequestStatus;
    timestamp: string;
    studentResponse?: string; // Text or doc link
    responseTimestamp?: string;
}

interface ConcernState {
    concerns: DataConcern[];
    helpRequests: HelpRequest[];

    // Actions
    raiseConcern: (concern: Omit<DataConcern, 'id' | 'status' | 'timestamp'>) => void;
    resolveConcern: (id: string, adminResponse: string) => void;
    rejectConcern: (id: string, adminResponse: string) => void;

    createHelpRequest: (req: Omit<HelpRequest, 'id' | 'status' | 'timestamp'>) => void;
    respondToHelpRequest: (id: string, response: string) => void;

    // Getters (derived state can be handled in components or here)
    getConcernsForStudent: (enrlNo: string) => DataConcern[];
    getHelpRequestsForStudent: (enrlNo: string) => HelpRequest[];
    getHelpRequestsForEmployer: () => HelpRequest[];
}

// Initial Mock Data to populate dashboard
const INITIAL_CONCERNS: DataConcern[] = [
    {
        id: 'c_1',
        studentEnrlNo: 'R158237200015',
        studentName: 'Nitesh Kumar',
        fieldToCorrect: 'FatherName',
        proposedValue: 'Rajesh Kumar Singh',
        status: 'pending',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        proofDocName: 'aadhar_card.pdf'
    },
    {
        id: 'c_2',
        studentEnrlNo: 'R158237200016',
        studentName: 'Amit Sharma',
        fieldToCorrect: 'DOB',
        proposedValue: '1999-05-15',
        status: 'resolved',
        timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
        adminResponse: 'Updated as per 10th marksheet.'
    }
];

const INITIAL_HELP_REQUESTS: HelpRequest[] = [
    {
        id: 'h_1',
        employerId: 'emp_123',
        employerName: 'TCS Recruitment',
        studentEnrlNo: 'R158237200015',
        studentName: 'Nitesh Kumar',
        requestDetails: 'Please provide the back side of your final year marksheet.',
        status: 'open',
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
        id: 'h_2',
        employerId: 'emp_456',
        employerName: 'Wipro HR',
        studentEnrlNo: 'R158237200015',
        studentName: 'Nitesh Kumar',
        requestDetails: 'Gap certificate explanation required.',
        status: 'responded',
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
        studentResponse: 'Uploaded the medical certificate for the gap year.',
        responseTimestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    }
];

export const useConcernStore = create<ConcernState>()(
    persist(
        (set, get) => ({
            concerns: INITIAL_CONCERNS,
            helpRequests: INITIAL_HELP_REQUESTS,

            raiseConcern: (data) => {
                const newConcern: DataConcern = {
                    id: Math.random().toString(36).substring(7),
                    ...data,
                    status: 'pending',
                    timestamp: new Date().toISOString(),
                };
                set((state) => ({ concerns: [newConcern, ...state.concerns] }));
            },

            resolveConcern: (id, response) => {
                set((state) => ({
                    concerns: state.concerns.map(c =>
                        c.id === id ? { ...c, status: 'resolved', adminResponse: response } : c
                    )
                }));
            },

            rejectConcern: (id, response) => {
                set((state) => ({
                    concerns: state.concerns.map(c =>
                        c.id === id ? { ...c, status: 'rejected', adminResponse: response } : c
                    )
                }));
            },

            createHelpRequest: (data) => {
                const newReq: HelpRequest = {
                    id: Math.random().toString(36).substring(7),
                    ...data,
                    status: 'open',
                    timestamp: new Date().toISOString(),
                };
                set((state) => ({ helpRequests: [newReq, ...state.helpRequests] }));
            },

            respondToHelpRequest: (id, response) => {
                set((state) => ({
                    helpRequests: state.helpRequests.map(h =>
                        h.id === id ? { ...h, status: 'responded', studentResponse: response, responseTimestamp: new Date().toISOString() } : h
                    )
                }));
            },

            getConcernsForStudent: (enrlNo) => get().concerns.filter(c => c.studentEnrlNo === enrlNo),
            getHelpRequestsForStudent: (enrlNo) => get().helpRequests.filter(h => h.studentEnrlNo === enrlNo),
            getHelpRequestsForEmployer: () => {
                // In a real app we'd filter by employer ID, but for mock assume all visible or currently logged in employer
                return get().helpRequests;
            }
        }),
        {
            name: 'concern-store',
        }
    )
);
