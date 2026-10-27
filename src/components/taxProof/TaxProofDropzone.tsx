import React, { useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { MdCloudUpload } from "react-icons/md";

export interface TaxProofDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export default function TaxProofDropzone({ onFilesSelected, disabled = false }: TaxProofDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  const onButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering double picker clicks
    fileInputRef.current?.click();
  };

  return (
    <Box
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={!disabled ? onButtonClick : undefined}
      sx={{
        border: "2px dashed",
        borderColor: isDragActive ? "primary.main" : "divider",
        borderRadius: "8px",
        bgcolor: isDragActive ? "rgba(37, 99, 235, 0.04)" : "grey.50",
        p: 3,
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: disabled ? "divider" : "primary.main",
          bgcolor: disabled ? "grey.50" : "rgba(37, 99, 235, 0.02)",
        },
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleChange}
        style={{ display: "none" }}
        disabled={disabled}
        accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.heic,.heif"
      />
      <MdCloudUpload size={32} style={{ color: "#9CA3AF", marginBottom: "8px" }} />
      <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500, mb: 0.5 }}>
        Drag &amp; drop files here, or click to upload
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Supported: PDF, JPG, JPEG, PNG, WEBP, GIF, HEIC, HEIF (Max 10MB)
      </Typography>
    </Box>
  );
}
