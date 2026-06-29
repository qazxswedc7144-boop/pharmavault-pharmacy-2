import React from 'react';
import { Check } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
}
export function PricingCard({
  title,
  price,
  description,
  features,
  featured = false
}: PricingCardProps) {
  const isCustom = price === 'اتصل بنا' || price === 'Custom';
  return (
    <Card 
      dir="rtl"
      className={cn(
        "relative overflow-hidden transition-all duration-500 hover:shadow-2xl flex flex-col h-full rounded-[2rem]",
        featured
          ? "border-pharmav-primary shadow-neon-blue border-2 z-10 bg-card transform md:-translate-y-4"
          : "border-border bg-card/50"
      )}
    >
      {featured && (
        <div className="absolute top-0 left-0 px-6 py-2 bg-pharmav-primary text-white text-xs font-bold uppercase tracking-widest rounded-br-3xl">
          الأكثر شيوعاً
        </div>
      )}
      <CardHeader className="p-8 text-right">
        <CardTitle className="text-2xl font-display font-bold mb-2">{title}</CardTitle>
        <div className="mt-4 flex items-baseline gap-2 flex-row">
          <span className="text-5xl font-display font-bold tracking-tight text-pharmav-primary">{price}</span>
          {!isCustom && <span className="text-muted-foreground text-sm font-medium">/ شهرياً</span>}
        </div>
        <CardDescription className="mt-6 text-base leading-relaxed text-pretty text-right">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-0 flex-grow text-right">
        <div className="space-y-5">
          {features.map((feature, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="mt-1 p-0.5 rounded-full bg-pharmav-secondary/10 text-pharmav-secondary shrink-0">
                <Check className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium leading-tight text-right">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-8 pt-0">
        <Button
          className={cn(
            "w-full rounded-2xl h-14 text-lg font-bold transition-all duration-300",
            featured
              ? "bg-pharmav-primary hover:bg-pharmav-primary/90 text-white shadow-lg shadow-pharmav-primary/20"
              : "variant-outline border-2 hover:bg-muted hover:border-pharmav-primary/40"
          )}
        >
          {isCustom ? 'تواصل معنا الآن' : 'ابدأ التجربة الآن'}
        </Button>
      </CardFooter>
    </Card>
  );
}