import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PnlView, ListView } from './ReportViews';
import { api } from '@/lib/api-client';
import { Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
interface ReportContainerProps {
  type: string;
  dateRange: { from: string; to: string };
}
export function ReportContainer({ type, dateRange }: ReportContainerProps) {
  const fromTs = new Date(dateRange.from).getTime();
  const toTs = new Date(dateRange.to).getTime();
  const { data: reportData, isLoading, error } = useQuery<any>({
    queryKey: ['report-api', type, dateRange],
    queryFn: () => api<any>(`/api/reports?type=${type}&from=${fromTs}&to=${toTs}`),
  });
  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4 bg-card rounded-3xl border border-dashed">
        <Loader2 className="size-12 text-pharmav-primary animate-spin" />
        <p className="font-bold text-muted-foreground">جاري استخراج البيانات المالية...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4 bg-red-50 rounded-3xl border border-red-200 text-red-600">
        <AlertCircle className="size-12" />
        <p className="font-bold">حدث خطأ أثناء تحميل التقرير</p>
      </div>
    );
  }
  const items = reportData?.items || [];
  switch (type) {
    case 'pnl':
      return <PnlView data={reportData} />;
    case 'sales':
      return <ListView items={items} columns={[
        { key: 'id', label: 'رقم الفاتورة', format: (v) => <span className="font-mono text-xs">#{v.slice(0,8)}</span> },
        { key: 'timestamp', label: 'التاريخ', format: (v) => format(new Date(v), 'dd/MM/yyyy HH:mm', { locale: ar }) },
        { key: 'paymentMethod', label: 'طريقة الدفع' },
        { key: 'totalAmount', label: 'المبلغ الإجمالي', format: (v) => <span className="font-bold">{v.toLocaleString()} ر.س</span> }
      ]} />;
    case 'purchases':
      return <ListView items={items} columns={[
        { key: 'invoiceNumber', label: 'رقم الفاتورة' },
        { key: 'timestamp', label: 'تاريخ التوريد', format: (v) => format(new Date(v), 'dd/MM/yyyy', { locale: ar }) },
        { key: 'totalCost', label: 'إجمالي التكلفة', format: (v) => <span className="font-bold">{v.toLocaleString()} ر.س</span> }
      ]} />;
    case 'expiry':
      return <ListView items={items} columns={[
        { key: 'name', label: 'اسم الدواء' },
        { key: 'batchNumber', label: 'رقم التشغيلة' },
        { key: 'expiryDate', label: 'تاريخ الانتهاء', format: (v) => <span className="text-red-600 font-bold">{v}</span> },
        { key: 'stockQuantity', label: 'الكمية المتوفرة' }
      ]} />;
    case 'cust-bal':
      return <ListView items={items} columns={[
        { key: 'name', label: 'العميل' },
        { key: 'phone', label: 'الهاتف' },
        { key: 'currentBalance', label: 'الرصيد المدين', format: (v) => <span className="text-red-600 font-bold">{v.toLocaleString()} ر.س</span> }
      ]} />;
    default:
      return <div className="p-20 text-center text-muted-foreground italic">لا تتوفر معاينة لهذا النوع من التقارير حالياً.</div>;
  }
}