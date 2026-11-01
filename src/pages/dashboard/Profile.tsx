import { useMemo, useState } from "react";
import { Box, Paper, Tab, Tabs, Typography, Skeleton } from "@mui/material";

import { useMe } from "../../hooks/user";
import { ErrorState } from "../../components/common";
import { useAuthStore } from "../../store/auth.store";
import { getErrorMessage } from "../../utils/errorHandler";
import type { User } from "../../types";

import {
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
      <Box sx={{ maxWidth: 1120, mx: "auto", display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Skeleton variant="rounded" height={80} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rounded" height={58} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rounded" height={360} sx={{ borderRadius: 3 }} />
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
    <Box sx={{ maxWidth: 1120, mx: "auto", pb: 4 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography
          variant="overline"
          sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.12em" }}
        >
          YOUR ACCOUNT
        </Typography>
        <Typography
          component="h1"
          variant="h4"
          sx={{ mt: 0.25, fontWeight: 750, letterSpacing: "-0.035em" }}
        >
          My profile
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Update your personal details or manage your account security.
        </Typography>
      </Box>
      <Paper
        variant="outlined"
        sx={{
          maxWidth: 880,
          mb: 2.5,
          px: { xs: 1, sm: 1.5 },
          borderRadius: 3,
          bgcolor: "background.paper",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, idx) => setActiveTab(idx)}
          aria-label="Profile sections"
          variant="scrollable"
          allowScrollButtonsMobile
          sx={{
            minHeight: 56,
            "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0" },
            "& .MuiTab-root": {
              minHeight: 56,
              px: { xs: 1.5, sm: 2.5 },
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.925rem",
            },
          }}
        >
          <Tab label="Profile details" />
          <Tab label="Security" />
        </Tabs>
      </Paper>

      <Box>
        {activeTab === 0 && (
          <ProfileOverviewCard user={user} />
        )}

        {activeTab === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
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
