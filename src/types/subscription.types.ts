// Domain + payload types for Company Subscription / Module Access Control.
//
// NOTE: the in-repo backend does not yet expose these endpoints. The frontend is
// built to the documented contract and degrades gracefully (see
// `core/subscription`) so it lights up the moment the backend ships them.

import type { ApiEnvelope, Money } from "./common.types";
import type { ModuleStatus, ProductModule } from "../constants/modules";

// One module entry on a company's subscription.
export interface CompanyModule {
  module: ProductModule;
  status: ModuleStatus;
  enabledAt?: string;
  expiresAt?: string;
  trialEndsAt?: string;
}

// The plan a company is on (Starter / Growth / Enterprise / custom).
export interface SubscriptionPlan {
  id: string;
  name: string;
  interval?: "MONTHLY" | "YEARLY";
  price?: Money;
}

export type SubscriptionStatus = "ACTIVE" | "TRIAL" | "EXPIRED" | "CANCELLED";

// The canonical subscription record. `enabledModules` is the authoritative list
// the whole UI adapts to; `modules` carries the richer per-module status used by
// the marketplace cards; `featureFlags` gates finer-grained behaviour.
export interface CompanySubscription {
  status: SubscriptionStatus;
  plan?: SubscriptionPlan;
  enabledModules: ProductModule[];
  modules: CompanyModule[];
  featureFlags: Record<string, boolean>;
  seats?: number;
  usedSeats?: number;
  renewsAt?: string;
  trialEndsAt?: string;
  // Set by the frontend when the record is a graceful fallback (no backend), so
  // the UI can show an honest "default access" hint instead of a real plan.
  isFallback?: boolean;
}

// A billing-history line item.
export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: Money;
  status: "PAID" | "DUE" | "FAILED" | "REFUNDED";
  description?: string;
  downloadUrl?: string;
}

// --- payloads ---
export interface ChangeModulesPayload {
  enable?: ProductModule[];
  disable?: ProductModule[];
}

// --- responses ---
export type SubscriptionResponse = ApiEnvelope<CompanySubscription>;
export type InvoiceListResponse = ApiEnvelope<Invoice[]>;

export interface SubscriptionAccessResponse {
  companyId: string;
  subscription: {
    id: string;
    planId: string;
    planCode: string;
    planName: string;
    startDate: string;
    endDate: string | null;
    isActive: boolean;
  } | null;
  enabledModules: ProductModule[];
  capabilities: Record<string, boolean>;
  navigation: {
    base: Array<{
      key: string;
      label: string;
      path: string;
      icon: string;
    }>;
    management: Array<{
      key: string;
      label: string;
      path: string;
      icon: string;
    }>;
    sections: Array<{
      module: string;
      label: string;
      icon: string;
      items: Array<{
        key: string;
        label: string;
        path: string;
        icon: string;
      }>;
    }>;
    workspace: Array<{
      key: string;
      label: string;
      path: string;
      icon: string;
    }>;
  };
}
