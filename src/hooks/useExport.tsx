import * as XLSX from 'xlsx';
import type { JobApplication } from '@/types';

const COLUMNS = [
  { key: 'Company',           get: (a: JobApplication) => a.company },
  { key: 'Role',              get: (a: JobApplication) => a.role },
  { key: 'Status',            get: (a: JobApplication) => a.status },
  { key: 'Priority',          get: (a: JobApplication) => a.priority },
  { key: 'Applied Date',      get: (a: JobApplication) => a.applied_date ?? '' },
  { key: 'Deadline',          get: (a: JobApplication) => a.deadline ?? '' },
  { key: 'Job URL',           get: (a: JobApplication) => a.job_url ?? '' },
  { key: 'Location',          get: (a: JobApplication) => a.location ?? '' },
  { key: 'Work Type',         get: (a: JobApplication) => a.work_type ?? '' },
  { key: 'Employment Type',   get: (a: JobApplication) => a.employment_type ?? '' },
  { key: 'Salary Min',        get: (a: JobApplication) => a.salary_min ?? '' },
  { key: 'Salary Max',        get: (a: JobApplication) => a.salary_max ?? '' },
  { key: 'Currency',          get: (a: JobApplication) => a.salary_currency ?? '' },
  { key: 'Notes',             get: (a: JobApplication) => a.notes ?? '' },
];

function makeSheet(rows: Record<string, unknown>[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = Object.keys(rows[0] ?? {}).map((k) => ({
    wch: Math.max(k.length, ...rows.map((r) => String(r[k] ?? '').length)) + 2,
  }));
  return ws;
}

export function useExport() {
  const exportToExcel = (applications: JobApplication[]) => {
    const rows = applications.map((app) =>
      Object.fromEntries(COLUMNS.map(({ key, get }) => [key, get(app)]))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, makeSheet(rows), 'Applications');
    XLSX.writeFile(wb, `job-applications-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const downloadTemplate = () => {
    const sample = [{
      Company: 'Acme Corp', Role: 'Frontend Engineer', Status: 'applied',
      Priority: 'high', 'Applied Date': '2025-01-15', Deadline: '2025-02-01',
      'Job URL': 'https://acme.com/careers/123', Location: 'New York, NY',
      'Work Type': 'remote', 'Employment Type': 'full_time',
      'Salary Min': 80000, 'Salary Max': 120000, Currency: 'USD',
      Notes: 'Referral from John. Strong React focus.',
    }];

    const guide = [
      { Column: 'Company',         Required: 'Yes', 'Valid Values': 'Any text' },
      { Column: 'Role',            Required: 'Yes', 'Valid Values': 'Any text' },
      { Column: 'Status',          Required: 'No',  'Valid Values': 'wishlist | applied | phone_screen | interview | offer | rejected' },
      { Column: 'Priority',        Required: 'No',  'Valid Values': 'low | medium | high' },
      { Column: 'Applied Date',    Required: 'No',  'Valid Values': 'YYYY-MM-DD  e.g. 2025-01-15' },
      { Column: 'Deadline',        Required: 'No',  'Valid Values': 'YYYY-MM-DD  e.g. 2025-02-01' },
      { Column: 'Job URL',         Required: 'No',  'Valid Values': 'Full URL  e.g. https://...' },
      { Column: 'Location',        Required: 'No',  'Valid Values': 'Any text  e.g. Remote, New York' },
      { Column: 'Work Type',       Required: 'No',  'Valid Values': 'remote | onsite | hybrid' },
      { Column: 'Employment Type', Required: 'No',  'Valid Values': 'full_time | part_time | contract | internship | freelance' },
      { Column: 'Salary Min',      Required: 'No',  'Valid Values': 'Number  e.g. 80000' },
      { Column: 'Salary Max',      Required: 'No',  'Valid Values': 'Number  e.g. 120000' },
      { Column: 'Currency',        Required: 'No',  'Valid Values': 'USD | EUR | GBP | CAD | AUD' },
      { Column: 'Notes',           Required: 'No',  'Valid Values': 'Any text' },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, makeSheet(sample), 'Template');
    const wsGuide = XLSX.utils.json_to_sheet(guide);
    wsGuide['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 55 }];
    XLSX.utils.book_append_sheet(wb, wsGuide, 'Column Guide');
    XLSX.writeFile(wb, 'job-tracker-import-template.xlsx');
  };

  return { exportToExcel, downloadTemplate };
}
