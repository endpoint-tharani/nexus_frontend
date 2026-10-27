import { Chip } from "@mui/material";
import { MdCheckCircle, MdOutlineHelpOutline } from "react-icons/md";

export interface ProofStatusBadgeProps {
  count: number;
}

export default function ProofStatusBadge({ count }: ProofStatusBadgeProps) {
  const label = count === 0
    ? "No Proof"
    : count === 1
      ? "1 Proof Uploaded"
      : `${count} Proofs Uploaded`;

  return (
    <Chip
      label={label}
      color={count > 0 ? "success" : "default"}
      size="small"
      variant="outlined"
      icon={count > 0 ? <MdCheckCircle size={16} /> : <MdOutlineHelpOutline size={16} />}
      sx={{
        fontWeight: 600,
        height: 24,
        borderRadius: "6px",
        borderColor: count > 0 ? "success.light" : "divider",
        bgcolor: count > 0 ? "rgba(34, 197, 94, 0.05)" : "grey.50",
        color: count > 0 ? "success.dark" : "text.secondary",
        "& .MuiChip-icon": {
          color: count > 0 ? "success.main" : "text.secondary",
        }
      }}
    />
  );
}
