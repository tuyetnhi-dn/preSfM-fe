export const viewerService = {
  getPlyUrl(id: string): string {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
    return `${base}/storage/presign-download?bucket=presfm-artifacts&objectKey=${id}.ply`;
  },
};
