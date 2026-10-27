import { Box, Button, Card, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import { MdLockOutline, MdArrowForward, MdUpgrade } from "react-icons/md";
import { MODULE_META } from "../../constants/modules";
import type { ProductModule } from "../../constants/modules";
import { useSubscriptionAccess } from "../../core/subscription";
import { useAuthStore } from "../../store/auth.store";

export interface AccessDeniedProps {
  /** The module the caller tried to reach (for a tailored message + upgrade CTA). */
  module?: ProductModule;
  title?: string;
  description?: string;
}

// 403 surface shown when a route's module isn't on the company's plan. Direct-URL
// access is the only way to land here (the sidebar already hides disabled modules),
// so we lead with an upgrade path rather than a dead end.
export default function AccessDenied({
  module,
  title,
  description,
}: AccessDeniedProps) {
  const { subscription } = useSubscriptionAccess();
  const user = useAuthStore((s) => s.user);
  const isExpired =
    subscription !== null &&
    subscription.isActive === false &&
    subscription.endDate !== null &&
    new Date(subscription.endDate) < new Date();
  const canRenew = user?.role === "OWNER" || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const meta = module ? MODULE_META[module] : undefined;
  const heading = isExpired ? "Subscription Expired" : (title ?? "403 — Module not in your plan");
  const body = isExpired
    ? "Your subscription has expired."
    : (description ??
      (meta
        ? `The ${meta.label} module isn't enabled for your company. Enable it from your subscription to unlock this area.`
        : "You don't have access to this area. It may require a module that isn't on your current plan."));

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100dvh - 160px)",
      }}
    >
      <Card sx={{ p: { xs: 3, md: 5 }, maxWidth: 460, textAlign: "center" }}>
        <Box
          aria-hidden
          sx={{
            width: 72,
            height: 72,
            borderRadius: 3,
            mx: "auto",
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "warning.main",
            bgcolor: (theme) => alpha(theme.palette.warning.main, 0.12),
          }}
        >
          <MdLockOutline size={34} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {heading}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, mb: 3 }}
        >
          {body}
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {isExpired && canRenew ? (
            <Button
              component={RouterLink}
              to={user?.role === "SUPER_ADMIN" ? "/dashboard/admin/subscriptions" : "/dashboard/subscription"}
              variant="contained"
              startIcon={<MdUpgrade size={18} />}
            >
              Renew Subscription
            </Button>
          ) : (
            <Button
              component={RouterLink}
              to="/dashboard/subscription"
              variant="contained"
              startIcon={<MdUpgrade size={18} />}
            >
              View plans
            </Button>
          )}
          <Button
            component={RouterLink}
            to="/dashboard"
            variant="outlined"
            endIcon={<MdArrowForward size={16} />}
          >
            Dashboard
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
