import React, { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { MdFileDownload } from "react-icons/md";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

interface Form16DownloadButtonProps {
  employeeCode: string;
  financialYear: string;
  className?: string;
}

export const Form16DownloadButton: React.FC<Form16DownloadButtonProps> = ({
  employeeCode,
  financialYear,
  className,
}) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const pageElements = document.querySelectorAll(".form16-a4-sheet");
      
      if (!pageElements || pageElements.length === 0) {
        throw new Error("Form 16 sheets not found in DOM");
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      toast.loading("Generating PDF...", { id: "pdf-gen" });

      for (let i = 0; i < pageElements.length; i++) {
        const element = pageElements[i] as HTMLElement;

        // Force background colors and images to be preserved
        const canvas = await html2canvas(element, {
          scale: 2, // High resolution scaling
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          windowWidth: 794, // 210mm in pixels at 96 DPI
          windowHeight: 1123, // 297mm in pixels at 96 DPI
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);

        if (i > 0) {
          pdf.addPage();
        }

        // A4 page dimensions are 210mm x 297mm
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
      }

      const filename = `Form16_${employeeCode}_${financialYear}.pdf`;
      pdf.save(filename);
      
      toast.success("Form 16 PDF downloaded successfully!", { id: "pdf-gen" });
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF. Please try printing or refreshing.", { id: "pdf-gen" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      className={className}
      startIcon={downloading ? <CircularProgress size={16} color="inherit" /> : <MdFileDownload />}
      onClick={handleDownloadPdf}
      disabled={downloading}
    >
      {downloading ? "Exporting PDF..." : "Download Form 16"}
    </Button>
  );
};
