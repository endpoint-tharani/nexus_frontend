import React from "react";
import type { Form16ResponseDto } from "../../../types";

interface Form16VerificationProps {
  data: Form16ResponseDto;
}

const numberToWords = (num: number): string => {
  if (num === 0) return "Zero Rupees Only";

  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const numToWordsLessThanThousand = (n: number): string => {
    let temp = "";
    if (n >= 100) {
      temp += a[Math.floor(n / 100)] + "Hundred ";
      n %= 100;
    }
    if (n > 0) {
      if (temp !== "") temp += "and ";
      if (n < 20) {
        temp += a[n];
      } else {
        temp += b[Math.floor(n / 10)] + " " + a[n % 10];
      }
    }
    return temp;
  };

  let rupeePart = Math.floor(num);
  const paisePart = Math.round((num - rupeePart) * 100);

  let words = "";

  if (rupeePart >= 10000000) {
    words += numToWordsLessThanThousand(Math.floor(rupeePart / 10000000)) + "Crore ";
    rupeePart %= 10000000;
  }
  if (rupeePart >= 100000) {
    words += numToWordsLessThanThousand(Math.floor(rupeePart / 100000)) + "Lakh ";
    rupeePart %= 100000;
  }
  if (rupeePart >= 1000) {
    words += numToWordsLessThanThousand(Math.floor(rupeePart / 1000)) + "Thousand ";
    rupeePart %= 1000;
  }
  if (rupeePart > 0) {
    words += numToWordsLessThanThousand(rupeePart);
  }

  words = words.trim() + " Rupees";

  if (paisePart > 0) {
    words += " and " + numToWordsLessThanThousand(paisePart) + "Paise";
  }

  return words + " Only";
};

export const Form16Verification: React.FC<Form16VerificationProps> = ({ data }) => {
  const { verification, taxComputation } = data;
  const tdsInWords = numberToWords(taxComputation.tdsDeducted);

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

  return (
    <div className="form16-verification-container">
      <div style={{ border: "1px solid #000", padding: "12px", marginTop: "16px" }}>
        <div className="text-bold text-center" style={{ marginBottom: "12px", textTransform: "uppercase" }}>
          Verification
        </div>
        <p style={{ textAlign: "justify", margin: 0, textIndent: "24px" }}>
          I, <span className="text-bold">{verification.authorizedPerson}</span>, in the capacity of{" "}
          <span className="text-bold">{verification.designation}</span>, do hereby certify that a sum
          of <span className="text-bold">Rs. {taxComputation.tdsDeducted.toFixed(2)}</span> (in words:{" "}
          <span className="text-bold">{tdsInWords}</span>) has been deducted and deposited to the credit of
          the Central Government in accordance with the provisions of Chapter XVII-B of the Income-tax Act,
          1961. I further certify that the information given above is true, complete and correct in all
          respects, based on the books of account, documents and other relevant records of the company.
        </p>

        <div className="form16-sign-section">
          <div>
            <div style={{ marginBottom: "8px" }}>
              Place: <span className="text-bold" style={{ borderBottom: "1px dotted #000", paddingBottom: "2px", minWidth: "120px", display: "inline-block" }}>{verification.place || "N/A"}</span>
            </div>
            <div>
              Date: <span className="text-bold" style={{ borderBottom: "1px dotted #000", paddingBottom: "2px", minWidth: "120px", display: "inline-block" }}>{formatDate(verification.date)}</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Signature Area */}
            <div style={{ height: "40px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontStyle: "italic", fontSize: "9px" }}>
              Digitally Signed by {verification.authorizedPerson}
            </div>
            <div className="form16-sign-block">
              Signature of the Person Authorized to Deduct Tax
            </div>
            <div style={{ fontSize: "9px", marginTop: "4px" }}>
              Full Name: <span className="text-bold">{verification.authorizedPerson}</span>
            </div>
            <div style={{ fontSize: "9px" }}>
              Designation: <span className="text-bold">{verification.designation}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
