import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";

import SectionHeader from "./SectionHeader";
import { EntrySection } from "../taxStructured";
import { MoneyText } from "../ui";
import type { StructuredEntry, StructuredFormSection } from "../../types";

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

export interface IncomeAccordionProps {
  sections: StructuredFormSection[];
  entries: StructuredEntry[];
  year: number;
  disabled?: boolean;
  declarationId?: string;
}

// Icon map by section code prefix — monochrome via SectionHeader
function sectionIcon(code: string) {
  if (code.startsWith("HOUSE") || code.startsWith("HP"))
    return <HomeOutlinedIcon />;
  return <PaymentsOutlinedIcon />;
}

/**
 * Renders INCOME-category sections (House Property, Other Sources, …) each in
 * its own Accordion, single-open. Enterprise style: 48px closed height, no
 * colored expanded background, bottom-divider-only separator.
 */
export default function IncomeAccordion({
  sections,
  entries,
  year,
  disabled,
  declarationId,
}: IncomeAccordionProps) {
  const [expanded, setExpanded] = useState<string | false>(false);

  if (sections.length === 0) return null;

  const toggle = (sectionId: string) =>
    setExpanded((prev) => (prev === sectionId ? false : sectionId));

  return (
    <>
      {sections.map((section) => {
        // Compute summary info
        const sectionEntries = entries.filter((e) => e.sectionCode === section.code);
        const hasEntries = sectionEntries.length > 0;
        const totalEntries = sectionEntries.length;
        const totalDeclaredAmount = sectionEntries.reduce((sum, e) => sum + e.computedAmount, 0);
        const uploadedProofCount = sectionEntries.reduce((sum, e) => sum + (e.documents?.length ?? 0), 0);

        const names = sectionEntries.map((e) => entrySummary(section, e)).filter(Boolean);
        const namesPreview = names.slice(0, 3).join(", ");
        const defaultSubtitle = section.description ?? undefined;

        return (
          <Accordion
            key={section.sectionId}
            expanded={expanded === section.sectionId}
            onChange={() => toggle(section.sectionId)}
            disableGutters
            elevation={0}
            sx={{
              border: "none",
              borderRadius: "10px !important",
              "&:before": { display: "none" },
              overflow: "hidden",
              transition: "box-shadow 150ms ease",
              "&.Mui-expanded": {
                boxShadow: "0 2px 6px rgba(15,23,42,0.07)",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreOutlinedIcon sx={{ fontSize: 20, color: "text.secondary" }} />}
              aria-controls={`income-${section.sectionId}-content`}
              id={`income-${section.sectionId}-header`}
              sx={{
                px: 2.5,
                minHeight: 48,
                "&.Mui-expanded": { minHeight: 48 },
                "& .MuiAccordionSummary-content": {
                  my: 0,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  pr: 2,
                },
                "&:hover": { bgcolor: "grey.50" },
                transition: "background-color 120ms ease",
              }}
            >
              <SectionHeader
                icon={sectionIcon(section.code)}
                title={section.label}
                subtitle={hasEntries ? namesPreview : defaultSubtitle}
              />
              {hasEntries && (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", textAlign: "right", ml: 2, flexShrink: 0 }}>
                  <MoneyText
                    value={totalDeclaredAmount}
                    variant="body2"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {totalEntries} {totalEntries === 1 ? "Declaration" : "Declarations"}{" "}
                    {uploadedProofCount > 0 && ` • ${uploadedProofCount} ${uploadedProofCount === 1 ? "Proof" : "Proofs"} Uploaded`}
                  </Typography>
                </Box>
              )}
            </AccordionSummary>

            <AccordionDetails sx={{ p: 2.5, pt: 2 }}>
              {/* Render the EntrySection directly — preserves all mutations */}
              <EntrySection
                section={section}
                entries={entries}
                year={year}
                disabled={disabled}
                declarationId={declarationId}
              />
            </AccordionDetails>
          </Accordion>
        );
      })}
    </>
  );
}
