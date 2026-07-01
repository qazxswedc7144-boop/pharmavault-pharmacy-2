import React, { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { ReportSidebar } from '@/components/reports/ReportSidebar';
import { ReportDateFilter } from '@/components/reports/ReportDateFilter';
import { ReportContainer } from '@/components/reports/ReportContainer';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { FileText, Printer, FileDown, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
export type ReportType = 'pnl' | 'sales' | 'purchases' | 'cust-bal' | 'sup-bal' | 'top-selling' | 'slow-moving' | 'cash' | 'expiry' | 'comparison';
export function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);
  const queryClient = useQueryClient();
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
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
  const { isFetching } = useQuery({
    queryKey: ['report-data', activeReport, dateRange],
    queryFn: async () => {
      setLastRefreshed(new Date());
      // In a real app, this would be a specialized aggregator API
      return { success: true };
    },
    staleTime: 0,
    refetchInterval: 2000 // Real-time intelligence: poll every 2 seconds
  });
  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['report-data'] });
    toast.success('تم تحديث بيانات التقرير بنجاح');
  };
  const handlePdfExport = useCallback(async () => {
    const element = document.getElementById('report-print-area');
    if (!element) return;
    setIsExporting(true);
    const opt = {
      margin: 10,
      filename: `PharmaVault_${activeReport}_${dateRange.from}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    try {
      await html2pdf().set(opt).from(element).save();
      toast.success('تم تصدير التقرير بنجاح بصيغة PDF');
    } catch (err) {
      toast.error('حدث خطأ أثناء تصدير PDF');
    } finally {
      setIsExporting(false);
    }
  }, [activeReport, dateRange.from]);
  const handleExcelExport = useCallback(() => {
    const table = document.querySelector('#report-print-area table');
    if (!table) {
      toast.error('لا توجد بيانات جدولية لتصديرها لهذا التقرير');
      return;
    }
    setIsExporting(true);
    try {
      const wb = XLSX.utils.table_to_book(table as HTMLTableElement);
      XLSX.writeFile(wb, `PharmaVault_${activeReport}_${dateRange.from}.xlsx`);
      toast.success('تم تصدير ملف Excel بنجاح');
    } catch (e) {
      toast.error('فشل تصدير Excel');
    } finally {
      setIsExporting(false);
    }
  }, [activeReport, dateRange.from]);
  return (
    <AppLayout container>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="py-8 md:py-10 lg:py-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
            <div className="text-right space-y-2">
              <h1 className="text-4xl font-display font-bold text-pharmav-primary">
                {reportTitles[activeReport]}
              </h1>
              <div className="flex items-center gap-2 justify-end text-muted-foreground text-sm font-bold">
                <Clock className="size-3" />
                آخر تحديث: {format(lastRefreshed, 'HH:mm:ss', { locale: ar })}
              </div>
            </div>
            <div className="flex gap-3 no-print">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isFetching}
                className="h-12 px-4 border-2 font-bold"
              >
                <RefreshCw className={cn("size-5", isFetching ? "animate-spin" : "")} />
                <span className="mr-2">تحديث</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 px-6 gap-2 border-2 font-bold shadow-sm">
                    <FileDown className="size-4" /> تصدير التقرير
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-right">
                  <DropdownMenuItem onClick={handlePdfExport} className="flex-row-reverse gap-2 cursor-pointer">
                    <FileText className="size-4 text-rose-500" /> تصدير PDF احترافي
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExcelExport} className="flex-row-reverse gap-2 cursor-pointer">
                    <FileText className="size-4 text-green-600" /> تصدير Excel للبيانات
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={() => window.print()} className="h-12 px-4 border-2">
                <Printer className="size-5" />
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
              <div id="report-print-area">
                <ReportContainer type={activeReport} dateRange={dateRange} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <LoadingOverlay show={isExporting} message="جاري معالجة طلب التصدير وتجهيز الملف..." />
    </AppLayout>
  );
}