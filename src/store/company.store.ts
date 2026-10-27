import { create } from "zustand";

interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  // Admin toggle for employee self-service. Bootstrapped from `/user/me`'s
  // company summary so the employee pages can gate on it. Absent = open.
  employeeViewEnabled?: boolean;
}

interface CompanyState {
  company: Company | null;
  setCompany: (company: Company | null) => void;
  clearCompany: () => void;
}

export const useCompanyStore = create<CompanyState>((set) => ({
  company: null,
  setCompany: (company) => set({ company }),
  clearCompany: () => set({ company: null }),
}));