import { Box, Button, Typography, Divider, CircularProgress } from "@mui/material";
import { MdArrowBack, MdFileDownload } from "react-icons/md";

export interface TaxDeclarationHeaderProps {
  onBack: () => void;
  exporting?: boolean;
  onExport: () => void;
}

export default function TaxDeclarationHeader({
  onBack,
  exporting = false,
  onExport,
}: TaxDeclarationHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        mt: 0,
        mb: 1,
      }}
    >
      <Button
        onClick={onBack}
        startIcon={<MdArrowBack />}
        size="small"
        sx={{
          textTransform: "none",
          color: "text.secondary",
          fontSize: "14px",
          fontWeight: 500,
          p: "4px 8px",
          minWidth: "auto",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        Back
      </Button>
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 16, alignSelf: "center" }} />
      <Typography
        variant="h6"
        sx={{
          fontSize: "22px",
          fontWeight: 700,
          color: "text.primary",
          lineHeight: 1.2,
          flex: 1,
        }}
      >
        Tax Declaration Details
      </Typography>

      <Button
        variant="outlined"
        size="small"
        startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <MdFileDownload size={18} />}
        onClick={onExport}
        disabled={exporting}
        sx={{ textTransform: "none" }}
      >
        Export
      </Button>
    </Box>
  );
}
