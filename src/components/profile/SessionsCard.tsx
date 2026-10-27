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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  Typography,
  Skeleton,
} from "@mui/material";
import DevicesOutlined from "@mui/icons-material/DevicesOutlined";
import PhoneIphoneOutlined from "@mui/icons-material/PhoneIphoneOutlined";
import ComputerOutlined from "@mui/icons-material/ComputerOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import toast from "react-hot-toast";

import { SectionCard } from "../ui";
import { useActiveSessions, useLogoutAllDevices } from "../../hooks/user";
import { RevokeSessionDialog } from "../profile";
import { clearAppSession } from "../../utils/logout";
import { getErrorMessage } from "../../utils/errorHandler";
import { formatDateTime } from "../../utils/format";
import type { Session } from "../../types";

function describeAgent(userAgent?: string): {
  browser: string;
  device: string;
  isMobile: boolean;
} {
  const ua = userAgent ?? "";
  const isMobile = /mobile|android|iphone|ipad/i.test(ua);
  let browser = "Unknown Browser";
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";
  return { browser, device: isMobile ? "Mobile" : "Desktop", isMobile };
}

interface SessionsCardProps {
  showActions?: boolean;
}

export default function SessionsCard({ showActions = true }: SessionsCardProps) {
  const {
    data: sessions = [],
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

  const count = sessions.length;

  return (
    <SectionCard
      title="Active Sessions"
      subtitle="Verify where you are currently signed in. You can revoke any session except your current one."
      actions={
        showActions && count > 0 && (
          <Button
            color="error"
            variant="outlined"
            size="small"
            startIcon={<LogoutOutlined sx={{ fontSize: 16 }} />}
            onClick={() => setLogoutAllOpen(true)}
            disabled={isLoading || logoutAllMutation.isPending}
            sx={{
              height: "36px",
              borderRadius: "8px",
              borderColor: "#E5E7EB",
              color: "#DC2626",
              textTransform: "none",
              "&:hover": { borderColor: "#F87171", bgcolor: "#FEF2F2" },
            }}
          >
            Sign out all devices
          </Button>
        )
      }
    >
      {isLoading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={60} sx={{ borderRadius: "8px" }} />
          ))}
        </Box>
      ) : isError ? (
        <Box sx={{ py: 3, textAlign: "center" }}>
          <Typography color="error" sx={{ fontWeight: 600, mb: 2 }}>
            {getErrorMessage(error)}
          </Typography>
          <Button variant="outlined" size="small" onClick={() => refetch()}>
            Retry
          </Button>
        </Box>
      ) : count === 0 ? (
        <Paper
          elevation={0}
          sx={{
            py: 6,
            textAlign: "center",
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            bgcolor: "#F8FAFC",
          }}
        >
          <DevicesOutlined sx={{ fontSize: 36, color: "#94A3B8", mb: 1 }} />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            No active sessions found.
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: "none",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <Table aria-label="Active sessions">
            <TableHead sx={{ bgcolor: (theme) => theme.palette.mode === "light" ? "grey.50" : "background.default" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary", py: 1.5 }}>Device</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary", py: 1.5 }}>IP Address</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary", py: 1.5 }}>Last Active</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: "text.secondary", py: 1.5 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((session) => {
                const { browser, device, isMobile } = describeAgent(session.userAgent);
                return (
                  <TableRow key={session.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "rgba(37, 99, 235, 0.08)",
                            color: "primary.main",
                          }}
                        >
                          {isMobile ? (
                            <PhoneIphoneOutlined sx={{ fontSize: 18 }} />
                          ) : (
                            <ComputerOutlined sx={{ fontSize: 18 }} />
                          )}
                        </Box>
                        <Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                              {browser} · {device}
                            </Typography>
                            {session.current && (
                              <Chip
                                label="Current Device"
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: "10px",
                                  fontWeight: 600,
                                  bgcolor: "rgba(37, 99, 235, 0.1)",
                                  color: "#2563EB",
                                  border: "none",
                                }}
                              />
                            )}
                          </Box>
                          {(session.device ?? session.userAgent) && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                              sx={{ display: "block", maxWidth: 280, mt: 0.25 }}
                            >
                              {session.device ?? session.userAgent}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>{session.ipAddress ?? "—"}</TableCell>
                    <TableCell sx={{ py: 2 }}>
                      {formatDateTime(session.lastActiveAt ?? session.createdAt)}
                    </TableCell>
                    <TableCell align="right" sx={{ py: 2 }}>
                      {session.current ? (
                        <Typography variant="caption" sx={{ color: "#16A34A", fontWeight: 600 }}>
                          Active Now
                        </Typography>
                      ) : (
                        <Tooltip title="Revoke Session">
                          <IconButton
                            aria-label={`Revoke ${browser} ${device} session`}
                            color="error"
                            size="small"
                            onClick={() => setRevokeTarget(session)}
                            sx={{
                              color: "#DC2626",
                              "&:hover": { bgcolor: "rgba(220, 38, 38, 0.08)" },
                            }}
                          >
                            <LogoutOutlined sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Revoke single session dialog */}
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
        slotProps={{
          paper: { sx: { borderRadius: "12px" } },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "18px" }}>Sign out everywhere</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "14px", color: "#475569" }}>
            This signs you out of every active session, including this one. You'll need to sign in again to continue.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setLogoutAllOpen(false)}
            disabled={logoutAllMutation.isPending}
            sx={{
              borderColor: "#E5E7EB",
              color: "#475569",
              borderRadius: "8px",
              height: "36px",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleLogoutAll}
            disabled={logoutAllMutation.isPending}
            sx={{
              bgcolor: "#DC2626",
              borderRadius: "8px",
              height: "36px",
              textTransform: "none",
              minWidth: 100,
              boxShadow: "none",
              "&:hover": { bgcolor: "#B91C1C", boxShadow: "none" },
            }}
          >
            {logoutAllMutation.isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Sign out all"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </SectionCard>
  );
}
