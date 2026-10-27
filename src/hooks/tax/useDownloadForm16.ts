import { useMutation } from "@tanstack/react-query";
import { downloadForm16 } from "../../api/form16.api";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

export interface DownloadForm16Args {
  id: string;
  employeeName: string;
  year: number;
}

export const useDownloadForm16 = () => {
  const companyId = useCompanyId();

  return useMutation<void, Error, DownloadForm16Args>({
    mutationFn: async ({ id }) => {
      const cid = requireCompanyId(companyId);
      const res = await downloadForm16(cid, id);
      const url = res.data.data.downloadUrl;
      window.open(url, "_blank", "noopener,noreferrer");
    },
  });
};
