import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  IconButton,
  Typography,
  Alert,
  LinearProgress,
  Box,
} from "@mui/material";
import { MdClose, MdUploadFile } from "react-icons/md";
import dayjs from "dayjs";

import { previousEmploymentSchema, type PreviousEmploymentFormData } from "../../schemas";
import {
  useCreatePreviousEmployment,
  useUpdatePreviousEmployment,
  useUploadPreviousEmploymentFile,
  useCreatePreviousEmploymentAdmin,
  useUpdatePreviousEmploymentAdmin,
} from "../../hooks/tax/usePreviousEmployment";
import type { PreviousEmployment } from "../../types";

export interface PreviousEmploymentFormDialogProps {
  open: boolean;
  onClose: () => void;
  year: number;
  record?: PreviousEmployment | null;
  employeeId?: string;
}

export default function PreviousEmploymentFormDialog({
  open,
  onClose,
  year,
  record,
  employeeId,
}: PreviousEmploymentFormDialogProps) {
  const [formError, setFormError] = useState<string | null>(null);

  // File upload states
  const [form16File, setForm16File] = useState<string | null>(null);
  const [form16Name, setForm16Name] = useState<string | null>(null);
  const [form16Uploading, setForm16Uploading] = useState(false);

  const [salarySlipFile, setSalarySlipFile] = useState<string | null>(null);
  const [salarySlipName, setSalarySlipName] = useState<string | null>(null);
  const [salarySlipUploading, setSalarySlipUploading] = useState(false);

  const createMutation = useCreatePreviousEmployment();
  const updateMutation = useUpdatePreviousEmployment();
  const createMutationAdmin = useCreatePreviousEmploymentAdmin();
  const updateMutationAdmin = useUpdatePreviousEmploymentAdmin();
  const uploadFileMutation = useUploadPreviousEmploymentFile();

  const isEdit = !!record;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PreviousEmploymentFormData>({
    resolver: zodResolver(previousEmploymentSchema) as unknown as Resolver<PreviousEmploymentFormData>,
    defaultValues: {
      employerName: "",
      employerTan: "",
      employerPan: "",
      employmentFrom: "",
      employmentTo: "",
      grossSalary: 0,
      taxableSalary: 0,
      professionalTax: 0,
      tdsDeducted: 0,
      otherIncome: 0,
      remarks: "",
      form16Attachment: null,
      salarySlipAttachment: null,
    },
  });

  useEffect(() => {
    if (open) {
      if (record) {
        reset({
          employerName: record.employerName,
          employerTan: record.employerTan ?? "",
          employerPan: record.employerPan ?? "",
          employmentFrom: dayjs(record.employmentFrom).format("YYYY-MM-DD"),
          employmentTo: dayjs(record.employmentTo).format("YYYY-MM-DD"),
          grossSalary: Number(record.grossSalary),
          taxableSalary: Number(record.taxableSalary),
          professionalTax: Number(record.professionalTax),
          tdsDeducted: Number(record.tdsDeducted),
          otherIncome: Number(record.otherIncome),
          remarks: record.remarks ?? "",
          form16Attachment: record.form16Attachment ?? null,
          salarySlipAttachment: record.salarySlipAttachment ?? null,
        });
        setForm16File(record.form16Attachment ?? null);
        setForm16Name(record.form16Attachment ? record.form16Attachment.split("/").pop()! : null);
        setSalarySlipFile(record.salarySlipAttachment ?? null);
        setSalarySlipName(record.salarySlipAttachment ? record.salarySlipAttachment.split("/").pop()! : null);
      } else {
        reset({
          employerName: "",
          employerTan: "",
          employerPan: "",
          employmentFrom: "",
          employmentTo: "",
          grossSalary: 0,
          taxableSalary: 0,
          professionalTax: 0,
          tdsDeducted: 0,
          otherIncome: 0,
          remarks: "",
          form16Attachment: null,
          salarySlipAttachment: null,
        });
        setForm16File(null);
        setForm16Name(null);
        setSalarySlipFile(null);
        setSalarySlipName(null);
      }
      setFormError(null);
    }
  }, [open, record, reset]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "form16" | "salarySlip") => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (type === "form16") {
      setForm16Uploading(true);
      setForm16Name(file.name);
    } else {
      setSalarySlipUploading(true);
      setSalarySlipName(file.name);
    }

    try {
      const res = await uploadFileMutation.mutateAsync(file);
      const fileKey = res.sourceFileKey || res.fileKey || res.key;
      if (!fileKey) throw new Error("File key missing from upload response.");

      if (type === "form16") {
        setForm16File(fileKey);
      } else {
        setSalarySlipFile(fileKey);
      }
    } catch (err: any) {
      setFormError(`Failed to upload ${type === "form16" ? "Form 16" : "Salary Slip"}: ${err.message || err}`);
      if (type === "form16") {
        setForm16Name(null);
      } else {
        setSalarySlipName(null);
      }
    } finally {
      if (type === "form16") {
        setForm16Uploading(false);
      } else {
        setSalarySlipUploading(false);
      }
    }
  };

  const onSubmitForm = async (values: PreviousEmploymentFormData) => {
    setFormError(null);
    const payload = {
      ...values,
      financialYearStart: year,
      form16Attachment: form16File,
      salarySlipAttachment: salarySlipFile,
    };

    try {
      if (employeeId) {
        if (isEdit && record) {
          await updateMutationAdmin.mutateAsync({ id: record.id, employeeId, data: payload });
        } else {
          await createMutationAdmin.mutateAsync({
            employeeId,
            ...payload,
          });
        }
      } else {
        if (isEdit && record) {
          await updateMutation.mutateAsync({ id: record.id, data: payload });
        } else {
          await createMutation.mutateAsync(payload);
        }
      }
      onClose();
    } catch (err: any) {
      setFormError(err.message || "Failed to save previous employment record.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>
        {isEdit ? "Edit Previous Employer Details" : "Add Previous Employer Details"}
        <IconButton
          aria-label="close previous employment dialog"
          onClick={onClose}
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <MdClose size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <Controller
            name="employerName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Employer Name"
                size="small"
                fullWidth
                error={!!errors.employerName}
                helperText={errors.employerName?.message}
              />
            )}
          />

          <Stack direction="row" spacing={2}>
            <Controller
              name="employerTan"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Employer TAN (optional)"
                  placeholder="ABCD12345E"
                  size="small"
                  fullWidth
                  error={!!errors.employerTan}
                  helperText={errors.employerTan?.message}
                />
              )}
            />
            <Controller
              name="employerPan"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Employer PAN (optional)"
                  placeholder="ABCDE1234F"
                  size="small"
                  fullWidth
                  error={!!errors.employerPan}
                  helperText={errors.employerPan?.message}
                />
              )}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <Controller
              name="employmentFrom"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Employment From"
                  type="date"
                  size="small"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!errors.employmentFrom}
                  helperText={errors.employmentFrom?.message}
                />
              )}
            />
            <Controller
              name="employmentTo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Employment To"
                  type="date"
                  size="small"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!errors.employmentTo}
                  helperText={errors.employmentTo?.message}
                />
              )}
            />
          </Stack>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>
            Income & Deductions
          </Typography>

          <Stack direction="row" spacing={2}>
            <Controller
              name="grossSalary"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Gross Salary"
                  type="number"
                  size="small"
                  fullWidth
                  error={!!errors.grossSalary}
                  helperText={errors.grossSalary?.message}
                />
              )}
            />
            <Controller
              name="taxableSalary"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Taxable Salary u/s 17"
                  type="number"
                  size="small"
                  fullWidth
                  error={!!errors.taxableSalary}
                  helperText={errors.taxableSalary?.message}
                />
              )}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <Controller
              name="professionalTax"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Professional Tax"
                  type="number"
                  size="small"
                  fullWidth
                  error={!!errors.professionalTax}
                  helperText={errors.professionalTax?.message}
                />
              )}
            />
            <Controller
              name="tdsDeducted"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="TDS Deducted"
                  type="number"
                  size="small"
                  fullWidth
                  error={!!errors.tdsDeducted}
                  helperText={errors.tdsDeducted?.message}
                />
              )}
            />
          </Stack>

          <Controller
            name="otherIncome"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Other Income declared to Prev. Employer"
                type="number"
                size="small"
                fullWidth
                error={!!errors.otherIncome}
                helperText={errors.otherIncome?.message}
              />
            )}
          />

          <Controller
            name="remarks"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Remarks"
                multiline
                rows={2}
                size="small"
                fullWidth
                error={!!errors.remarks}
                helperText={errors.remarks?.message}
              />
            )}
          />

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>
            Attachments
          </Typography>

          <Stack spacing={1.5}>
            {/* Form 16 */}
            <Box>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Button
                  variant="outlined"
                  component="label"
                  size="small"
                  startIcon={<MdUploadFile />}
                  disabled={form16Uploading}
                >
                  Upload Form 16
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => handleFileUpload(e, "form16")}
                  />
                </Button>
                {form16Name && (
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                    {form16Name}
                  </Typography>
                )}
              </Stack>
              {form16Uploading && <LinearProgress sx={{ mt: 1 }} />}
            </Box>

            {/* Salary Slip */}
            <Box>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Button
                  variant="outlined"
                  component="label"
                  size="small"
                  startIcon={<MdUploadFile />}
                  disabled={salarySlipUploading}
                >
                  Upload Salary Slip
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => handleFileUpload(e, "salarySlip")}
                  />
                </Button>
                {salarySlipName && (
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                    {salarySlipName}
                  </Typography>
                )}
              </Stack>
              {salarySlipUploading && <LinearProgress sx={{ mt: 1 }} />}
            </Box>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting || form16Uploading || salarySlipUploading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmitForm)}
          variant="contained"
          disabled={isSubmitting || form16Uploading || salarySlipUploading}
        >
          {isEdit ? "Save Changes" : "Add Employer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
