import { useState } from "react";
import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { MdClose, MdExpandLess, MdExpandMore, MdUpload } from "react-icons/md";

import { useCompanyId } from "../../hooks/shared/useCompanyId";
import { queryKeys } from "../../constants/queryKeys";
import { deleteTaxDocument, uploadTaxDocument } from "../../api/taxStructured.api";
import { deleteTaxDocumentAdmin, uploadTaxDocumentAdmin } from "../../api/tax.api";
import { getErrorMessage } from "../../utils/errorHandler";
import type { StructuredDocument, StructuredEntry, StructuredFormSection } from "../../types";

import ProofStatusBadge from "./ProofStatusBadge";
import TaxProofList from "./TaxProofList";
import TaxProofDropzone from "./TaxProofDropzone";
import ConfirmDialog from "../ui/ConfirmDialog";
import { useProofUploadWindow } from "../../hooks/taxConfig";

export interface TaxProofUploadProps {
  entry: StructuredEntry;
  section: StructuredFormSection;
  year: number;
  disabled?: boolean;
  declarationId?: string;
}

// S3 file link constructor
const getS3FileUrl = (s3Key: string): string => {
  return `https://auronox.s3.ap-south-1.amazonaws.com/${s3Key}`;
};

// Cross-origin download helper
const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Failed to download file:", error);
    window.open(url, "_blank");
  }
};

export default function TaxProofUpload({
  entry,
  section,
  year,
  disabled = false,
  declarationId,
}: TaxProofUploadProps) {
  const companyId = useCompanyId();
  const queryClient = useQueryClient();

  const { data: windowConfig } = useProofUploadWindow(year);
  const isWindowClosed = windowConfig ? !windowConfig.proofUploadOpen : false;
  const effectiveDisabled = disabled || (isWindowClosed && !declarationId);

  const [expanded, setExpanded] = useState(false);
  const [showDropzone, setShowDropzone] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, number>>({});
  const [deleteTarget, setDeleteTarget] = useState<StructuredDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview dialog states
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("");

  const documents = entry.documents ?? [];

  const handleFilesSelected = async (files: File[]) => {
    if (!companyId) return;

    // Validate files
    const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "webp", "gif", "heic", "heif"];
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const validFiles: File[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        toast.error(`"${file.name}" is not supported. Please upload PDF or image files.`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        toast.error(`"${file.name}" exceeds the 10 MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Start uploads
    const uploadPromises = validFiles.map((file) => {
      setUploadingFiles((prev) => ({ ...prev, [file.name]: 0 }));

      const uploadFn = declarationId
        ? (f: File, conf: any) => uploadTaxDocumentAdmin(companyId, declarationId, year, section.code, f, entry.id, conf)
        : (f: File, conf: any) => uploadTaxDocument(companyId, year, section.code, f, entry.id, conf);

      return uploadFn(file, {
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadingFiles((prev) => ({ ...prev, [file.name]: percentCompleted }));
          }
        },
      });
    });

    const results = await Promise.allSettled(uploadPromises);

    // Process errors/success
    let successCount = 0;
    validFiles.forEach((file, index) => {
      const result = results[index];
      if (result.status === "rejected") {
        const errMessage = getErrorMessage(result.reason);
        toast.error(`Upload failed for ${file.name}: ${errMessage}`);
      } else {
        successCount++;
      }
    });

    if (successCount > 0) {
      toast.success(`${successCount} document(s) uploaded`);
      // Invalidate query to refresh
      if (declarationId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.tax.declaration(companyId, declarationId),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: queryKeys.myTaxStructured.all(companyId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.myTax.all(companyId),
        });
      }
      setExpanded(true);
      setShowDropzone(false);
    }

    setUploadingFiles({});
  };

  const handleView = (doc: StructuredDocument) => {
    const url = doc.url || getS3FileUrl(doc.s3Key);
    const isImage =
      doc.mimeType.startsWith("image/") &&
      !doc.mimeType.includes("heic") &&
      !doc.mimeType.includes("heif");

    if (isImage) {
      setPreviewUrl(url);
      setPreviewName(doc.fileName);
    } else {
      window.open(url, "_blank");
    }
  };

  const handleDownload = (doc: StructuredDocument) => {
    const url = doc.url || getS3FileUrl(doc.s3Key);
    downloadFile(url, doc.fileName);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !companyId) return;
    setIsDeleting(true);

    try {
      if (declarationId) {
        await deleteTaxDocumentAdmin(companyId, declarationId, deleteTarget.id);
      } else {
        await deleteTaxDocument(companyId, deleteTarget.id);
      }
      toast.success("Document deleted");
      if (declarationId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.tax.declaration(companyId, declarationId),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: queryKeys.myTaxStructured.all(companyId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.myTax.all(companyId),
        });
      }
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const hasUploading = Object.keys(uploadingFiles).length > 0;

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          {!effectiveDisabled ? (
            <Button
              variant="outlined"
              size="small"
              startIcon={<MdUpload />}
              onClick={() => setShowDropzone((p) => !p)}
              disabled={hasUploading}
              sx={{
                borderRadius: "6px",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Upload Proof
            </Button>
          ) : null}
          <ProofStatusBadge count={documents.length} />
        </Stack>

        {documents.length > 0 ? (
          <Button
            size="small"
            color="inherit"
            endIcon={expanded ? <MdExpandLess /> : <MdExpandMore />}
            onClick={() => setExpanded((e) => !e)}
            sx={{ textTransform: "none", color: "text.secondary", fontWeight: 600 }}
          >
            {expanded ? "Hide Documents" : "Show Documents"}
          </Button>
        ) : null}
      </Stack>

      {isWindowClosed && (
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1, fontStyle: "italic" }}>
          Proof submission is currently closed by your organization. Please contact HR for assistance.
        </Typography>
      )}

      {/* Uploading progress section */}
      {hasUploading && (
        <Stack spacing={1} sx={{ mt: 2, p: 1.5, border: "1px solid #E5E7EB", borderRadius: "8px", bgcolor: "grey.50" }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
            Uploading
          </Typography>
          {Object.entries(uploadingFiles).map(([filename, progress]) => (
            <Box key={filename}>
              <Stack direction="row" sx={{ mb: 0.5, justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="caption" sx={{ fontWeight: 500, color: "text.primary", maxWidth: "80%" }} noWrap>
                  {filename}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "primary.main" }}>
                  {progress}%
                </Typography>
              </Stack>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
            </Box>
          ))}
        </Stack>
      )}

      {/* Dropzone container */}
      <Collapse in={showDropzone} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2 }}>
          <TaxProofDropzone onFilesSelected={handleFilesSelected} disabled={effectiveDisabled || hasUploading} />
        </Box>
      </Collapse>

      {/* Documents List */}
      <Collapse in={expanded && documents.length > 0} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", display: "block", mb: 1 }}>
            Documents
          </Typography>
          <TaxProofList
            documents={documents}
            onView={handleView}
            onDownload={handleDownload}
            onDelete={(doc) => setDeleteTarget(doc)}
            disabled={effectiveDisabled || hasUploading}
          />
        </Box>
      </Collapse>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete document"
        message={`Are you sure you want to permanently delete "${deleteTarget?.fileName}"?`}
        confirmLabel="Delete"
        severity="error"
        loading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Image Preview Dialog */}
      <Dialog open={!!previewUrl} onClose={() => setPreviewUrl(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
            {previewName}
          </Typography>
          <IconButton onClick={() => setPreviewUrl(null)} aria-label="close preview">
            <MdClose />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, textAlign: "center", bgcolor: "grey.100" }}>
          {previewUrl && (
            <Box
              component="img"
              src={previewUrl}
              alt={previewName}
              sx={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                display: "block",
                mx: "auto",
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
