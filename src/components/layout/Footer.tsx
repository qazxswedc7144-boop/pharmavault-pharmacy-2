import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Globe, Mail, ArrowLeft, Info, Users, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export function Footer() {
  return (
    <footer className="bg-background border-t pt-20 pb-10" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8">
          <div className="space-y-6 text-right flex flex-col items-start">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2 rounded-xl bg-pharmav-primary/10 group-hover:bg-pharmav-primary transition-colors">
                <Pill className="h-6 w-6 text-pharmav-primary group-hover:text-white" />
              </div>
              <span className="text-2xl font-display font-bold tracking-tight">فارما<span className="text-pharmav-primary">فولت</span></span>
            </Link>
            <p className="text-base text-muted-foreground leading-relaxed text-pretty text-right">
              نحن نمكّن الصيدليات الحديثة من خلال حلول آمنة، فعالة، وبديهية لإدارة المخزون والمحاسبة المالية.
            </p>
            <div className="flex flex-col gap-2 mt-4 text-sm font-bold text-pharmav-primary">
              <div className="flex items-center gap-2"><Phone className="size-4" /> 772093714</div>
              <div className="flex items-center gap-2"><Users className="size-4" /> د/ عبدالله طاهر مفرح</div>
            </div>
          </div>
          <div className="text-right flex flex-col items-start">
            <h3 className="font-display font-bold text-lg mb-8">المنتج</h3>
            <ul className="space-y-4 text-muted-foreground w-full">
              <li><Link to="/inventory" className="hover:text-pharmav-primary transition-colors">تتبع المخزون</Link></li>
              <li><Link to="/reports" className="hover:text-pharmav-primary transition-colors">التقارير المالية</Link></li>
              <li><Link to="/pricing" className="hover:text-pharmav-primary transition-colors">خطط الأسعار</Link></li>
              <li><Link to="/about" className="hover:text-pharmav-primary transition-colors font-bold">حول النظام</Link></li>
            </ul>
          </div>
          <div className="text-right flex flex-col items-start">
            <h3 className="font-display font-bold text-lg mb-8">المطور</h3>
            <ul className="space-y-4 text-muted-foreground w-full">
              <li className="font-bold text-foreground">د/ عبدالله طاهر مفرح</li>
              <li>تواصل مباشر: 772093714</li>
              <li>خدمات الدعم الفني 24/7</li>
              <li>تخصيص الأنظمة البرمجية</li>
            </ul>
          </div>
          <div className="space-y-6 text-right flex flex-col items-start">
            <h3 className="font-display font-bold text-lg mb-8">ابقَ على اطلاع</h3>
            <p className="text-sm text-muted-foreground leading-relaxed text-right">
              اشترك في نشرتنا البريدية للحصول على آخر التحديثات ونصائح إدارة الصيدليات.
            </p>
            <div className="flex gap-2 w-full">
              <Input placeholder="البريد الإلكتروني" className="bg-muted border-none h-11 text-right flex-1" />
              <Button size="icon" className="shrink-0 bg-pharmav-primary h-11 w-11 shadow-neon-blue">
                <Mail className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>© 2026 فارمافولت للأنظمة التقنية. تطوير م/ عبدالله طاهر مفرح (772093714).</p>
        </div>
      </div>
    </footer>
  );
}