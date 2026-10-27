import { Stack } from "@mui/material";
import type { StructuredDocument } from "../../types";
import TaxProofCard from "./TaxProofCard";

export interface TaxProofListProps {
  documents: StructuredDocument[];
  onView: (doc: StructuredDocument) => void;
  onDownload: (doc: StructuredDocument) => void;
  onDelete: (doc: StructuredDocument) => void;
  disabled?: boolean;
}

export default function TaxProofList({
  documents,
  onView,
  onDownload,
  onDelete,
  disabled = false,
}: TaxProofListProps) {
  if (documents.length === 0) return null;

  return (
    <Stack spacing={1} sx={{ mt: 1 }}>
      {documents.map((doc) => (
        <TaxProofCard
          key={doc.id}
          document={doc}
          onView={onView}
          onDownload={onDownload}
          onDelete={onDelete}
          disabled={disabled}
        />
      ))}
    </Stack>
  );
}
