import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { MdDelete, MdFileDownload, MdInsertDriveFile, MdRemoveRedEye } from "react-icons/md";
import type { StructuredDocument } from "../../types";
import { formatDate } from "../../utils/format";

export interface TaxProofCardProps {
  document: StructuredDocument;
  onView: (doc: StructuredDocument) => void;
  onDownload: (doc: StructuredDocument) => void;
  onDelete: (doc: StructuredDocument) => void;
  disabled?: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export default function TaxProofCard({
  document: doc,
  onView,
  onDownload,
  onDelete,
  disabled = false,
}: TaxProofCardProps) {
  const sizeText = (doc as any).fileSize ? formatFileSize((doc as any).fileSize) : "—";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 1.25,
        border: "1px solid #E5E7EB",
        borderRadius: "8px",
        bgcolor: "background.paper",
        transition: "box-shadow 0.15s ease",
        "&:hover": {
          boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, flex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "6px",
            bgcolor: doc.mimeType.includes("pdf") ? "rgba(239, 68, 68, 0.08)" : "rgba(37, 99, 235, 0.08)",
            color: doc.mimeType.includes("pdf") ? "error.main" : "primary.main",
            flexShrink: 0,
          }}
        >
          <MdInsertDriveFile size={20} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }} noWrap>
            {doc.fileName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            {sizeText !== "—" ? `${sizeText} • ` : ""}{formatDate(doc.createdAt, "DD MMM YYYY")}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: 1 }}>
        <Tooltip title="View">
          <IconButton size="small" onClick={() => onView(doc)} aria-label="View document">
            <MdRemoveRedEye size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download">
          <IconButton size="small" onClick={() => onDownload(doc)} aria-label="Download document">
            <MdFileDownload size={18} />
          </IconButton>
        </Tooltip>
        {!disabled && (
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(doc)}
              aria-label="Delete document"
            >
              <MdDelete size={18} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}
