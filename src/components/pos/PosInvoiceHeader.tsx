import React from 'react';
import { Camera, Calendar, User, Hash, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Autocomplete } from '@/components/ui/autocomplete';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Customer } from '@shared/types';
import { cn } from '@/lib/utils';
interface PosInvoiceHeaderProps {
  selectedCustomerId?: string;
  onCustomerChange: (id: string) => void;
  isReturn?: boolean;
}
export function PosInvoiceHeader({ selectedCustomerId, onCustomerChange, isReturn = false }: PosInvoiceHeaderProps) {
  const { data: customersData, isLoading } = useQuery<{ items: Customer[] }>({
    queryKey: ['customers'],
    queryFn: () => api<{ items: Customer[] }>('/api/customers')
  });
  const customerOptions = (customersData?.items || []).map(c => ({
    label: `${c.name} (${c.phone})`,
    value: c.id
  }));
  const today = new Date().toISOString().split('T')[0];
  return (
    <div className={cn(
      "grid grid-cols-10 gap-4 mb-4 p-4 rounded-3xl border bg-card/50 shadow-sm transition-colors duration-500",
      isReturn ? "border-rose-500/20 bg-rose-50/30" : "border-border"
    )}>
      {/* 30% Column: Customer Search */}
      <div className="col-span-10 lg:col-span-3 space-y-2">
        <Label className="text-xs font-bold text-muted-foreground mr-1 flex items-center gap-2 flex-row-reverse">
          <User className="size-3" /> العميل المختار
        </Label>
        <Autocomplete
          options={customerOptions}
          value={selectedCustomerId}
          onValueChange={onCustomerChange}
          placeholder="ابحث عن عميل..."
          isLoading={isLoading}
          className="h-12"
        />
      </div>
      {/* 70% Column: Meta Data */}
      <div className="col-span-10 lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground mr-1 flex items-center gap-2 flex-row-reverse">
            <Hash className="size-3" /> رقم الفاتورة
          </Label>
          <Input 
            readOnly 
            value={`INV-${Date.now().toString().slice(-6)}`} 
            className="h-12 bg-muted/50 font-mono text-center border-none" 
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground mr-1 flex items-center gap-2 flex-row-reverse">
            <Calendar className="size-3" /> تاريخ اليوم
          </Label>
          <Input 
            type="date" 
            defaultValue={today} 
            className="h-12 text-center bg-muted/50 border-none" 
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground mr-1 flex items-center gap-2 flex-row-reverse">
            <FileText className="size-3" /> ملاحظات البيع
          </Label>
          <div className="relative">
            <Input 
              placeholder="أضف ملاحظات..." 
              className="h-12 pr-4 pl-12 text-right bg-muted/50 border-none" 
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="absolute left-1 top-1/2 -translate-y-1/2 size-10 text-muted-foreground hover:text-pharmav-primary"
            >
              <Camera className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}