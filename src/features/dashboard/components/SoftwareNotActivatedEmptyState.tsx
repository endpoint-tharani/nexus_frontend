import { Box, Card, CardContent, Typography, Button } from "@mui/material";
import { MdEmail } from "react-icons/md";

export default function SoftwareNotActivatedEmptyState() {
  return (
    <Card
      elevation={0}
      sx={{
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(248, 250, 252, 0.95))",
        backdropFilter: "blur(16px)",
        border: "1px solid",
        borderColor: (theme) =>
          theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(139, 92, 246, 0.15)",
        borderRadius: "20px",
        p: { xs: 4, md: 6 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        maxWidth: 550,
        mx: "auto",
        my: 6,
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 12px 40px 0 rgba(0, 0, 0, 0.4)"
            : "0 12px 40px 0 rgba(139, 92, 246, 0.06)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #8B5CF6 0%, #EC4899 100%)",
        }
      }}
    >
      <CardContent sx={{ p: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: "20px",
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)",
            color: "primary.main",
            mb: 3.5,
            border: "1px solid rgba(139, 92, 246, 0.25)",
            boxShadow: "0 8px 24px -8px rgba(139, 92, 246, 0.3)",
          }}
        >
          <MdEmail size={36} style={{ color: "#8B5CF6" }} />
        </Box>

        <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mb: 2, color: "text.primary", letterSpacing: "-0.5px" }}>
          Contact Auronox
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 440, mb: 4.5, lineHeight: 1.65, fontSize: "1.05rem" }}
        >
          Your organization does not currently have an active subscription.
          Please contact our support team via email to activate your workspace.
        </Typography>

        <Button
          variant="contained"
          size="large"
          component="a"
          href="mailto:support@auronox.com?subject=Activate%20Workspace"
          startIcon={<MdEmail size={22} />}
          sx={{
            background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
            color: "#fff",
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1rem",
            px: 4.5,
            py: 1.5,
            boxShadow: "0 6px 20px 0 rgba(139, 92, 246, 0.35)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
              boxShadow: "0 8px 25px 0 rgba(139, 92, 246, 0.45)",
              transform: "translateY(-2px)",
            },
            "&:active": {
              transform: "translateY(0)",
            }
          }}
        >
          Contact Auronox via Email
        </Button>
      </CardContent>
    </Card>
  );
}
