import api from "../../api/axios";
import type {
  ChangeModulesPayload,
  InvoiceListResponse,
  SubscriptionResponse,
  SubscriptionAccessResponse,
} from "../../types";

// =============================================================================
// SUBSCRIPTION API
//
// Contract the frontend is built against (Company Subscription / Module Access
// Control). The in-repo backend does not expose these yet — `useSubscription`
// tolerates a 404/route-miss and synthesizes a graceful fallback, so the app is
// fully functional today and lights up automatically once the backend ships.
// =============================================================================

// GET the active subscription (plan, enabled modules, feature flags) for a company.
export const getSubscription = (companyId: string) =>
  api.get<SubscriptionResponse>("/company/subscription", {
    params: { companyId },
  });

// GET billing history for a company.
export const getInvoices = (companyId: string) =>
  api.get<InvoiceListResponse>("/company/subscription/invoices", {
    params: { companyId },
  });

// Enable/disable modules on a subscription (upgrade / downgrade).
export const changeModules = (companyId: string, payload: ChangeModulesPayload) =>
  api.patch<SubscriptionResponse>("/company/subscription/modules", payload, {
    params: { companyId },
  });

// GET the backend-driven dynamic module access context.
export const getSubscriptionAccess = (companyId: string) =>
  api.get<{ success: boolean; data: SubscriptionAccessResponse }>("/subscription/access", {
    params: { companyId },
  });

// POST to enable a module.
export const enableModuleApi = (companyId: string, moduleCode: string) =>
  api.post("/subscription/modules/enable", { moduleCode }, {
    params: { companyId },
  });

// POST to disable a module.
export const disableModuleApi = (companyId: string, moduleCode: string) =>
  api.post("/subscription/modules/disable", { moduleCode }, {
    params: { companyId },
  });
