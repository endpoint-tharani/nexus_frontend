import { Box, Chip, Paper, Typography } from "@mui/material";

interface AccountDetailsCardProps {
  user: {
    name?: string;
    email?: string;
    isEmailVerified?: boolean;
  } | null;
}

export default function AccountDetailsCard({
  user,
}: AccountDetailsCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        background: "#ffffff",
        border: "1px solid rgba(148,163,184,0.25)",
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 600, mb: 2 }}
        color="text.primary"
      >
        Account details
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {[
          { label: "Name", value: user?.name },
          { label: "Email", value: user?.email },
          {
            label: "Email verified",
            value: user?.isEmailVerified ? (
              <Chip
                label="Verified"
                size="small"
                sx={{
                  background: "rgba(52,211,153,0.15)",
                  color: "#34d399",
                  fontSize: "0.75rem",
                }}
              />
            ) : (
              <Chip
                label="Pending"
                size="small"
                sx={{
                  background: "rgba(248,113,113,0.15)",
                  color: "#f87171",
                  fontSize: "0.75rem",
                }}
              />
            ),
          },
        ].map((row) => (
          <Box
            key={row.label}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1,
              borderBottom: "1px solid rgba(148,163,184,0.2)",
              "&:last-child": {
                borderBottom: "none",
              },
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {row.label}
            </Typography>

            <Typography
              variant="body2"
              color="text.primary"
              sx={{ fontWeight: 500 }}
            >
              {row.value ?? "—"}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}