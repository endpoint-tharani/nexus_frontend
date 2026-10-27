import { Box } from "@mui/material";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineOutlined from "@mui/icons-material/ErrorOutlineOutlined";
import SecurityOutlined from "@mui/icons-material/SecurityOutlined";

import { SectionCard, StatusBadge } from "../ui";
import type { User } from "../../types";

interface AccountStatusCardProps {
  user: User;
}

export default function AccountStatusCard({ user }: AccountStatusCardProps) {
  return (
    <SectionCard title="Account Status" subtitle="Overview of security checkmarks and profile configurations.">
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          flexWrap: "wrap",
          alignItems: "center",
          mt: 0.5,
        }}
      >
        <StatusBadge
          icon={user.isEmailVerified ? <CheckCircleOutlined /> : <ErrorOutlineOutlined />}
          label={user.isEmailVerified ? "Email verified" : "Email unverified"}
          type={user.isEmailVerified ? "success" : "warning"}
          variant="filled"
        />

        <StatusBadge
          icon={<SecurityOutlined />}
          label="Status: Active"
          type="success"
          variant="outlined"
        />
      </Box>
    </SectionCard>
  );
}
