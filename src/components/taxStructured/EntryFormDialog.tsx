import { useEffect, useMemo, useState } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { MdInsertDriveFile } from "react-icons/md";

import { FormDialog } from "../ui";
import DynamicField from "./DynamicField";
import type {
  EntryFieldValue,
  StructuredDocument,
  StructuredEntry,
  StructuredFormSection,
} from "../../types";

export interface EntryFormDialogProps {
  open: boolean;
  section: StructuredFormSection | null;
  entry?: StructuredEntry | null;
  loading?: boolean;
  onSubmit: (fieldValues: EntryFieldValue[], pendingFiles: Record<string, File>) => void;
  onClose: () => void;
}

export default function EntryFormDialog({
  open,
  section,
  entry,
  loading = false,
  onSubmit,
  onClose,
}: EntryFormDialogProps) {
  const fields = useMemo(
    () => (section ? [...section.fields].sort((a, b) => a.sortOrder - b.sortOrder) : []),
    [section]
  );

  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});

  useEffect(() => {
    if (open) {
      setValues(entry?.values ? { ...entry.values } : {});
      setErrors({});
      setPendingFiles({});
    }
  }, [open, entry]);

  const setField = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: "" } : prev));
  };

  const setFile = (fieldKey: string, file: File | null) => {
    setPendingFiles((prev) => {
      const next = { ...prev };
      if (file) {
        next[fieldKey] = file;
      } else {
        delete next[fieldKey];
      }
      return next;
    });
  };

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {};
    for (const f of fields) {
      if (f.fieldType === "FILE") continue; // documents uploaded separately
      const v = (values[f.fieldKey] ?? "").trim();
      if (f.isRequired && v === "") nextErrors[f.fieldKey] = "Required";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    const fieldValues: EntryFieldValue[] = fields
      .filter((f) => f.fieldType !== "FILE")
      .map((f) => ({ fieldKey: f.fieldKey, value: (values[f.fieldKey] ?? "").trim() }))
      .filter((fv) => fv.value !== "");
    onSubmit(fieldValues, pendingFiles);
  };

  const close = () => {
    if (loading) return;
    onClose();
  };

  // Existing documents already attached to this entry
  const existingDocs: StructuredDocument[] = entry?.documents ?? [];
  const fileFields = fields.filter((f) => f.fieldType === "FILE");
  const hasFileFields = fileFields.length > 0;

  return (
    <FormDialog
      open={open}
      title={
        section
          ? `${entry ? "Edit" : "Add"} ${section.shortName}`
          : "Add entry"
      }
      onClose={close}
      onSubmit={handleSubmit}
      submitLabel={entry ? "Save" : "Add"}
      loading={loading}
      maxWidth="sm"
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        {fields
          .filter((f) => f.fieldType !== "FILE")
          .map((f) => (
            <DynamicField
              key={f.fieldKey}
              field={f}
              value={values[f.fieldKey] ?? ""}
              onChange={(v) => setField(f.fieldKey, v)}
              disabled={loading}
              error={errors[f.fieldKey]}
            />
          ))}

        {hasFileFields && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              {fileFields[0].label}
              {fileFields[0].helpText && ` — ${fileFields[0].helpText}`}
            </Typography>

            {existingDocs.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", mb: 1 }}>
                {existingDocs.map((doc) => (
                  <Chip
                    key={doc.id}
                    size="small"
                    icon={<MdInsertDriveFile size={14} />}
                    label={doc.fileName}
                  />
                ))}
              </Stack>
            )}

            {fileFields.map((f) => (
              <DynamicField
                key={f.fieldKey}
                field={f}
                value={pendingFiles[f.fieldKey]?.name ?? ""}
                onChange={(v) => setField(f.fieldKey, v)}
                onFileChange={(file) => setFile(f.fieldKey, file)}
                disabled={loading}
              />
            ))}
          </Box>
        )}
      </Stack>
    </FormDialog>
  );
}
