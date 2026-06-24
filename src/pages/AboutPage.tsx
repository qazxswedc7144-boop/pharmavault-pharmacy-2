import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Code2, Phone, Mail, Award, Zap, Globe, Heart } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
export function AboutPage() {
  return (
    <AppLayout container>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12" dir="rtl">
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pharmav-primary/10 text-pharmav-primary text-sm font-bold mb-4"
          >
            <ShieldCheck className="size-4" />
            <span>نظام موثق ومعتمد v2.5.0</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight">حول نظام <span className="text-pharmav-primary">فارمافولت</span></h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            الحل التقني الأمثل لإدارة الصيدليات الحديثة بذكاء واحترافية.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-8 order-2 lg:order-1">
            <h2 className="text-3xl font-display font-bold text-right border-r-4 border-pharmav-primary pr-4">رؤيتنا</h2>
            <p className="text-lg text-muted-foreground leading-loose text-right">
              نسعى في فارمافولت لتمكين مقدمي الرعاية الصحية من خلال أدوات تقنية متطورة تربط بين إدارة المخزون والمحاسبة المالية بشكل آلي، مما يقلل من الأخطاء البشرية ويزيد من كفاءة العمل اليومي. نظامنا مصمم ليعمل حتى في أسوأ ظروف الاتصال بالإنترنت، مع ضمان أمان وخصوصية البيانات الطبية والمالية.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-muted/50 border space-y-2">
                <Zap className="size-6 text-orange-500 mb-2" />
                <h4 className="font-bold">أداء فائق</h4>
                <p className="text-xs text-muted-foreground">سرعة في معالجة العمليات والتقارير.</p>
              </div>
              <div className="p-6 rounded-3xl bg-muted/50 border space-y-2">
                <Globe className="size-6 text-blue-500 mb-2" />
                <h4 className="font-bold">سحابي بالكامل</h4>
                <p className="text-xs text-muted-foreground">مزامنة فورية ونسخ احتياطي تلقائي.</p>
              </div>
            </div>
          </div>
          <div className="relative order-1 lg:order-2">
            <div className="absolute inset-0 bg-pharmav-primary/20 blur-[100px] rounded-full animate-pulse" />
            <Card className="relative glass-card border-2 border-pharmav-primary/20 rounded-[3rem] overflow-hidden">
              <CardContent className="p-12 text-center space-y-8">
                <div className="size-24 rounded-3xl bg-pharmav-primary text-white flex items-center justify-center mx-auto shadow-neon-blue rotate-3">
                  <Code2 className="size-12" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-display font-bold">المطور والمهندس</h3>
                  <p className="text-2xl text-pharmav-primary font-bold">د/ عبدالله طاهر مفرح</p>
                </div>
                <div className="flex flex-col gap-4 max-w-xs mx-auto">
                  <Badge variant="outline" className="h-12 justify-center gap-2 text-lg border-2">
                    <Phone className="size-5" /> 772093714
                  </Badge>
                  <Badge variant="outline" className="h-12 justify-center gap-2 text-lg border-2">
                    <Mail className="size-5" /> info@pharmavault.com
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground pt-4">
                  تم تطوير هذا النظام بأحدث التقنيات العالمية (React + Cloudflare Workers) لضمان الاستدامة والأمان العالي.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="text-center py-20 border-t">
          <Heart className="size-8 text-rose-500 mx-auto mb-4 animate-bounce" />
          <p className="text-muted-foreground font-bold">صُنع بعناية لخدمة المجتمع الطبي العربي • 2026</p>
        </div>
      </div>
    </AppLayout>
  );
}