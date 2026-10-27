import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material";
import { MdDevices, MdLogout } from "react-icons/md";
import toast from "react-hot-toast";

import { useActiveSessions, useLogoutAllDevices } from "../../hooks/user";
import { RevokeSessionDialog, SessionsTable } from "../../components/profile";
import { ErrorState } from "../../components/common";
import { clearAppSession } from "../../utils/logout";
import { getErrorMessage } from "../../utils/errorHandler";
import type { Session } from "../../types";

export default function Sessions() {
  const {
    data: sessions,
    isLoading,
    isError,
    error,
    refetch,
  } = useActiveSessions();

  const logoutAllMutation = useLogoutAllDevices();

  const [revokeTarget, setRevokeTarget] = useState<Session | null>(null);
  const [logoutAllOpen, setLogoutAllOpen] = useState(false);

  const handleLogoutAll = () => {
    logoutAllMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Signed out of all devices");
        clearAppSession();
        window.location.href = "/login";
      },
      onError: (err) => {
        toast.error(getErrorMessage(err));
        setLogoutAllOpen(false);
      },
    });
  };

  const count = sessions?.length ?? 0;

  return (
    <Box sx={{ maxWidth: 960, mx: "auto" }}>
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        {!isLoading && !isError ? (
          <Chip
            label={`${count} active ${count === 1 ? "device" : "devices"}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        ) : (
          <Box />
        )}

        <Button
          color="error"
          variant="outlined"
          startIcon={<MdLogout />}
          onClick={() => setLogoutAllOpen(true)}
          disabled={isLoading || logoutAllMutation.isPending}
        >
          Sign out all devices
        </Button>
      </Box>

      {/* Body */}
      {isLoading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={64} />
          ))}
        </Box>
      ) : isError ? (
        <ErrorState
          title="Couldn't load sessions"
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
        />
      ) : count === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box aria-hidden sx={{ color: "text.disabled", display: "flex", justifyContent: "center", mb: 1 }}>
            <MdDevices size={36} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            No active sessions found.
          </Typography>
        </Paper>
      ) : (
        <SessionsTable
          sessions={sessions ?? []}
          onRevoke={(session) => setRevokeTarget(session)}
        />
      )}

      {/* Revoke single session */}
      <RevokeSessionDialog
        open={!!revokeTarget}
        session={revokeTarget}
        onClose={() => setRevokeTarget(null)}
      />

      {/* Logout all confirmation */}
      <Dialog
        open={logoutAllOpen}
        onClose={logoutAllMutation.isPending ? undefined : () => setLogoutAllOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Sign out everywhere</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This signs you out of every device, including this one. You'll need
            to sign in again to continue.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setLogoutAllOpen(false)}
            disabled={logoutAllMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleLogoutAll}
            disabled={logoutAllMutation.isPending}
            sx={{ minWidth: 140 }}
          >
            {logoutAllMutation.isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Sign out all"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
