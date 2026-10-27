import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { MdClose } from "react-icons/md";
import type { SalaryImportType } from "../../types";
import SalaryImportContent from "./salary-import/SalaryImportContent";

export interface SalaryImportDetailsDialogProps {
  open: boolean;
  runId: string | null;
  type: SalaryImportType;
  onClose: () => void;
  canManage?: boolean;
}

export default function SalaryImportDetailsDialog({
  open,
  runId,
  type,
  onClose,
  canManage = true,
}: SalaryImportDetailsDialogProps) {
  const isSalary = type === "SALARY";

  return (
    <Dialog open={open} onClose={onClose} maxWidth={isSalary ? "lg" : "md"} fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>
        {isSalary
          ? "Salary Import Details"
          : type === "BONUS"
          ? "Bonus Import Details"
          : "Incentive Import Details"}
        <IconButton
          aria-label="Close details"
          onClick={onClose}
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <MdClose size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {runId && (
          <SalaryImportContent
            type={type}
            runId={runId}
            onBack={onClose}
            canManage={canManage}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
