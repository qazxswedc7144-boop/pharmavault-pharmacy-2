import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PricingCard } from '@/components/ui/pricing-card';
export function PricingPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      <main className="py-24 md:py-36 bg-gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-8 leading-tight">خطط تناسب <span className="text-gradient-pharmav">حجم صيدليتك</span></h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto text-pretty">
              تسعير شفاف مصمم لتمكين الصيدليات بمختلف أحجامها. لا توجد رسوم خفية، فقط كفاءة مطلقة في الإدارة.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-stretch">
            <PricingCard
              title="الباقة الأساسية"
              price="49 ر.س"
              description="مثالية للصيدليات الصغيرة المستقلة في بداية مشوارها."
              features={[
                "إدارة حتى 500 صنف دواء",
                "تتبع المبيعات الأساسي",
                "ملخص الأرباح اليومي",
                "ترخيص لمستخدم واحد",
                "دعم فني عبر البريد الإلكتروني"
              ]}
            />
            <PricingCard
              title="باقة المحترفين"
              price="99 ر.س"
              description="الخيار الأمثل للصيدليات المزدحمة ذات العمليات المكثفة."
              features={[
                "عدد أصناف غير محدود",
                "تقارير مالية وتحليلية متقدمة",
                "تنبيهات انتهاء الصلاحية الآلية",
                "إدارة دفعات الأدوية (Batches)",
                "حتى 5 حسابات مستخدمين",
                "دعم فني ذو أولوية"
              ]}
              featured
            />
            <PricingCard
              title="باقة المؤسسات"
              price="اتصل بنا"
              description="حلول متكاملة لسلاسل الصيدليات الكبيرة والمستشفيات."
              features={[
                "مزامنة الفروع المتعددة",
                "واجهة برمجة التطبيقات (API)",
                "تصدير بيانات مخصص للمحاسبين",
                "مدير حساب مخصص",
                "عدد غير محدود من المستخدمين",
                "دعم فني عبر الهاتف على مدار الساعة"
              ]}
            />
          </div>
          <div className="mt-32 p-12 rounded-[2.5rem] bg-pharmav-primary/5 border border-pharmav-primary/20 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pharmav-primary/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            <h2 className="text-3xl font-display font-bold mb-6 relative z-10">هل تحتاج حلاً مخصصاً لسلسلة مستشفيات؟</h2>
            <p className="text-xl text-muted-foreground mb-10 relative z-10 max-w-2xl mx-auto">
              نقدم خدمات التثبيت في الموقع والتدريب الشامل للمؤسسات الكبيرة مع تخصيص كامل للواجهات.
            </p>
            <button className="px-10 py-4 rounded-full bg-pharmav-primary text-white font-bold text-lg hover:bg-pharmav-primary/90 transition-all shadow-neon-blue relative z-10">
              تحدث مع فريق المبيعات
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}