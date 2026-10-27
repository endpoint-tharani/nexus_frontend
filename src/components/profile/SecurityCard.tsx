import { Box, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import ShieldOutlined from "@mui/icons-material/ShieldOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";

import { SectionCard, StatusBadge } from "../ui";

export default function SecurityCard() {
  const loginLogs = [
    { time: "Today, 10:42 AM", action: "Signed in via password", location: "New York, US (192.168.1.42)" },
    { time: "Yesterday, 2:15 PM", action: "Token refreshed", location: "New York, US (192.168.1.42)" },
    { time: "Jun 28, 2026, 9:02 AM", action: "Signed in via OTP code", location: "New York, US (192.168.1.42)" },
  ];

  const checklist = [
    { label: "High-strength password set", done: true },
    { label: "Work email address verified", done: true },
    { label: "MFA Authentication App linked", done: true },
    { label: "Contact phone number verified", done: true },
  ];

  return (
    <Grid container spacing={3}>
      {/* 1. Two-factor Authentication */}
      <Grid size={{ xs: 12, md: 6 }}>
        <SectionCard
          title="Two-factor Authentication (2FA)"
          subtitle="Add an extra layer of security to your account by requiring a verification code."
          sx={{ height: "100%" }}
        >
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mt: 1 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "8px",
                bgcolor: "rgba(22, 163, 74, 0.08)",
                color: "#16A34A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ShieldOutlined sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827", mb: 0.5 }}>
                Authenticator App (TOTP)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                Use apps like Google Authenticator or Microsoft Authenticator to generate verification codes.
              </Typography>
              <StatusBadge label="Configured &amp; Active" type="success" variant="filled" />
            </Box>
          </Box>
        </SectionCard>
      </Grid>

      {/* 2. Security Status / Health */}
      <Grid size={{ xs: 12, md: 6 }}>
        <SectionCard
          title="Security Checklist"
          subtitle="Current status of your account security configuration parameters."
          sx={{ height: "100%" }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75, mt: 1 }}>
            {checklist.map((item, idx) => (
              <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <CheckCircleOutlined sx={{ fontSize: 18, color: "#16A34A" }} />
                <Typography variant="body2" sx={{ fontWeight: 500, color: "#475569", fontSize: "14px" }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </SectionCard>
      </Grid>

      {/* 3. Login History Log */}
      <Grid size={{ xs: 12 }}>
        <SectionCard
          title="Login Activity Log"
          subtitle="Audit log of recent authentication actions on this profile."
        >
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              border: "none",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <Table size="small">
              <TableHead sx={{ bgcolor: (theme) => theme.palette.mode === "light" ? "grey.50" : "background.default" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: "text.secondary", py: 1.5 }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.secondary", py: 1.5 }}>Action Type</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.secondary", py: 1.5 }}>Location &amp; IP</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loginLogs.map((log, idx) => (
                  <TableRow key={idx} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell sx={{ py: 1.5, fontWeight: 500, color: "text.primary" }}>{log.time}</TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" sx={{ fontSize: "13px", color: "text.secondary" }}>
                        {log.action}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, color: "text.secondary", fontSize: "13px" }}>{log.location}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </SectionCard>
      </Grid>
    </Grid>
  );
}
