import { Box, Card, Button } from "@mui/material";
import EditOutlined from "@mui/icons-material/EditOutlined";
import LockOpenOutlined from "@mui/icons-material/LockOpenOutlined";
import DevicesOutlined from "@mui/icons-material/DevicesOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";

import { AvatarCard, StatusBadge, InfoRow } from "../ui";
import { COMPANY_ROLE_LABELS } from "../../constants/enums";
import { formatDate } from "../../utils/format";
import type { User } from "../../types";

interface ProfileHeaderProps {
  user: User;
  onTabChange: (tabIndex: number) => void;
}

export default function ProfileHeader({ user, onTabChange }: ProfileHeaderProps) {
  const roleLabel = user.role ? COMPANY_ROLE_LABELS[user.role] : "Employee";
  const companyName = user.company?.name || "Auronox Workforce";

  return (
    <Card
      elevation={0}
      sx={{
        p: 4,
        border: "1px solid #E5E7EB",
        borderRadius: "16px",
        bgcolor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {/* Top Section: Profile info & Quick Actions */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 3,
        }}
      >
        <AvatarCard
          name={user.name || "Your Profile"}
          subtitle={user.email}
          size={72}
          badges={
            <>
              <StatusBadge
                label={roleLabel}
                type={user.role === "OWNER" ? "success" : user.role === "ADMIN" ? "info" : "default"}
                variant="filled"
              />
              <StatusBadge
                label={user.isEmailVerified ? "Verified Account" : "Unverified"}
                type={user.isEmailVerified ? "success" : "warning"}
              />
            </>
          }
          bgcolor="#2563EB"
        />

        {/* Quick Actions Panel */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditOutlined sx={{ fontSize: 16 }} />}
            onClick={() => onTabChange(0)}
            sx={{
              borderColor: "#E5E7EB",
              color: "#475569",
              "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" },
            }}
          >
            Edit Profile
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<LockOpenOutlined sx={{ fontSize: 16 }} />}
            onClick={() => onTabChange(1)}
            sx={{
              borderColor: "#E5E7EB",
              color: "#475569",
              "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" },
            }}
          >
            Change Password
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DevicesOutlined sx={{ fontSize: 16 }} />}
            onClick={() => onTabChange(1)}
            sx={{
              borderColor: "#E5E7EB",
              color: "#475569",
              "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" },
            }}
          >
            Manage Sessions
          </Button>
        </Box>
      </Box>

      {/* Bottom Section: Details Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2.5,
          pt: 3,
          borderTop: "1px solid #F1F5F9",
        }}
      >
        <InfoRow
          icon={<BusinessOutlined />}
          label="Company"
          value={companyName}
        />
        <InfoRow
          icon={<CalendarMonthOutlined />}
          label="Member since"
          value={formatDate(user.createdAt)}
        />
      </Box>
    </Card>
  );
}
