export interface AccessRequest {
    id: string;
    employerId: string;
    employerName: string;
    studentEnrl: string;
    studentName: string;
    status: 'pending' | 'approved' | 'rejected';
    requestDate: string;
    purpose?: string;
    requestedFields?: string[];
    approvedFields?: string[];
    employerEmail?: string; // Added to match UI
}

const STORAGE_KEY = 'gog_access_requests';

// Initialize storage if empty
if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}

const getRequests = (): AccessRequest[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
};

const saveRequests = (requests: AccessRequest[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
};

export const requestService = {
    getAllRequests: () => getRequests(),

    getEmployerRequests: (employerId: string) => {
        return getRequests().filter(r => r.employerId === employerId);
    },

    getStudentRequests: (studentEnrl: string) => {
        return getRequests().filter(r => r.studentEnrl === studentEnrl);
    },

    sendRequest: (request: Omit<AccessRequest, 'id' | 'status' | 'requestDate'>) => {
        const requests = getRequests();
        const newRequest: AccessRequest = {
            ...request,
            id: `req_${Date.now()}`,
            status: 'pending',
            requestDate: new Date().toISOString().split('T')[0],
            // Defaults if not provided
            purpose: request.purpose || "Background Check",
            requestedFields: request.requestedFields || ["Contact Information", "Personal Details", "Academic Summary & Division", "Detailed Subject Scores"],
            approvedFields: []
        };
        saveRequests([newRequest, ...requests]);
        return newRequest;
    },

    updateStatus: (requestId: string, status: 'approved' | 'rejected') => {
        const requests = getRequests();
        const updated = requests.map(r => r.id === requestId ? { ...r, status } : r);
        saveRequests(updated);
    },

    updateApprovedFields: (requestId: string, fields: string[]) => {
        const requests = getRequests();
        const updated = requests.map(r => r.id === requestId ? { ...r, approvedFields: fields, status: 'approved' } : r);
        saveRequests(updated);
    }
};
