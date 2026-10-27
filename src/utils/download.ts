// Browser file-download helpers, used by the XLSX export flows (tax module).

// Trigger a "Save as" for an in-memory Blob.
export const downloadBlob = (blob: Blob, fileName: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoke on the next tick so the click has a chance to start the download.
  window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
};

// Convenience for an axios `responseType: "blob"` response carrying an .xlsx.
const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const downloadXlsx = (data: BlobPart, fileName: string): void => {
  const blob =
    data instanceof Blob ? data : new Blob([data], { type: XLSX_MIME });
  const name = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
  downloadBlob(blob, name);
};
