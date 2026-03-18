import { getAuthHeaders } from '../roleApi';
import { fetchApi, getApiBaseUrl } from './core';

const EXPORTS_BASE = '/exports';

export interface PdfExportRequest {
  resultId: string;
  format: 'FULL_REPORT' | 'MANAGER_SUMMARY' | 'CANDIDATE_BRIEF';
  locale: string;
  sections?: string[];
}

export interface PdfExportCreatedResponse {
  exportId: string;
  status: string;
}

export interface PdfExportStatusResponse {
  exportId: string;
  status: 'QUEUED' | 'GENERATING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
  fileSizeBytes: number | null;
  createdAt: string;
}

export const pdfExportApi = {
  create: async (request: PdfExportRequest): Promise<PdfExportCreatedResponse> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${EXPORTS_BASE}/pdf`, {
      method: 'POST',
      body: JSON.stringify(request),
      authHeaders,
    });
  },

  getStatus: async (exportId: string): Promise<PdfExportStatusResponse> => {
    const authHeaders = await getAuthHeaders();
    return fetchApi(`${EXPORTS_BASE}/${exportId}/status`, {
      authHeaders,
      cache: 'no-store',
    });
  },

  // Uses raw fetch instead of fetchApi because we need the raw Response
  // to access the blob body and Content-Disposition header for filename extraction.
  download: async (exportId: string): Promise<void> => {
    const authHeaders = await getAuthHeaders();
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}${EXPORTS_BASE}/${exportId}/download`;

    const response = await fetch(url, { headers: { ...authHeaders } });
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;

    const disposition = response.headers.get('Content-Disposition');
    const filenameMatch = disposition?.match(/filename="(.+)"/);
    a.download = filenameMatch?.[1] ?? `export-${exportId}.pdf`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  },
};
