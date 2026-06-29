import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ReportSidebar } from '@/components/reports/ReportSidebar';
import { ReportDateFilter } from '@/components/reports/ReportDateFilter';
import { ReportContainer } from '@/components/reports/ReportContainer';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { FileText, Printer, FileDown, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
export type ReportType = 'pnl' | 'sales' | 'purchases' | 'cust-bal' | 'sup-bal' | 'top-selling' | 'slow-moving' | 'cash' | 'expiry' | 'comparison';
export function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);
  const activeReport = (searchParams.get('type') as ReportType) || 'pnl';
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const reportTitles: Record<ReportType, string> = {
    'pnl': 'تقرير الأرباح والخسائر',
    'sales': 'تقرير المبيعات التفصيلي',
    'purchases': 'تقرير المشتريات والموردين',
    'cust-bal': 'أرصدة العملاء والذمم',
    'sup-bal': 'أرصدة الموردين والمدفوعات',
    'top-selling': 'الأصناف الأكثر مبيعاً',
    'slow-moving': 'الأصناف الراكدة',
    'cash': 'حركة الصندوق اليومية',
    'expiry': 'تنبيهات انتهاء الصلاحية',
    'comparison': 'مقارنة الفترات المالية'
  };
  const handlePdfExport = async () => {
    const element = document.getElementById('report-print-area');
    if (!element) return;
    setIsExporting(true);
    const opt = {
      margin: 10,
      filename: `PharmaVault_Report_${activeReport}_${dateRange.from}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    try {
      await toast.promise(html2pdf().set(opt).from(element).save(), {
        loading: 'جاري توليد ملف PDF عالي الجودة...',
        success: 'تم تصدير التقرير بنجاح',
        error: 'فشل تصدير PDF'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };
  const handleExcelExport = () => {
    const table = document.querySelector('#report-print-area table');
    if (!table) {
      toast.error('لا توجد بيانات جدولية لتصديرها لهذا التقرير');
      return;
    }
    setIsExporting(true);
    try {
      const wb = XLSX.utils.table_to_book(table as HTMLTableElement);
      XLSX.writeFile(wb, `PharmaVault_Data_${activeReport}_${dateRange.from}.xlsx`);
      toast.success('تم تصدير ملف Excel بنجاح');
    } catch (e) {
      toast.error('فشل تصدير Excel');
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };
  return (
    <AppLayout container>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="py-8 md:py-10 lg:py-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
            <div className="text-right space-y-2">
              <h1 className="text-4xl font-display font-bold text-pharmav-primary">
                {reportTitles[activeReport]}
              </h1>
              <p className="text-muted-foreground text-lg">
                تحليل دقيق للبيانات المالية والتشغيلية للفترة المحددة.
              </p>
            </div>
            <div className="flex gap-3 no-print">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 px-6 gap-2 border-2 font-bold">
                    <FileDown className="size-4" /> تصدير التقرير
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-right">
                  <DropdownMenuItem onClick={handlePdfExport} className="flex-row-reverse gap-2">
                    <FileText className="size-4 text-rose-500" /> تصدير PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExcelExport} className="flex-row-reverse gap-2">
                    <FileText className="size-4 text-green-600" /> تصدير Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={() => window.print()} className="h-12 px-4 border-2">
                <Printer className="size-5" />
              </Button>
              <Button variant="ghost" className="h-12 px-4 border-2">
                <Share2 className="size-5" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-3 order-2 lg:order-2 no-print">
              <ReportSidebar active={activeReport} onSelect={(type) => setSearchParams({ type })} />
            </div>
            <div className="lg:col-span-9 order-1 lg:order-1 space-y-6">
              <div className="no-print">
                <ReportDateFilter value={dateRange} onChange={setDateRange} />
              </div>
              <ReportContainer type={activeReport} dateRange={dateRange} />
            </div>
          </div>
        </div>
      </div>
      <LoadingOverlay show={isExporting} message="جاري معالجة طلب التصدير..." />
    </AppLayout>
  );
}