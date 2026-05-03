import * as XLSX from 'xlsx';
import type { ApplicationStatus, Priority } from '@/types';
import { useApplicationStore } from '@/store/useApplicationStore';
import { toast } from 'sonner';

export function useImport() {
  const { addApplication } = useApplicationStore();

  const importFromExcel = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data  = new Uint8Array(e.target?.result as ArrayBuffer);
          const wb    = XLSX.read(data, { type: 'array' });
          const ws    = wb.Sheets[wb.SheetNames[0]];
          const rows  = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });

          if (rows.length === 0) {
            toast.error('Excel file is empty.');
            resolve();
            return;
          }

          for (const row of rows) {
            await addApplication({
              company:         row['Company'],
              role:            row['Role'],
              status:          (row['Status'] as ApplicationStatus) || 'wishlist',
              priority:        (row['Priority'] as Priority) || 'medium',
              applied_date:    row['Applied Date'] || undefined,
              deadline:        row['Deadline'] || undefined,
              job_url:         row['Job URL'] || undefined,
              location:        row['Location'] || undefined,
              work_type:       row['Work Type'] || undefined,
              employment_type: row['Employment Type'] || undefined,
              salary_min:      row['Salary Min'] ? Number(row['Salary Min']) : undefined,
              salary_max:      row['Salary Max'] ? Number(row['Salary Max']) : undefined,
              salary_currency: row['Currency'] || undefined,
              notes:           row['Notes'] || undefined,
            });
          }

          toast.success(`Imported ${rows.length} application${rows.length !== 1 ? 's' : ''}.`);
          resolve();
        } catch (err) {
          toast.error('Import failed. Check your Excel file format.');
          reject(err);
        }
      };

      reader.onerror = () => {
        toast.error('Could not read the file.');
        reject(new Error('FileReader error'));
      };

      reader.readAsArrayBuffer(file);
    });
  };

  return { importFromExcel };
}
