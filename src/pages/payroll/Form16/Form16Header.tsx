import React from "react";
import type { Form16ResponseDto } from "../../../types";
import auronoxLogo from "../../../assets/auronox-logo.png";

interface Form16HeaderProps {
  data: Form16ResponseDto;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const Form16Header: React.FC<Form16HeaderProps> = ({ data }) => {
  const { company, employee, assessmentYear, period } = data;

  return (
    <div className="form16-header-block">
      {/* Top branding bar */}
      <div className="form16-logo-container">
        <img src={auronoxLogo} alt="Auronox Logo" className="form16-logo" />
      </div>

      <h1 className="form16-title-main">FORM NO. 16</h1>
      <p className="form16-title-sub text-center">[See rule 31(1)(a)]</p>
      
      <p className="form16-header-desc">
        PART A: Certificate under section 203 of the Income-tax Act, 1961 for tax deducted at source from income under the head "Salaries"
      </p>

      {/* Main Employer / Employee Detail Table */}
      <table className="form16-table">
        <tbody>
          <tr>
            <th className="w-50" colSpan={2}>
              Name and Address of the Employer / Deductor
            </th>
            <th className="w-50" colSpan={2}>
              Name and Address of the Employee
            </th>
          </tr>
          <tr>
            <td colSpan={2} style={{ height: "80px" }}>
              <div className="text-bold">{company.name}</div>
              <div style={{ whiteSpace: "pre-wrap", marginTop: "4px" }}>
                {company.address}
              </div>
              <div style={{ marginTop: "4px" }}>
                Email: {company.email} | Phone: {company.phone}
              </div>
            </td>
            <td colSpan={2} style={{ height: "80px" }}>
              <div className="text-bold">{employee.name}</div>
              <div style={{ whiteSpace: "pre-wrap", marginTop: "4px" }}>
                {employee.address || "N/A"}
              </div>
              <div style={{ marginTop: "4px" }}>
                Code: {employee.employeeCode} | Dept: {employee.department}
              </div>
              <div>Desg: {employee.designation || "N/A"}</div>
            </td>
          </tr>
          <tr>
            <th className="w-25">PAN of the Deductor</th>
            <th className="w-25">TAN of the Deductor</th>
            <th className="w-25">PAN of the Employee</th>
            <th className="w-25">CIT (TDS) Address</th>
          </tr>
          <tr>
            <td className="text-center text-bold">{company.pan || "N/A"}</td>
            <td className="text-center text-bold">{company.tan || "N/A"}</td>
            <td className="text-center text-bold">{employee.pan || "N/A"}</td>
            <td>
              Income Tax Office, TDS Circle
            </td>
          </tr>
          <tr>
            <th colSpan={2}>Period with Employer (FY)</th>
            <th className="w-25">Assessment Year</th>
            <th className="w-25">Tax Regime</th>
          </tr>
          <tr>
            <td colSpan={2} className="text-center">
              From: <span className="text-bold">{formatDate(period.from)}</span> To:{" "}
              <span className="text-bold">{formatDate(period.to)}</span>
            </td>
            <td className="text-center text-bold">{assessmentYear}</td>
            <td className="text-center text-bold">{data.taxRegime} REGIME</td>
          </tr>
        </tbody>
      </table>

      {/* Summary of Tax Deposited Table */}
      <div className="form16-table-title">
        Summary of Tax Deducted and Deposited in the Central Government Account
      </div>
      <table className="form16-table">
        <thead>
          <tr>
            <th className="w-25">Quarter</th>
            <th className="w-25">Amount Credited (Rs.)</th>
            <th className="w-25">Tax Deducted (Rs.)</th>
            <th className="w-25">Tax Deposited/Paid (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          {data.quarterlyTds.map((qtr) => (
            <tr key={qtr.quarter}>
              <td>{qtr.quarter}</td>
              <td className="text-right">{(qtr.amountPaid ?? 0).toFixed(2)}</td>
              <td className="text-right">{(qtr.tds ?? 0).toFixed(2)}</td>
              <td className="text-right">{(qtr.deposited ?? 0).toFixed(2)}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: "bold" }}>
            <td>Total</td>
            <td className="text-right">
              {data.quarterlyTds.reduce((sum, q) => sum + (q.amountPaid ?? 0), 0).toFixed(2)}
            </td>
            <td className="text-right">
              {data.quarterlyTds.reduce((sum, q) => sum + (q.tds ?? 0), 0).toFixed(2)}
            </td>
            <td className="text-right">
              {data.quarterlyTds.reduce((sum, q) => sum + (q.deposited ?? 0), 0).toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
