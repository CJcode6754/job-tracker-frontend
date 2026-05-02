import Papa from 'papaparse';
import type { ApplicationStatus, Priority } from '@/types';
import { useApplicationStore } from '@/store/useApplicationStore';
import { toast } from 'sonner';

export function useImport() {
  const { addApplication } = useApplicationStore();

  const importFromCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: async ({ data }) => {
        for (const row of data as Record<string, string>[]) {
          await addApplication({
            company:      row['Company'],
            role:         row['Role'],
            status:       (row['Status'] as ApplicationStatus) || 'wishlist',
            priority:     (row['Priority'] as Priority) || 'medium',
            applied_date: row['Applied Date'] || undefined,
            job_url:      row['Job URL'] || undefined,
            notes:        row['Notes'] || '',
          });
        }
        toast.success('Import complete!');
      },
    });
  };

  return { importFromCSV };
}