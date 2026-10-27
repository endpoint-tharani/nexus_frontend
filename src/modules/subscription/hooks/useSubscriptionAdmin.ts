import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { queryKeys } from "../../../constants/queryKeys";
import {
  activateSubscription,
  cancelSubscription,
  changePlanSubscription,
  getCompanySubscription,
  getPendingCompanies,
  getPlans,
  getSubscriptions,
  reactivateSubscription,
  renewSubscription,
  suspendSubscription,
} from "../api/subscriptionAdmin.api";
import type {
  ActivateSubscriptionPayload,
  CancelSubscriptionPayload,
  ChangePlanSubscriptionPayload,
  ListSubscriptionsParams,
  ReactivateSubscriptionPayload,
  RenewSubscriptionPayload,
  SuspendSubscriptionPayload,
} from "../types";

export const adminQueryKeys = {
  pending: ["subscriptionAdmin", "pending"] as const,
  subscriptions: ["subscriptionAdmin", "subscriptions"] as const,
  companyDetail: (companyId: string) => ["subscriptionAdmin", "companyDetail", companyId] as const,
  plans: ["subscriptionAdmin", "plans"] as const,
};

/**
 * Hook to retrieve all companies that do not have an active subscription.
 */
export const usePendingCompanies = () => {
  return useQuery({
    queryKey: adminQueryKeys.pending,
    queryFn: getPendingCompanies,
    staleTime: 30_000,
  });
};

/**
 * Hook to retrieve all companies with their subscriptions.
 */
export const useSubscriptions = (params: ListSubscriptionsParams) => {
  return useQuery({
    queryKey: [...adminQueryKeys.subscriptions, params],
    queryFn: () => getSubscriptions(params),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook to retrieve detailed subscription, modules, capabilities, and audit log
 * data for a specific company.
 */
export const useCompanySubscription = (companyId: string) => {
  return useQuery({
    queryKey: adminQueryKeys.companyDetail(companyId),
    queryFn: () => getCompanySubscription(companyId),
    enabled: !!companyId,
    staleTime: 30_000,
  });
};

/**
 * Hook to retrieve the subscription plans catalog.
 */
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: adminQueryKeys.plans,
    queryFn: getPlans,
    staleTime: 30_000,
  });
};

/**
 * Mutation to activate a subscription for a company.
 */
export const useActivateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ActivateSubscriptionPayload) => activateSubscription(payload),
    onSuccess: (_, variables) => {
      const { companyId } = variables;
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.pending });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.subscriptions });
      // Invalidate detail queries
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.companyDetail(companyId) });
      // Invalidate company-scoped subscription and access hooks
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all(companyId) });
    },
  });
};

/**
 * Mutation to extend or reactivate a subscription for a company.
 */
export const useRenewSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RenewSubscriptionPayload) => renewSubscription(payload),
    onSuccess: (_, variables) => {
      const { companyId } = variables;
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.pending });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.subscriptions });
      // Invalidate detail queries
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.companyDetail(companyId) });
      // Invalidate company-scoped subscription and access hooks
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all(companyId) });
    },
  });
};

/**
 * Mutation to cancel an active subscription for a company.
 */
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CancelSubscriptionPayload) => cancelSubscription(payload),
    onSuccess: (_, variables) => {
      const { companyId } = variables;
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.pending });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.subscriptions });
      // Invalidate detail queries
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.companyDetail(companyId) });
      // Invalidate company-scoped subscription and access hooks
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all(companyId) });
    },
  });
};

/**
 * Mutation to change plan of a subscription for a company.
 */
export const useChangePlanSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChangePlanSubscriptionPayload) => changePlanSubscription(payload),
    onSuccess: (_, variables) => {
      const { companyId } = variables;
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.pending });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.subscriptions });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.companyDetail(companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all(companyId) });
    },
  });
};

/**
 * Mutation to suspend an active subscription for a company.
 */
export const useSuspendSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SuspendSubscriptionPayload) => suspendSubscription(payload),
    onSuccess: (_, variables) => {
      const { companyId } = variables;
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.pending });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.subscriptions });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.companyDetail(companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all(companyId) });
    },
  });
};

/**
 * Mutation to reactivate a suspended subscription for a company.
 */
export const useReactivateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReactivateSubscriptionPayload) => reactivateSubscription(payload),
    onSuccess: (_, variables) => {
      const { companyId } = variables;
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.pending });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.subscriptions });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.companyDetail(companyId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription.all(companyId) });
    },
  });
};
