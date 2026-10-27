import type { ProductModule } from "../../../constants/modules";
import type { Company } from "../../../types/company.types";

export type SubscriptionStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED"
  | "TRIAL"
  | "SUSPENDED"
  | "GRACE_PERIOD";

export type PaymentMode = "UPI" | "BANK_TRANSFER" | "CHEQUE" | "CASH" | "INVOICE";

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanySubscription {
  id: string;
  companyId: string;
  planId: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  status: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
  plan?: SubscriptionPlan;
}

export interface AuditHistory {
  id: string;
  companyId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: any;
  newValue: any;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CompanySubscriptionDetails {
  company: Company;
  subscription: CompanySubscription | null;
  modules: ProductModule[];
  capabilities: Record<string, boolean>;
  navigation: any;
  auditHistory: AuditHistory[];
  paymentHistory?: any[];
  renewalHistory?: any[];
}

export interface ActivateSubscriptionPayload {
  companyId: string;
  planCode: string;
  durationMonths: number;
  paymentMode?: PaymentMode;
  paymentReference?: string;
  amount?: number;
  currency?: string;
  invoiceNumber?: string;
  notes?: string;
}

export interface RenewSubscriptionPayload {
  companyId: string;
  durationMonths: number;
  paymentMode?: PaymentMode;
  paymentReference?: string;
  amount?: number;
  currency?: string;
  invoiceNumber?: string;
  notes?: string;
}

export interface CancelSubscriptionPayload {
  companyId: string;
  reason?: string;
}

export interface ListSubscriptionsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  plan?: string;
  module?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ChangePlanSubscriptionPayload {
  companyId: string;
  planCode: string;
  reason?: string;
}

export interface SuspendSubscriptionPayload {
  companyId: string;
  reason?: string;
}

export interface ReactivateSubscriptionPayload {
  companyId: string;
}
