import { useCallback } from 'react';
import { toast } from 'sonner';

interface StatusResponse {
  status: string;
  url?: string;
}

export function useQuotePdf() {
  const generatePdf = useCallback(
    async (companyId: string, quoteId: string): Promise<string | null> => {
      toast.info('Gerando PDF...');
      try {
        const res = await fetch(
          `/api/companies/${companyId}/quotes/${quoteId}/pdf`,
          { method: 'POST' }
        );
        if (!res.ok) throw new Error('failed');
        const { jobId } = (await res.json()) as { jobId: string };
        let status = 'pending';
        let url: string | undefined;
        while (status === 'pending' || status === 'processing') {
          await new Promise((r) => setTimeout(r, 2000));
          const check = await fetch(
            `/api/companies/${companyId}/quotes/${quoteId}/pdf?jobId=${jobId}`
          );
          const data = (await check.json()) as StatusResponse;
          status = data.status;
          url = data.url;
        }
        if (status === 'completed' && url) {
          toast.success('PDF pronto!');
          return url;
        }
        toast.error('Falha ao gerar PDF');
        return null;
      } catch {
        toast.error('Erro ao gerar PDF');
        return null;
      }
    },
    []
  );

  return { generatePdf };
}
