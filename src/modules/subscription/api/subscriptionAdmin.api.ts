import api from "../../../api/axios";
import type { Company } from "../../../types/company.types";
import type {
  ActivateSubscriptionPayload,
  CancelSubscriptionPayload,
  ChangePlanSubscriptionPayload,
  CompanySubscriptionDetails,
  ListSubscriptionsParams,
  ReactivateSubscriptionPayload,
  RenewSubscriptionPayload,
  SubscriptionPlan,
  SuspendSubscriptionPayload,
} from "../types";

// =============================================================================
// SUPER ADMIN SUBSCRIPTION MANAGEMENT API CLIENT
// =============================================================================

export interface PaginatedSubscriptionsResponse {
  summary: {
    active: number;
    expired: number;
    trial: number;
    cancelled: number;
    suspended: number;
    expiringSoon?: number;
  };
  items: any[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const getPendingCompanies = async () => {
  const { data } = await api.get<{ success: boolean; data: Company[] }>("/admin/subscriptions/pending");
  return data.data;
};

export const getSubscriptions = async (params?: ListSubscriptionsParams) => {
  const { data } = await api.get<{ success: boolean; data: PaginatedSubscriptionsResponse }>(
    "/admin/subscriptions",
    { params },
  );
  return data.data;
};

export const getCompanySubscription = async (companyId: string) => {
  const { data } = await api.get<{ success: boolean; data: CompanySubscriptionDetails }>(
    `/admin/subscriptions/company/${companyId}`
  );
  return data.data;
};

export const activateSubscription = async (payload: ActivateSubscriptionPayload) => {
  const { data } = await api.post<{
    success: boolean;
    message: string;
    subscription: any;
  }>("/admin/subscriptions/activate", payload);
  return data;
};

export const renewSubscription = async (payload: RenewSubscriptionPayload) => {
  const { data } = await api.post<{
    success: boolean;
    message: string;
    endDate: string;
  }>("/admin/subscriptions/renew", payload);
  return data;
};

export const cancelSubscription = async (payload: CancelSubscriptionPayload) => {
  const { data } = await api.post<{
    success: boolean;
    message: string;
    disabledModulesCount: number;
  }>("/admin/subscriptions/cancel", payload);
  return data;
};

export const getPlans = async () => {
  // Plan catalogue is retrieved from the regular subscription catalogue endpoint
  const { data } = await api.get<{ success: boolean; data: SubscriptionPlan[] }>("/subscription/plans");
  return data.data;
};

export const changePlanSubscription = async (payload: ChangePlanSubscriptionPayload) => {
  const { data } = await api.post<{
    success: boolean;
    message: string;
  }>("/admin/subscriptions/change-plan", payload);
  return data;
};

export const suspendSubscription = async (payload: SuspendSubscriptionPayload) => {
  const { data } = await api.post<{
    success: boolean;
    message: string;
  }>("/admin/subscriptions/suspend", payload);
  return data;
};

export const reactivateSubscription = async (payload: ReactivateSubscriptionPayload) => {
  const { data } = await api.post<{
    success: boolean;
    message: string;
  }>("/admin/subscriptions/reactivate", payload);
  return data;
};
