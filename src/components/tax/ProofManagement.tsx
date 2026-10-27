import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { MdAdd, MdDeleteOutline, MdEdit, MdVisibility, MdFileDownload } from "react-icons/md";
import toast from "react-hot-toast";

import { useRemoveProof, useUpsertProof } from "../../hooks/tax";
import { TAX_SECTION_LABELS, TAX_SECTION_OPTIONS } from "../../constants/enums";
import { proofSchema } from "../../schemas/tax.schema";
import type { ProofFormData } from "../../schemas/tax.schema";
import type { ProofPayload, TaxProofItem } from "../../types";
import { formatCurrency, toNumber } from "../../utils/format";
import { getErrorMessage } from "../../utils/errorHandler";
import { API_BASE_URL } from "../../api/axios";

export interface ProofManagementProps {
  declarationId: string;
  items: TaxProofItem[];
  prefillData?: ProofFormData | null;
  onClearPrefill?: () => void;
}

// Item -> form values. A blank "add" form keeps amount at 0 (rendered as an
// empty field via the Controller below) and defaults to the first section.
const toFormValues = (item: TaxProofItem | null): ProofFormData => ({
  section: item?.section ?? "SECTION_80C",
  amount: toNumber(item?.amount) ?? 0,
  description: item?.description ?? "",
  referenceNo: item?.referenceNo ?? "",
  proofDocKey: item?.proofDocKey ?? "",
});

const COLUMN_COUNT = 6;

// Proof-item manager for a single declaration. Owns the upsert + remove
// mutations and an inline add/edit dialog (RHF + Zod). `data.itemId` present
// drives an update; absent drives an add — the same hook serves both.
export default function ProofManagement({
  declarationId,
  items,
  prefillData,
  onClearPrefill,
}: ProofManagementProps) {
  const upsertMutation = useUpsertProof();
  const removeMutation = useRemoveProof();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<TaxProofItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaxProofItem | null>(null);

  const { isPending } = upsertMutation;

  // Stable defaults so the reset effect only re-runs when the edited item or the
  // editor's open state actually changes.
  const initialValues = useMemo(() => toFormValues(editing), [editing]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProofFormData>({
    // Zod 4's `z.coerce` (on `amount`) makes the schema input type `unknown`, so
    // zodResolver returns a 3-generic Resolver that RHF's single-generic useForm
    // rejects. Coercion still runs; only the static type is realigned.
    resolver: zodResolver(proofSchema) as unknown as Resolver<ProofFormData>,
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (editorOpen) reset(initialValues);
  }, [editorOpen, initialValues, reset]);

  useEffect(() => {
    if (prefillData) {
      setEditing(null);
      setEditorOpen(true);
      reset(prefillData);
      if (onClearPrefill) {
        onClearPrefill();
      }
    }
  }, [prefillData, reset, onClearPrefill]);

  const openAdd = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (item: TaxProofItem) => {
    setEditing(item);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    if (isPending) return;
    setEditorOpen(false);
    setEditing(null);
  };

  const onSubmit = (values: ProofFormData) => {
    const data: ProofPayload = {
      ...(editing ? { itemId: editing.id } : {}),
      section: values.section,
      amount: values.amount,
      description: values.description?.trim()
        ? values.description.trim()
        : undefined,
      referenceNo: values.referenceNo?.trim()
        ? values.referenceNo.trim()
        : undefined,
      proofDocKey: values.proofDocKey?.trim()
        ? values.proofDocKey.trim()
        : undefined,
    };

    upsertMutation.mutate(
      { declarationId, data },
      {
        onSuccess: () => {
          toast.success(editing ? "Proof updated" : "Proof added");
          setEditorOpen(false);
          setEditing(null);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    removeMutation.mutate(
      { declarationId, itemId: deleteTarget.id, removeItem: true },
      {
        onSuccess: () => {
          toast.success("Proof removed");
          setDeleteTarget(null);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography color="text.primary" sx={{ fontWeight: 700 }}>
          Declaration Items
        </Typography>
        <Button
          size="small"
          startIcon={<MdAdd size={18} />}
          onClick={openAdd}
          sx={{ textTransform: "none" }}
        >
          Add proof
        </Button>
      </Box>

      <TableContainer
        component={Box}
        sx={{
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          overflowX: "auto",
        }}
      >
        <Table size="small" sx={{ minWidth: 720 }}>
          <TableHead sx={{ bgcolor: (theme) => theme.palette.mode === "light" ? "grey.50" : "background.default" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Section</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Amount
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Reference</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>
                Proof
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={COLUMN_COUNT}
                  sx={{ py: 5, textAlign: "center" }}
                >
                  <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
                    No proof items yet
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Add a deduction proof to support this declaration.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>
                    {TAX_SECTION_LABELS[item.section] ?? item.section}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(item.amount)}
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {item.description ?? "—"}
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {item.referenceNo ?? "—"}
                  </TableCell>
                  <TableCell align="center">
                    {item.proofDocKey ? (
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                        <Tooltip title="View File">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              const url = `${API_BASE_URL}/me/tax/document/view?key=${encodeURIComponent(item.proofDocKey!)}`;
                              window.open(url, "_blank", "noopener,noreferrer");
                            }}
                          >
                            <MdVisibility size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download File">
                          <IconButton
                            size="small"
                            color="inherit"
                            onClick={async () => {
                              const url = `${API_BASE_URL}/me/tax/document/view?key=${encodeURIComponent(item.proofDocKey!)}`;
                              try {
                                const res = await fetch(url);
                                const blob = await res.blob();
                                const blobUrl = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.href = blobUrl;
                                const filename = item.proofDocKey!.split("/").pop() || "proof-document";
                                link.download = filename;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                URL.revokeObjectURL(blobUrl);
                              } catch (error) {
                                console.error("Failed to download file:", error);
                                toast.error("Failed to download file");
                              }
                            }}
                          >
                            <MdFileDownload size={18} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 0.5,
                      }}
                    >
                      <Tooltip title="Edit proof">
                        <IconButton
                          size="small"
                          color="secondary"
                          aria-label="Edit proof item"
                          onClick={() => openEdit(item)}
                        >
                          <MdEdit size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete proof">
                        <IconButton
                          size="small"
                          aria-label="Delete proof item"
                          onClick={() => setDeleteTarget(item)}
                          sx={{ color: "error.main" }}
                        >
                          <MdDeleteOutline size={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / edit proof */}
      <Dialog
        open={editorOpen}
        onClose={closeEditor}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editing ? "Edit proof" : "Add proof"}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                mt: 0.5,
              }}
            >
              <Controller
                name="section"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Section"
                    fullWidth
                    disabled={isPending}
                    {...field}
                    error={!!errors.section}
                    helperText={errors.section?.message ?? " "}
                  >
                    {TAX_SECTION_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Amount"
                    type="number"
                    fullWidth
                    disabled={isPending}
                    value={field.value ? field.value : ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : Number(e.target.value)
                      )
                    }
                    onBlur={field.onBlur}
                    error={!!errors.amount}
                    helperText={errors.amount?.message ?? " "}
                  />
                )}
              />

              <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
                <TextField
                  label="Description"
                  fullWidth
                  disabled={isPending}
                  {...register("description")}
                  error={!!errors.description}
                  helperText={errors.description?.message ?? " "}
                />
              </Box>

              <TextField
                label="Reference No."
                fullWidth
                disabled={isPending}
                {...register("referenceNo")}
                error={!!errors.referenceNo}
                helperText={errors.referenceNo?.message ?? " "}
              />

              <TextField
                label="Proof Document Key"
                fullWidth
                disabled={isPending}
                {...register("proofDocKey")}
                error={!!errors.proofDocKey}
                helperText={
                  errors.proofDocKey?.message ?? "S3 object key (optional)"
                }
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              variant="outlined"
              onClick={closeEditor}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isPending}
              sx={{ minWidth: 130 }}
            >
              {isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : editing ? (
                "Save Proof"
              ) : (
                "Add Proof"
              )}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete proof confirmation */}
      <Dialog
        open={!!deleteTarget}
        onClose={
          removeMutation.isPending ? undefined : () => setDeleteTarget(null)
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Remove proof item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Remove the{" "}
            <strong>
              {deleteTarget
                ? TAX_SECTION_LABELS[deleteTarget.section] ??
                  deleteTarget.section
                : "selected"}
            </strong>{" "}
            proof item? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteTarget(null)}
            disabled={removeMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={removeMutation.isPending}
            sx={{ minWidth: 120 }}
          >
            {removeMutation.isPending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Remove"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
