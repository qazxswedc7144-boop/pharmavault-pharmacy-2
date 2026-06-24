import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Twitter, Github, Linkedin, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export function Footer() {
  return (
    <footer className="bg-background border-t pt-20 pb-10" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8">
          <div className="space-y-6 text-right">
            <Link to="/" className="flex items-center gap-3 justify-end group">
              <div className="p-2 rounded-xl bg-pharmav-primary/10 group-hover:bg-pharmav-primary transition-colors">
                <Pill className="h-6 w-6 text-pharmav-primary group-hover:text-white" />
              </div>
              <span className="text-2xl font-display font-bold tracking-tight">فارما<span className="text-pharmav-primary">فولت</span></span>
            </Link>
            <p className="text-base text-muted-foreground leading-relaxed text-pretty">
              نحن نمكّن الصيدليات الحديثة من خلال حلول آمنة، فعالة، وبديهية لإدارة المخزون والمحاسبة المالية.
            </p>
            <div className="flex gap-4 justify-end">
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-pharmav-primary cursor-pointer transition-colors" />
              <Github className="h-5 w-5 text-muted-foreground hover:text-pharmav-primary cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 text-muted-foreground hover:text-pharmav-primary cursor-pointer transition-colors" />
            </div>
          </div>
          <div className="text-right">
            <h3 className="font-display font-bold text-lg mb-8">المنتج</h3>
            <ul className="space-y-4 text-muted-foreground">
              <li><Link to="/inventory" className="hover:text-pharmav-primary transition-colors flex items-center justify-end gap-2 group">تتبع المخزون <ArrowLeft className="size-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" /></Link></li>
              <li><Link to="/reports" className="hover:text-pharmav-primary transition-colors flex items-center justify-end gap-2 group">التقارير المالية <ArrowLeft className="size-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" /></Link></li>
              <li><Link to="/pricing" className="hover:text-pharmav-primary transition-colors flex items-center justify-end gap-2 group">خطط الأسعار <ArrowLeft className="size-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" /></Link></li>
              <li><Link to="/dashboard" className="hover:text-pharmav-primary transition-colors flex items-center justify-end gap-2 group">لوحة التحكم <ArrowLeft className="size-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" /></Link></li>
            </ul>
          </div>
          <div className="text-right">
            <h3 className="font-display font-bold text-lg mb-8">الشركة</h3>
            <ul className="space-y-4 text-muted-foreground">
              <li><Link to="#" className="hover:text-pharmav-primary transition-colors">من نحن</Link></li>
              <li><Link to="#" className="hover:text-pharmav-primary transition-colors">تواصل معنا</Link></li>
              <li><Link to="#" className="hover:text-pharmav-primary transition-colors">شروط الخدمة</Link></li>
              <li><Link to="#" className="hover:text-pharmav-primary transition-colors">سياسة الخصوصية</Link></li>
            </ul>
          </div>
          <div className="space-y-6 text-right">
            <h3 className="font-display font-bold text-lg mb-8">ابقَ على اطلاع</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              اشترك في نشرتنا البريدية للحصول على آخر التحديثات ونصائح إدارة الصيدليات.
            </p>
            <div className="flex gap-2 flex-row-reverse">
              <Input placeholder="البريد الإلكتروني" className="bg-muted border-none h-11 text-right" />
              <Button size="icon" className="shrink-0 bg-pharmav-primary h-11 w-11 shadow-neon-blue">
                <Mail className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} فارمافولت للأنظمة التقنية. صُنع بعناية لخدمة قطاع الرعاية الصحية الحديث.</p>
        </div>
      </div>
    </footer>
  );
}