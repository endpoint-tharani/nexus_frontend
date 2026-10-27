import React from "react";
import type { Form16ResponseDto } from "../../../types";

interface Form16PartBProps {
  data: Form16ResponseDto;
}

export const Form16PartB: React.FC<Form16PartBProps> = ({ data }) => {
  const { salary, exemptions, section16, otherIncome, chapterVIA, taxComputation } = data;

  // Exemptions Calculations
  const otherExemptionsSum = exemptions.otherExemptions.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  const totalExemptions =
    exemptions.hra +
    exemptions.lta +
    exemptions.gratuity +
    exemptions.leaveEncashment +
    otherExemptionsSum;

  const totalGrossSalary =
    salary.grossSalary +
    salary.perquisites +
    salary.profitsInLieu +
    salary.salaryFromPreviousEmployer;

  const balanceSalary = totalGrossSalary - totalExemptions;

  // Section 16 Deductions
  const totalSection16 =
    section16.standardDeduction +
    section16.professionalTax +
    section16.entertainmentAllowance;

  const incomeChargeableSalaries = balanceSalary - totalSection16;

  // Other Income
  const totalOtherIncome = otherIncome.houseProperty + otherIncome.otherSources;

  // Chapter VI-A Deductions
  const otherChapterVIASum = chapterVIA.other.reduce((sum, item) => sum + (item.allowed ?? 0), 0);
  const totalChapterVIA =
    chapterVIA["80C"] +
    chapterVIA["80CCD1B"] +
    chapterVIA["80CCD2"] +
    chapterVIA["80D"] +
    chapterVIA["80E"] +
    chapterVIA["80G"] +
    chapterVIA["80TTA"] +
    otherChapterVIASum;

  return (
    <div className="form16-partb-block">
      <div className="form16-page-break">
        <h1 className="form16-title-main">FORM NO. 16 - PART B</h1>
        <p className="form16-title-sub text-center">Annexure</p>
        <p className="form16-header-desc">
          Details of Salary Paid and Any Other Income and Tax Deducted
        </p>

        <table className="form16-table">
          <thead>
            <tr>
              <th className="w-10">S.No.</th>
              <th className="w-50">Particulars of Income</th>
              <th className="w-20 text-right">Amount (Rs.)</th>
              <th className="w-20 text-right">Total (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            {/* 1. Gross Salary */}
            <tr className="text-bold">
              <td>1</td>
              <td>Gross salary</td>
              <td></td>
              <td className="text-right">{totalGrossSalary.toFixed(2)}</td>
            </tr>
            <tr>
              <td></td>
              <td>(a) Salary as per provisions contained in section 17(1)</td>
              <td className="text-right">{salary.grossSalary.toFixed(2)}</td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td>(b) Value of perquisites under section 17(2)</td>
              <td className="text-right">{salary.perquisites.toFixed(2)}</td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td>(c) Profits in lieu of salary under section 17(3)</td>
              <td className="text-right">{salary.profitsInLieu.toFixed(2)}</td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td>(d) Salary received from other employer(s)</td>
              <td className="text-right">{salary.salaryFromPreviousEmployer.toFixed(2)}</td>
              <td></td>
            </tr>

            {/* 2. Exemptions under Section 10 */}
            <tr className="text-bold">
              <td>2</td>
              <td>Less: Allowance to the extent exempt under section 10</td>
              <td></td>
              <td className="text-right">({totalExemptions.toFixed(2)})</td>
            </tr>
            {exemptions.hra > 0 && (
              <tr>
                <td></td>
                <td>- House Rent Allowance (HRA) under section 10(13A)</td>
                <td className="text-right">{exemptions.hra.toFixed(2)}</td>
                <td></td>
              </tr>
            )}
            {exemptions.lta > 0 && (
              <tr>
                <td></td>
                <td>- Leave Travel Allowance (LTA) under section 10(5)</td>
                <td className="text-right">{exemptions.lta.toFixed(2)}</td>
                <td></td>
              </tr>
            )}
            {exemptions.gratuity > 0 && (
              <tr>
                <td></td>
                <td>- Death-cum-retirement Gratuity under section 10(10)</td>
                <td className="text-right">{exemptions.gratuity.toFixed(2)}</td>
                <td></td>
              </tr>
            )}
            {exemptions.leaveEncashment > 0 && (
              <tr>
                <td></td>
                <td>- Leave Encashment under section 10(10AA)</td>
                <td className="text-right">{exemptions.leaveEncashment.toFixed(2)}</td>
                <td></td>
              </tr>
            )}
            {exemptions.otherExemptions.map((item) => (
              <tr key={item.code}>
                <td></td>
                <td>- {item.label}</td>
                <td className="text-right">{(item.amount ?? 0).toFixed(2)}</td>
                <td></td>
              </tr>
            ))}

            {/* 3. Balance */}
            <tr className="text-bold">
              <td>3</td>
              <td>Balance (1 - 2)</td>
              <td></td>
              <td className="text-right">{balanceSalary.toFixed(2)}</td>
            </tr>

            {/* 4. Section 16 Deductions */}
            <tr className="text-bold">
              <td>4</td>
              <td>Deductions under section 16</td>
              <td></td>
              <td className="text-right">({totalSection16.toFixed(2)})</td>
            </tr>
            <tr>
              <td></td>
              <td>(a) Standard deduction under section 16(ia)</td>
              <td className="text-right">{section16.standardDeduction.toFixed(2)}</td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td>(b) Professional tax under section 16(iii)</td>
              <td className="text-right">{section16.professionalTax.toFixed(2)}</td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td>(c) Entertainment allowance under section 16(ii)</td>
              <td className="text-right">{section16.entertainmentAllowance.toFixed(2)}</td>
              <td></td>
            </tr>

            {/* 5. Income Chargeable Salaries */}
            <tr className="text-bold">
              <td>5</td>
              <td>Income chargeable under the head "Salaries" (3 - 4)</td>
              <td></td>
              <td className="text-right">{incomeChargeableSalaries.toFixed(2)}</td>
            </tr>

            {/* 6. Other Income */}
            <tr className="text-bold">
              <td>6</td>
              <td>Add: Any other income reported by employee</td>
              <td></td>
              <td className="text-right">{totalOtherIncome.toFixed(2)}</td>
            </tr>
            {otherIncome.houseProperty !== 0 && (
              <tr>
                <td></td>
                <td>- Income/Loss from house property (declared)</td>
                <td className="text-right">{otherIncome.houseProperty.toFixed(2)}</td>
                <td></td>
              </tr>
            )}
            {otherIncome.otherSources !== 0 && (
              <tr>
                <td></td>
                <td>- Income from other sources (declared)</td>
                <td className="text-right">{otherIncome.otherSources.toFixed(2)}</td>
                <td></td>
              </tr>
            )}

            {/* 7. Gross Total Income */}
            <tr className="text-bold">
              <td>7</td>
              <td>Gross Total Income (5 + 6)</td>
              <td></td>
              <td className="text-right">{taxComputation.grossTotalIncome.toFixed(2)}</td>
            </tr>

            {/* 8. Chapter VI-A Deductions */}
            <tr className="text-bold">
              <td>8</td>
              <td>Deductions under Chapter VI-A</td>
              <td></td>
              <td className="text-right">({totalChapterVIA.toFixed(2)})</td>
            </tr>
            {chapterVIA["80C"] > 0 && (
              <tr>
                <td></td>
                <td>- Section 80C deduction</td>
                <td className="text-right">{chapterVIA["80C"].toFixed(2)}</td>
                <td></td>
              </tr>
            )}
            {chapterVIA["80CCD1B"] > 0 && (
              <tr>
                <td></td>
                <td>- Section 80CCD(1B) pension deduction</td>
                <td className="text-right">{chapterVIA["80CCD1B"].toFixed(2)}</td>
                <td></td>
              </tr>
            )}
            {chapterVIA["80CCD2"] > 0 && (
              <tr>
                <td></td>
                <td>- Section 80CCD(2) employer pension contribution</td>
                <td className="text-right">{chapterVIA["80CCD2"].toFixed(2)}</td>
                <td></td>
              </tr>
            )}
            {chapterVIA["80D"] > 0 && (
              <tr>
                <td></td>
                <td>- Section 80D medical insurance deduction</td>
                <td className="text-right">{chapterVIA["80D"].toFixed(2)}</td>
                <td></td>
              </tr>
            )}
            {chapterVIA["80E"] > 0 && (
              <tr>
                <td></td>
                <td>- Section 80E education loan interest deduction</td>
                <td className="text-right">{chapterVIA["80E"].toFixed(2)}</td>
                <td></td>
              </tr>
            )}
            {chapterVIA["80G"] > 0 && (
              <tr>
                <td></td>
                <td>- Section 80G donations deduction</td>
                <td className="text-right">{chapterVIA["80G"].toFixed(2)}</td>
                <td></td>
              </tr>
            )}
            {chapterVIA["80TTA"] > 0 && (
              <tr>
                <td></td>
                <td>- Section 80TTA savings interest deduction</td>
                <td className="text-right">{chapterVIA["80TTA"].toFixed(2)}</td>
                <td></td>
              </tr>
            )}
            {chapterVIA.other.map((item) => (
              <tr key={item.code}>
                <td></td>
                <td>- {item.label || item.code}</td>
                <td className="text-right">{(item.allowed ?? 0).toFixed(2)}</td>
                <td></td>
              </tr>
            ))}

            {/* 9. Taxable Income */}
            <tr className="text-bold">
              <td>9</td>
              <td>Total taxable income (7 - 8)</td>
              <td></td>
              <td className="text-right">{taxComputation.taxableIncome.toFixed(2)}</td>
            </tr>

            {/* 10. Tax on Total Income */}
            <tr>
              <td>10</td>
              <td>Tax on total income</td>
              <td></td>
              <td className="text-right">{taxComputation.tax.toFixed(2)}</td>
            </tr>

            {/* 11. Section 87A Rebate */}
            {taxComputation.rebate87A > 0 && (
              <tr>
                <td>11</td>
                <td>Less: Rebate under section 87A</td>
                <td></td>
                <td className="text-right">({taxComputation.rebate87A.toFixed(2)})</td>
              </tr>
            )}

            {/* 12. Surcharge / Cess */}
            <tr>
              <td>12</td>
              <td>Add: Surcharge & Health and Education Cess</td>
              <td className="text-right">
                {(taxComputation.surcharge + taxComputation.cess).toFixed(2)}
              </td>
              <td></td>
            </tr>

            {/* 13. Relief under Section 89 */}
            {taxComputation.relief89 > 0 && (
              <tr>
                <td>13</td>
                <td>Less: Relief under section 89</td>
                <td></td>
                <td className="text-right">({taxComputation.relief89.toFixed(2)})</td>
              </tr>
            )}

            {/* 14. Total Tax Payable */}
            <tr className="text-bold">
              <td>14</td>
              <td>Total tax payable (10 - 11 + 12 - 13)</td>
              <td></td>
              <td className="text-right">{taxComputation.totalTax.toFixed(2)}</td>
            </tr>

            {/* 15. Less: TDS Deducted */}
            <tr className="text-bold">
              <td>15</td>
              <td>Less: Tax deducted and credited (TDS)</td>
              <td></td>
              <td className="text-right">({taxComputation.tdsDeducted.toFixed(2)})</td>
            </tr>

            {/* 16. Balance Tax */}
            <tr className="text-bold" style={{ backgroundColor: "#f8fafc" }}>
              <td>16</td>
              <td>Net tax payable / refundable (14 - 15)</td>
              <td></td>
              <td className="text-right" style={{ fontSize: "11px", border: "3px double #000" }}>
                {taxComputation.balanceTax.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
