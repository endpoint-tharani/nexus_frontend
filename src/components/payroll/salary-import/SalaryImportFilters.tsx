import { TextField, InputAdornment } from "@mui/material";
import { MdSearch } from "react-icons/md";
import { useSalaryImportDetails } from "../../../hooks/payroll/useSalaryImportDetails";

export default function SalaryImportFilters() {
  const { search, setSearch } = useSalaryImportDetails();

  return (
    <TextField
      placeholder="Search employee name or code..."
      size="small"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      sx={{
        width: { xs: "100%", sm: 280 },
        "& .MuiInputBase-root": {
          height: 36, // 36px compact height
          fontSize: "14px",
        },
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <MdSearch size={18} />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
