import {
  getSalaryImportDetails,
  deleteSalaryImport,
  getSalaryImportHistory,
} from "../../api/payroll.api";

export const salaryImportService = {
  getDetails: getSalaryImportDetails,
  deleteImport: deleteSalaryImport,
  getHistory: getSalaryImportHistory,
};
