import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { MdComputer, MdLogout, MdPhoneAndroid } from "react-icons/md";

import type { Session } from "../../types";
import { formatDateTime } from "../../utils/format";

export interface SessionsTableProps {
  sessions: Session[];
  onRevoke: (session: Session) => void;
  revoking?: boolean;
}

// Best-effort browser + device parse from the user-agent string.
function describeAgent(userAgent?: string): {
  browser: string;
  device: string;
  isMobile: boolean;
} {
  const ua = userAgent ?? "";
  const isMobile = /mobile|android|iphone|ipad/i.test(ua);
  let browser = "Unknown browser";
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";
  return { browser, device: isMobile ? "Mobile" : "Desktop", isMobile };
}

// Presentational table of active sessions. The page owns the revoke flow and
// passes `onRevoke`; the current session is badged and can't be revoked here.
export default function SessionsTable({
  sessions,
  onRevoke,
  revoking = false,
}: SessionsTableProps) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}
    >
      <Table aria-label="Active sessions">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Device</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>IP address</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Last active</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sessions.map((session) => {
            const { browser, device, isMobile } = describeAgent(
              session.userAgent
            );
            return (
              <TableRow key={session.id} hover>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      aria-hidden
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "rgba(124,58,237,0.12)",
                        color: "primary.main",
                      }}
                    >
                      {isMobile ? (
                        <MdPhoneAndroid size={18} />
                      ) : (
                        <MdComputer size={18} />
                      )}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {browser} · {device}
                        </Typography>
                        {session.current && (
                          <Chip
                            label="This device"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      {(session.device ?? session.userAgent) && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          sx={{ display: "block", maxWidth: 280 }}
                        >
                          {session.device ?? session.userAgent}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{session.ipAddress ?? "—"}</TableCell>
                <TableCell>
                  {formatDateTime(session.lastActiveAt ?? session.createdAt)}
                </TableCell>
                <TableCell align="right">
                  {session.current ? (
                    <Chip label="Current" size="small" />
                  ) : (
                    <Tooltip title="Revoke session">
                      <span>
                        <IconButton
                          aria-label={`Revoke ${browser} ${device} session`}
                          color="error"
                          size="small"
                          disabled={revoking}
                          onClick={() => onRevoke(session)}
                        >
                          <MdLogout size={18} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
