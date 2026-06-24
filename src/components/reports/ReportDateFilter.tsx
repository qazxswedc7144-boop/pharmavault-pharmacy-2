import React from 'react';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
interface ReportDateFilterProps {
  value: { from: string; to: string };
  onChange: (range: { from: string; to: string }) => void;
}
export function ReportDateFilter({ value, onChange }: ReportDateFilterProps) {
  const presets = [
    { label: 'اليوم', days: 0 },
    { label: 'آخر 7 أيام', days: 7 },
    { label: 'آخر 30 يوم', days: 30 },
    { label: 'هذا الشهر', type: 'month' },
    { label: 'العام الحالي', type: 'year' },
  ];
  const handlePreset = (preset: any) => {
    const end = new Date();
    const start = new Date();
    if (preset.days !== undefined) {
      start.setDate(end.getDate() - preset.days);
    } else if (preset.type === 'month') {
      start.setDate(1);
    } else if (preset.type === 'year') {
      start.setMonth(0, 1);
    }
    onChange({
      from: start.toISOString().split('T')[0],
      to: end.toISOString().split('T')[0]
    });
  };
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-card p-4 rounded-3xl border shadow-sm flex-row-reverse">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide flex-row-reverse">
        <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">
          <Filter className="size-4" />
        </div>
        {presets.map((p, i) => (
          <Button
            key={i}
            variant="ghost"
            size="sm"
            onClick={() => handlePreset(p)}
            className="rounded-full whitespace-nowrap px-4 font-bold text-xs hover:bg-pharmav-primary/10 hover:text-pharmav-primary"
          >
            {p.label}
          </Button>
        ))}
      </div>
      <div className="h-8 w-px bg-border hidden md:block mx-2" />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full md:w-[300px] h-12 justify-between flex-row-reverse text-right font-bold border-2 rounded-2xl"
          >
            <CalendarIcon className="size-4 opacity-50" />
            <div className="flex gap-2 items-center flex-row-reverse">
              <span>{format(new Date(value.from), 'dd MMM', { locale: ar })}</span>
              <span className="text-muted-foreground opacity-50">-</span>
              <span>{format(new Date(value.to), 'dd MMM yyyy', { locale: ar })}</span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{ from: new Date(value.from), to: new Date(value.to) }}
            onSelect={(range: any) => {
              if (range?.from && range?.to) {
                onChange({
                  from: range.from.toISOString().split('T')[0],
                  to: range.to.toISOString().split('T')[0]
                });
              }
            }}
            numberOfMonths={2}
            locale={ar}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}