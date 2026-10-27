import type { ReactNode } from "react";
import { Avatar, Box, Typography } from "@mui/material";

export interface AvatarCardProps {
  name: string;
  subtitle?: ReactNode;
  size?: number;
  initials?: string;
  badges?: ReactNode;
  bgcolor?: string;
}

export default function AvatarCard({
  name,
  subtitle,
  size = 48,
  initials,
  badges,
  bgcolor = "#2563EB",
}: AvatarCardProps) {
  const resolvedInitials = initials || name.charAt(0).toUpperCase();

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Avatar
        sx={{
          width: size,
          height: size,
          fontSize: size * 0.4,
          fontWeight: 700,
          color: "#FFFFFF",
          bgcolor: bgcolor,
        }}
      >
        {resolvedInitials}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }} noWrap>
          {name}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }} noWrap>
            {subtitle}
          </Typography>
        )}
        {badges && (
          <Box sx={{ display: "flex", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
            {badges}
          </Box>
        )}
      </Box>
    </Box>
  );
}
