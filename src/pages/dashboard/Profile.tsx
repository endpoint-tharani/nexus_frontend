import { useMemo, useState } from "react";
import { Box, Tabs, Tab, Skeleton } from "@mui/material";

import { useMe } from "../../hooks/user";
import { ErrorState } from "../../components/common";
import { useAuthStore } from "../../store/auth.store";
import { getErrorMessage } from "../../utils/errorHandler";
import type { User } from "../../types";

import {
  ProfileHeader,
  AccountStatusCard,
  ProfileOverviewCard,
  PasswordCard,
  SessionsCard,
} from "../../components/profile";

export default function ProfilePage() {
  const { data: me, isLoading, isError, error, refetch } = useMe();
  const storeUser = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState(0);

  const user = useMemo<User | undefined>(() => {
    if (me) return me;
    if (storeUser?.id) {
      return {
        id: storeUser.id,
        name: storeUser.name ?? "",
        email: storeUser.email ?? "",
        isEmailVerified: storeUser.isEmailVerified ?? false,
        role: storeUser.role,
        company: storeUser.company,
      };
    }
    return undefined;
  }, [me, storeUser]);

  if (!user && isLoading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
        <Skeleton variant="rounded" height={220} sx={{ borderRadius: "16px" }} />
        <Skeleton variant="rounded" height={100} sx={{ borderRadius: "16px" }} />
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Skeleton variant="rectangular" width={240} height={40} />
        </Box>
        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: "16px" }} />
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: "16px" }} />
        </Box>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ maxWidth: 560, mx: "auto", mt: { xs: 2, md: 6 } }}>
        <ErrorState
          title="Couldn't load your profile"
          message={
            isError
              ? getErrorMessage(error)
              : "We couldn't find your account details. Please sign in again."
          }
          onRetry={() => refetch()}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
      {/* 1. Header Banner */}
      <ProfileHeader user={user} onTabChange={setActiveTab} />

      {/* 2. Account Status overview chips */}
      <AccountStatusCard user={user} />

      {/* 3. Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 1 }}>
        <Tabs
          value={activeTab}
          onChange={(_, idx) => setActiveTab(idx)}
          aria-label="profile information tabs"
          sx={{
            "& .MuiTabs-indicator": { bgcolor: "#2563EB" },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "15px",
              color: "#6B7280",
              "&.Mui-selected": { color: "#2563EB" },
            },
          }}
        >
          <Tab label="Profile Overview" />
          <Tab label="Security &amp; Sessions" />
        </Tabs>
      </Box>

      {/* 4. Tab Content */}
      <Box sx={{ minHeight: 400 }}>
        {activeTab === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <ProfileOverviewCard user={user} />
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {/* Active Sessions list */}
            <SessionsCard />

            <Box sx={{ maxWidth: 640 }}>
              <PasswordCard />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
