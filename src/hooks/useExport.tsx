import Papa from 'papaparse';
import type { JobApplication } from '@/types';

export function useExport() {
  const exportToCSV = (applications: JobApplication[]) => {
    const flat = applications.map((app) => ({
      Company:        app.company,
      Role:           app.role,
      Status:         app.status,
      Priority:       app.priority,
      'Applied Date': app.applied_date ?? '',
      Deadline:       app.deadline ?? '',
      'Job URL':      app.job_url ?? '',
      'Salary Min':   app.salary_min ?? '',
      'Salary Max':   app.salary_max ?? '',
      Notes:          app.notes,
    }));

    const csv  = Papa.unparse(flat);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `job-applications-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return { exportToCSV };
}