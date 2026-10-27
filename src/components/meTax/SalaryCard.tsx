import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";

import { MoneyText } from "../ui";
import SectionHeader from "./SectionHeader";
import type { StructuredSalary } from "../../types";

export interface SalaryCardProps {
  salary: StructuredSalary;
  defaultExpanded?: boolean;
}

interface SalaryRowDef {
  label: string;
  value: number | undefined;
  /** Only render if value > 0 (optional rows). */
  optional?: boolean;
}

function AmountCell({ value }: { value: number | undefined }) {
  return (
    <TableCell align="right" sx={{ border: 0, py: 0.5, pr: 2.5 }}>
      <MoneyText value={value ?? 0} variant="body2" sx={{ fontWeight: 500, color: "text.primary" }} />
    </TableCell>
  );
}

/**
 * Compact read-only salary breakdown inside an Accordion.
 * Enterprise style: 48px closed height, no colored expanded background,
 * bottom-divider-only row separator.
 */
const SalaryCard = React.memo(function SalaryCard({
  salary,
  defaultExpanded = true,
}: SalaryCardProps) {
  const rows: SalaryRowDef[] = [
    { label: "Basic Salary", value: salary.basicAnnual },
    { label: "HRA", value: salary.hraAnnual },
    { label: "Special Allowance", value: salary.specialAllowanceAnnual },
    { label: "Conveyance", value: salary.conveyanceAnnual, optional: true },
    { label: "Medical", value: salary.medicalAnnual, optional: true },
    { label: "Communication", value: salary.communicationAnnual, optional: true },
    { label: "Other Allowance", value: salary.otherAllowanceAnnual, optional: true },
    { label: "Bonus", value: salary.bonusAnnual },
    { label: "Incentive", value: salary.incentiveAnnual, optional: true },
    { label: "Gratuity", value: salary.gratuityAmount, optional: true },
    {
      label: "Previous Employer Salary",
      value: salary.previousEmploymentSalary,
      optional: true,
    },
  ];

  const visible = rows.filter((r) => !r.optional || (r.value ?? 0) > 0);

  return (
    <Accordion
      defaultExpanded={defaultExpanded}
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
        aria-controls="salary-accordion-content"
        id="salary-accordion-header"
        sx={{
          px: 2.5,
          minHeight: 48,
          "&.Mui-expanded": { minHeight: 48 },
          "& .MuiAccordionSummary-content": { my: 0 },
          "&:hover": { bgcolor: "grey.50" },
          transition: "background-color 120ms ease",
        }}
      >
        <SectionHeader
          icon={<AccountBalanceOutlinedIcon />}
          title="Salary"
          subtitle="Prefilled from payroll — read-only"
        />
      </AccordionSummary>

      <AccordionDetails sx={{ p: 0, pb: 0.5 }}>
        <Table size="small">
          <TableBody>
            {visible.map((row) => (
              <TableRow
                key={row.label}
                sx={{
                  "&:hover": { bgcolor: "grey.50" },
                  "& td": { border: 0 },
                  transition: "background-color 120ms ease",
                }}
              >
                <TableCell sx={{ pl: 2.5, py: 0.5, color: "text.secondary" }}>
                  <Typography variant="body2" color="text.secondary">{row.label}</Typography>
                </TableCell>
                <AmountCell value={row.value} />
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Divider sx={{ mx: 2.5, mt: 0.5 }} />

        {/* Gross total */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2.5,
            py: 1.25,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
            Gross Salary
          </Typography>
          <MoneyText
            value={salary.grandTotalSalary}
            variant="body2"
            sx={{ fontWeight: 700, color: "text.primary" }}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
});

export default SalaryCard;
