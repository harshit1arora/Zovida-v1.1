
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const endpoints = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    loginOtp: `${API_BASE_URL}/auth/login-otp`,
    requestOtp: `${API_BASE_URL}/auth/request-otp`,
    register: `${API_BASE_URL}/auth/register`,
  },
  prescriptions: {
    scan: `${API_BASE_URL}/prescriptions/scan`,
    manual: `${API_BASE_URL}/prescriptions/manual`,
  },
  history: (userId: string | number) => `${API_BASE_URL}/history/${userId}`,
  users: {
    profile: (userId: string | number) => `${API_BASE_URL}/users/profile/${userId}`,
  },
  reminders: {
    get: (userId: string | number) => `${API_BASE_URL}/reminders/${userId}`,
    create: `${API_BASE_URL}/reminders/`,
    update: (id: string | number) => `${API_BASE_URL}/reminders/${id}`,
    delete: (id: string | number) => `${API_BASE_URL}/reminders/${id}`,
  },
  family: {
    get: (userId: string | number) => `${API_BASE_URL}/family/${userId}`,
    add: `${API_BASE_URL}/family/`,
    update: (id: string | number) => `${API_BASE_URL}/family/${id}`,
    delete: (id: string | number) => `${API_BASE_URL}/family/${id}`,
  },
  passport: {
    save: `${API_BASE_URL}/passport/save`,
    get: (id: string) => `${API_BASE_URL}/passport/${id}`,
  },
  community: {
    posts: `${API_BASE_URL}/community/posts`,
    aiSummary: (meds: string) => `${API_BASE_URL}/community/ai-summary?meds=${meds}`,
    matchingStats: (meds: string) => `${API_BASE_URL}/community/stats/matching-profile?meds=${meds}`,
  },
  alerts: {
    get: `${API_BASE_URL}/alerts`,
    report: `${API_BASE_URL}/alerts/report`,
  },
};
