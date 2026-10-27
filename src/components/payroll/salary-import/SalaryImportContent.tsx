import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import toast from "react-hot-toast";

import { useSalaryImportDetails, SalaryImportDetailsProvider } from "../../../hooks/payroll/useSalaryImportDetails";
import { getErrorMessage } from "../../../utils/errorHandler";
import type { PayrollEntry, SalaryImportType } from "../../../types";

import SalaryImportHeader from "./SalaryImportHeader";
import SalaryImportSummary from "./SalaryImportSummary";
import SalaryImportEntriesTable from "./SalaryImportEntriesTable";
import SalaryImportLoading from "./SalaryImportLoading";

import PayrollEntryEditor from "../PayrollEntryEditor";
import PayStatementView from "../PayStatementView";

export interface SalaryImportContentProps {
  type: SalaryImportType;
  runId: string | null;
  onBack: () => void;
  canManage?: boolean;
}

const employeeLabel = (entry: PayrollEntry) =>
  entry.employeeName ?? entry.employeeCode ?? entry.employeeId;

export default function SalaryImportContent({
  type,
  runId,
  onBack,
  canManage = true,
}: SalaryImportContentProps) {
  const state = useSalaryImportDetails(type, runId);
  const { run, isLoading, isError, isSalary, deleteEntryMutation } = state;

  const [editing, setEditing] = useState<PayrollEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PayrollEntry | null>(null);
  const [statementFor, setStatementFor] = useState<PayrollEntry | null>(null);

  const handleDeleteEntry = () => {
    if (!deleteTarget) return;
    deleteEntryMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Payroll entry deleted");
        setDeleteTarget(null);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  if (isLoading) {
    return <SalaryImportLoading />;
  }

  if (isError || !run) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography color="error" sx={{ fontWeight: 600 }}>
          Failed to load import details.
        </Typography>
      </Box>
    );
  }


  return (
    <SalaryImportDetailsProvider value={state}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0, overflow: "hidden" }}>
        <Box sx={{ flexShrink: 0 }}>
          <SalaryImportHeader onBack={onBack} />
        </Box>
        
        <Box sx={{ flexShrink: 0 }}>
          <SalaryImportSummary />
        </Box>
        
        <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", height: "100%" }}>
          <SalaryImportEntriesTable
            onEditEntry={setEditing}
            onViewStatement={setStatementFor}
            onDeleteEntry={setDeleteTarget}
            canManage={canManage}
          />
        </Box>

        {/* Salary-only: Edit entry modal */}
        {isSalary && (
          <PayrollEntryEditor
            open={!!editing}
            entry={editing}
            onClose={() => setEditing(null)}
          />
        )}

        {/* Salary-only: Pay statement modal */}
        {isSalary && (
          <PayStatementView
            open={!!statementFor}
            employeeId={statementFor?.employeeId ?? null}
            year={run?.year ?? new Date().getFullYear()}
            employeeName={statementFor?.employeeName ?? statementFor?.employeeCode}
            onClose={() => setStatementFor(null)}
          />
        )}

        {/* Salary-only: Delete entry confirmation modal */}
        {isSalary && (
          <Dialog
            open={!!deleteTarget}
            onClose={
              deleteEntryMutation.isPending ? undefined : () => setDeleteTarget(null)
            }
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle sx={{ fontWeight: 700 }}>Delete entry</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Delete the payroll entry for{" "}
                <strong>
                  {deleteTarget ? employeeLabel(deleteTarget) : "this employee"}
                </strong>
                ? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteEntryMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                color="error"
                variant="contained"
                onClick={handleDeleteEntry}
                disabled={deleteEntryMutation.isPending}
                sx={{ minWidth: 120 }}
              >
                {deleteEntryMutation.isPending ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </SalaryImportDetailsProvider>
  );
}
