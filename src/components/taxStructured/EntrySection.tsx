import { useMemo, useState } from "react";
import { Box, Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";
import toast from "react-hot-toast";

import { ConfirmDialog, MoneyText, SectionCard } from "../ui";
import EntryFormDialog from "./EntryFormDialog";
import {
  useDeleteTaxEntry,
  useUpsertTaxEntry,
} from "../../hooks/taxStructured";
import { uploadTaxDocument } from "../../api/taxStructured.api";
import { uploadTaxDocumentAdmin } from "../../api/tax.api";
import { requireCompanyId, useCompanyId } from "../../hooks/shared/useCompanyId";
import { getErrorMessage } from "../../utils/errorHandler";
import type {
  EntryFieldValue,
  StructuredEntry,
  StructuredFormSection,
} from "../../types";
import TaxProofUpload from "../taxProof/TaxProofUpload";

export interface EntrySectionProps {
  section: StructuredFormSection;
  // All declaration entries; this section filters to its own.
  entries: StructuredEntry[];
  year: number;
  disabled?: boolean;
  declarationId?: string;
}

// A human label for an entry row: prefer a selected dropdown/radio option label,
// else the first non-empty text field, else the section name + index.
function entrySummary(
  section: StructuredFormSection,
  entry: StructuredEntry
): string {
  for (const f of section.fields) {
    const v = entry.values[f.fieldKey];
    if (v && (f.fieldType === "DROPDOWN" || f.fieldType === "RADIO")) {
      const opt = f.options.find((o) => o.value === v);
      if (opt) return opt.label;
    }
  }
  for (const f of section.fields) {
    const v = entry.values[f.fieldKey];
    if (v && (f.fieldType === "TEXT" || f.fieldType === "TEXTAREA")) return v;
  }
  return `${section.shortName} ${entry.entryIndex}`;
}

// One declaration section (income head OR deduction/exemption), rendered
// IT-portal style: a list of entries with their computed amount + "Add Another".
// Works for any structured section — what shows is whatever the company has
// enabled and the regime allows.
export default function EntrySection({
  section,
  entries,
  year,
  disabled = false,
  declarationId,
}: EntrySectionProps) {
  const companyId = useCompanyId();
  const upsert = useUpsertTaxEntry(declarationId);
  const remove = useDeleteTaxEntry(declarationId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StructuredEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StructuredEntry | null>(null);

  const mine = useMemo(
    () =>
      entries
        .filter((e) => e.sectionCode === section.code)
        .sort((a, b) => a.entryIndex - b.entryIndex),
    [entries, section.code]
  );

  const total = mine.reduce((s, e) => s + e.computedAmount, 0);
  const atMax = !section.multiEntry
    ? mine.length >= 1
    : section.maxEntries != null && mine.length >= section.maxEntries;

  const totalLabel =
    section.category === "INCOME"
      ? `Income chargeable under ${section.shortName}`
      : `Total ${section.shortName}`;

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (entry: StructuredEntry) => {
    setEditing(entry);
    setFormOpen(true);
  };

  const handleSubmit = (fieldValues: EntryFieldValue[], pendingFiles: Record<string, File>) => {
    upsert.mutate(
      {
        year,
        payload: {
          sectionId: section.sectionId,
          entryId: editing?.id,
          fieldValues,
        },
      },
      {
        onSuccess: async (declaration) => {
          const fileEntries = Object.values(pendingFiles);
          if (fileEntries.length > 0) {
            try {
              const cid = requireCompanyId(companyId);
              // Resolve the saved entry id: editing preserves its id; for new
              // entries find the last-added entry for this section.
              const savedId =
                editing?.id ??
                [...declaration.entries]
                  .filter((e) => e.sectionCode === section.code)
                  .sort((a, b) => b.entryIndex - a.entryIndex)[0]?.id;
              if (savedId) {
                await Promise.allSettled(
                  fileEntries.map((file) => {
                    if (declarationId) {
                      return uploadTaxDocumentAdmin(cid, declarationId, year, section.code, file, savedId);
                    } else {
                      return uploadTaxDocument(cid, year, section.code, file, savedId);
                    }
                  })
                );
              }
            } catch {
              toast.error("Entry saved but receipt upload failed");
            }
          }
          toast.success("Saved");
          setFormOpen(false);
          setEditing(null);
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      }
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    remove.mutate(
      { year, entryId: deleteTarget.id },
      {
        onSuccess: () => {
          toast.success("Removed");
          setDeleteTarget(null);
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      }
    );
  };

  return (
    <SectionCard
      title={section.label}
      subtitle={section.description ?? undefined}
      actions={
        !disabled && !atMax ? (
          <Button
            size="small"
            variant="outlined"
            startIcon={<MdAdd size={18} />}
            onClick={openAdd}
          >
            {section.multiEntry ? "Add Another" : "Add"}
          </Button>
        ) : undefined
      }
    >
      {mine.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          Nothing added yet.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {mine.map((entry) => (
            <Box
              key={entry.id}
              sx={{
                borderRadius: 2,
                border: 1,
                borderColor: "divider",
                overflow: "hidden",
                bgcolor: "background.paper",
              }}
            >
              {/* Header row: Entry details */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  px: 2,
                  py: 1.5,
                  borderBottom: 1,
                  borderColor: "divider",
                  bgcolor: "grey.25",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 0 }} noWrap>
                  {entrySummary(section, entry)}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <MoneyText value={entry.computedAmount} sx={{ fontWeight: 600 }} />
                  {!disabled && (
                    <>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          aria-label="Edit entry"
                          onClick={() => openEdit(entry)}
                        >
                          <MdEdit size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          aria-label="Delete entry"
                          onClick={() => setDeleteTarget(entry)}
                        >
                          <MdDelete size={16} />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </Box>

              {/* Proof section */}
              <Box sx={{ p: 2 }}>
                <TaxProofUpload
                  entry={entry}
                  section={section}
                  year={year}
                  disabled={disabled}
                  declarationId={declarationId}
                />
              </Box>
            </Box>
          ))}
        </Stack>
      )}

      {mine.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 1.5,
            pt: 1.5,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle2">{totalLabel}</Typography>
          <MoneyText
            value={total}
            variant="subtitle2"
            sx={{ fontWeight: 700 }}
            color={total < 0 ? "error.main" : undefined}
          />
        </Box>
      )}

      <EntryFormDialog
        open={formOpen}
        section={section}
        entry={editing}
        loading={upsert.isPending}
        onSubmit={handleSubmit}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove entry"
        message="Remove this entry from your declaration?"
        confirmLabel="Remove"
        loading={remove.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </SectionCard>
  );
}
