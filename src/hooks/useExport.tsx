import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { JobApplication } from '@/types';

export function useExport() {
  const exportToExcel = async (applications: JobApplication[]) => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Applications');

    // Define columns
    ws.columns = [
      { header: 'Company', key: 'Company', width: 20 },
      { header: 'Role', key: 'Role', width: 20 },
      { header: 'Status', key: 'Status', width: 15 },
      { header: 'Priority', key: 'Priority', width: 15 },
      { header: 'Applied Date', key: 'Applied Date', width: 15 },
      { header: 'Deadline', key: 'Deadline', width: 15 },
      { header: 'Job URL', key: 'Job URL', width: 30 },
      { header: 'Location', key: 'Location', width: 20 },
      { header: 'Work Type', key: 'Work Type', width: 15 },
      { header: 'Employment Type', key: 'Employment Type', width: 15 },
      { header: 'Salary Min', key: 'Salary Min', width: 15 },
      { header: 'Salary Max', key: 'Salary Max', width: 15 },
      { header: 'Currency', key: 'Currency', width: 10 },
      { header: 'Notes', key: 'Notes', width: 40 },
    ];

    // Add rows
    applications.forEach((app) => {
      ws.addRow({
        Company:           app.company,
        Role:              app.role,
        Status:            app.status,
        Priority:          app.priority,
        'Applied Date':    app.applied_date ?? '',
        Deadline:          app.deadline ?? '',
        'Job URL':         app.job_url ?? '',
        Location:          app.location ?? '',
        'Work Type':       app.work_type ?? '',
        'Employment Type': app.employment_type ?? '',
        'Salary Min':      app.salary_min ?? '',
        'Salary Max':      app.salary_max ?? '',
        Currency:          app.salary_currency ?? '',
        Notes:             app.notes ?? '',
      });
    });

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `job-applications-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const downloadTemplate = async () => {
    const wb = new ExcelJS.Workbook();

    // Template Sheet
    const wsSample = wb.addWorksheet('Template');
    wsSample.columns = [
      { header: 'Company', key: 'Company', width: 20 },
      { header: 'Role', key: 'Role', width: 20 },
      { header: 'Status', key: 'Status', width: 15 },
      { header: 'Priority', key: 'Priority', width: 15 },
      { header: 'Applied Date', key: 'Applied Date', width: 15 },
      { header: 'Deadline', key: 'Deadline', width: 15 },
      { header: 'Job URL', key: 'Job URL', width: 30 },
      { header: 'Location', key: 'Location', width: 20 },
      { header: 'Work Type', key: 'Work Type', width: 15 },
      { header: 'Employment Type', key: 'Employment Type', width: 15 },
      { header: 'Salary Min', key: 'Salary Min', width: 15 },
      { header: 'Salary Max', key: 'Salary Max', width: 15 },
      { header: 'Currency', key: 'Currency', width: 10 },
      { header: 'Notes', key: 'Notes', width: 40 },
    ];
    wsSample.addRow({
      Company:           'Acme Corp',
      Role:              'Frontend Engineer',
      Status:            'applied',
      Priority:          'high',
      'Applied Date':    '2025-01-15',
      Deadline:          '2025-02-01',
      'Job URL':         'https://acme.com/careers/123',
      Location:          'New York, NY',
      'Work Type':       'remote',
      'Employment Type': 'full_time',
      'Salary Min':      80000,
      'Salary Max':      120000,
      Currency:          'USD',
      Notes:             'Referral from John. Strong React focus.',
    });

    // Guide Sheet
    const wsGuide = wb.addWorksheet('Column Guide');
    wsGuide.columns = [
      { header: 'Column', key: 'Column', width: 20 },
      { header: 'Required', key: 'Required', width: 10 },
      { header: 'Valid Values', key: 'Valid Values', width: 55 },
    ];
    
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
    
    guide.forEach(g => wsGuide.addRow(g));

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), 'hiresight-import-template.xlsx');
  };

  return { exportToExcel, downloadTemplate };
}
