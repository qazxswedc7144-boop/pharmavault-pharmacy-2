import React from 'react';
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/offline-store';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
export function BillingHistory() {
  const billingHistory = useAppStore(s => s.billingHistory);
  if (billingHistory.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="size-16 rounded-full bg-muted mx-auto flex items-center justify-center">
          <FileText className="size-8 opacity-20" />
        </div>
        <div>
          <h4 className="font-display font-bold">لا توجد فواتير سابقة</h4>
          <p className="text-sm text-muted-foreground">سيظهر سجل مدفوعاتك هنا فور إتمام أول عملية تجديد.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="border rounded-[2rem] overflow-hidden bg-card shadow-sm">
      <Table dir="rtl" className="text-right">
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="text-right py-4 px-6">الرقم المرجعي</TableHead>
            <TableHead className="text-right">التاريخ</TableHead>
            <TableHead className="text-right">المبلغ</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-left px-6"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {billingHistory.map((bill) => (
            <TableRow key={bill.id} className="hover:bg-muted/10">
              <TableCell className="font-mono font-bold text-xs px-6">#{bill.id}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(bill.date), 'dd MMMM yyyy', { locale: ar })}
              </TableCell>
              <TableCell className="font-bold">{bill.amount.toLocaleString()} ر.س</TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 gap-1 flex-row-reverse font-bold">
                  <CheckCircle2 className="size-3" /> مدفوع
                </Badge>
              </TableCell>
              <TableCell className="text-left px-6">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-pharmav-primary/10 hover:text-pharmav-primary">
                  <Download className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}