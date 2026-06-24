import React, { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { ReportSidebar } from '@/components/reports/ReportSidebar';
import { ReportDateFilter } from '@/components/reports/ReportDateFilter';
import { ReportContainer } from '@/components/reports/ReportContainer';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { FileText, Printer, FileDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
export type ReportType = 'pnl' | 'sales' | 'purchases' | 'cust-bal' | 'sup-bal' | 'top-selling' | 'slow-moving' | 'cash' | 'expiry' | 'comparison';
export function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);
  const queryClient = useQueryClient();
  const activeReport = (searchParams.get('type') as ReportType) || 'pnl';
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['report-api'] });
    toast.success('تم تحديث بيانات التقرير');
  };
  const handlePdfExport = useCallback(async () => {
    const element = document.getElementById('report-print-area');
    if (!element) return;
    setIsExporting(true);
    try {
      await html2pdf().set({ margin: 10, filename: `PharmaVault_${activeReport}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(element).save();
      toast.success('تم تصدير PDF');
    } catch (err) {
      toast.error('فشل تصدير PDF');
    } finally { setIsExporting(false); }
  }, [activeReport]);
  const handleExcelExport = useCallback(() => {
    const table = document.querySelector('#report-print-area table');
    if (!table) return toast.error('لا توجد بيانات جدولية');
    setIsExporting(true);
    try {
      XLSX.writeFile(XLSX.utils.table_to_book(table as HTMLTableElement), `PharmaVault_${activeReport}.xlsx`);
      toast.success('تم تصدير Excel');
    } catch (e) { toast.error('فشل تصدير Excel'); } finally { setIsExporting(false); }
  }, [activeReport]);
  return (
    <AppLayout container>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="py-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b pb-8">
            <h1 className="text-4xl font-display font-bold text-pharmav-primary">التقارير المالية</h1>
            <div className="flex gap-3 no-print">
              <Button variant="outline" onClick={handleRefresh} className="h-12 px-4 border-2"><RefreshCw className="size-5" /></Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline" className="h-12 px-6 border-2 font-bold"><FileDown className="size-4" /> تصدير</Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-right">
                  <DropdownMenuItem onClick={handlePdfExport} className="flex-row-reverse gap-2">PDF احترافي</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExcelExport} className="flex-row-reverse gap-2">ملف Excel</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={() => window.print()} className="h-12 px-4 border-2"><Printer className="size-5" /></Button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-3 order-2 lg:order-2 no-print"><ReportSidebar active={activeReport} onSelect={(type) => setSearchParams({ type })} /></div>
            <div className="lg:col-span-9 order-1 lg:order-1 space-y-6">
              <div className="no-print"><ReportDateFilter value={dateRange} onChange={setDateRange} /></div>
              <div id="report-print-area" className="bg-white rounded-3xl p-6 border print:border-none print:p-0"><ReportContainer type={activeReport} dateRange={dateRange} /></div>
            </div>
          </div>
        </div>
      </div>
      <LoadingOverlay show={isExporting} />
    </AppLayout>
  );
}