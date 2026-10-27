import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";

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

export interface DeductionAccordionProps {
  sections: StructuredFormSection[];
  entries: StructuredEntry[];
  year: number;
  disabled?: boolean;
  declarationId?: string;
}

// ─────────────────────────────────────────────────────────────────
// Deduction group definitions
// Each group maps section codes to a visual group by prefix/keyword.
// The mapping is cosmetic-only; all data / mutations are unaffected.
// ─────────────────────────────────────────────────────────────────
interface DeductionGroup {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  /** Matches sections whose code contains any of these substrings. */
  match: string[];
}

// All icons are monochrome — color is set via SectionHeader (text.secondary).
const DEDUCTION_GROUPS: DeductionGroup[] = [
  {
    id: "investment",
    label: "Investments",
    subtitle: "80C · ELSS · PPF · LIC",
    icon: <SavingsOutlinedIcon />,
    match: ["80C", "ELSS", "PPF", "LIC", "SECTION_80C"],
  },
  {
    id: "nps",
    label: "NPS",
    subtitle: "80CCD(1) · 80CCD(1B) · 80CCD(2)",
    icon: <TrendingUpOutlinedIcon />,
    match: ["80CCD", "NPS", "SECTION_80CCD"],
  },
  {
    id: "insurance",
    label: "Insurance",
    subtitle: "80D · 80DD · 80DDB",
    icon: <HealthAndSafetyOutlinedIcon />,
    match: ["80D", "SECTION_80D"],
  },
  {
    id: "education",
    label: "Education",
    subtitle: "80E — Education Loan Interest",
    icon: <SchoolOutlinedIcon />,
    match: ["80E", "SECTION_80E", "EDUCATION"],
  },
  {
    id: "donations",
    label: "Donations",
    subtitle: "80G — Charitable Contributions",
    icon: <VolunteerActivismOutlinedIcon />,
    match: ["80G", "SECTION_80G", "DONATION"],
  },
  {
    id: "interest",
    label: "Interest Income",
    subtitle: "80TTA · 80TTB — Savings & FD interest",
    icon: <PercentOutlinedIcon />,
    match: ["80TTA", "80TTB", "INTEREST"],
  },
];

// ─────────────────────────────────────────────────────────────────
// Helper: assign a section to a group by code/label matching
// ─────────────────────────────────────────────────────────────────
function assignGroup(section: StructuredFormSection): string {
  const key = `${section.code} ${section.label}`.toUpperCase();
  for (const group of DEDUCTION_GROUPS) {
    if (group.match.some((m) => key.includes(m.toUpperCase()))) {
      return group.id;
    }
  }
  return "other";
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────
/**
 * Groups deduction sections by category — each group is a single MUI Accordion
 * containing the original EntrySection components (unmolested).
 *
 * Enterprise style: 48px closed height, monochrome icons, no colored expanded
 * background. All mutations / forms / hooks inside EntrySection unchanged.
 */
export default function DeductionAccordion({
  sections,
  entries,
  year,
  disabled,
  declarationId,
}: DeductionAccordionProps) {
  const [expanded, setExpanded] = useState<string | false>(false);

  if (sections.length === 0) return null;

  const toggle = (id: string) =>
    setExpanded((prev) => (prev === id ? false : id));

  // Group sections
  const grouped = new Map<string, StructuredFormSection[]>();
  for (const s of sections) {
    const gid = assignGroup(s);
    grouped.set(gid, [...(grouped.get(gid) ?? []), s]);
  }

  // Render groups in the defined order, then "Other"
  const groupOrder = [...DEDUCTION_GROUPS.map((g) => g.id), "other"];
  const renderedGroups: React.ReactNode[] = [];

  for (const gid of groupOrder) {
    const secs = grouped.get(gid);
    if (!secs || secs.length === 0) continue;

    const meta = DEDUCTION_GROUPS.find((g) => g.id === gid);
    const label = meta?.label ?? "Other Deductions";
    const subtitle = meta?.subtitle ?? secs.map((s) => s.shortName).join(" · ");
    const icon = meta?.icon ?? <SavingsOutlinedIcon />;

    // Compute summary info
    const groupEntries = entries.filter((e) => secs.some((s) => s.code === e.sectionCode));
    const hasEntries = groupEntries.length > 0;
    const totalEntries = groupEntries.length;
    const totalDeclaredAmount = groupEntries.reduce((sum, e) => sum + e.computedAmount, 0);
    const uploadedProofCount = groupEntries.reduce((sum, e) => sum + (e.documents?.length ?? 0), 0);

    const names = groupEntries
      .map((e) => {
        const sec = secs.find((s) => s.code === e.sectionCode);
        return sec ? entrySummary(sec, e) : "";
      })
      .filter(Boolean);
    const namesPreview = names.slice(0, 3).join(", ");

    renderedGroups.push(
      <Accordion
        key={gid}
        expanded={expanded === gid}
        onChange={() => toggle(gid)}
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
          aria-controls={`deduction-${gid}-content`}
          id={`deduction-${gid}-header`}
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
            icon={icon}
            title={label}
            subtitle={hasEntries ? namesPreview : subtitle}
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

        <AccordionDetails sx={{ p: 2.5, pt: 1.5, display: "flex", flexDirection: "column", gap: 2 }}>
          {secs.map((section) => (
            <Box key={section.sectionId}>
              {secs.length > 1 && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    fontWeight: 600,
                    color: "text.secondary",
                    mb: 0.5,
                    mt: 1,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {section.label}
                </Typography>
              )}
              <EntrySection
                section={section}
                entries={entries}
                year={year}
                disabled={disabled}
                declarationId={declarationId}
              />
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>
    );
  }

  return <>{renderedGroups}</>;
}
