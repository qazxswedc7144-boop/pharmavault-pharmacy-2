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
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-xl",
      featured 
        ? "border-pharmav-primary shadow-neon-blue md:scale-105 z-10 bg-card" 
        : "border-border bg-card/50"
    )}>
      {featured && (
        <div className="absolute top-0 right-0 px-4 py-1 bg-pharmav-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-xl">
          Most Popular
        </div>
      )}
      <CardHeader className="p-8">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight">{price}</span>
          {price !== 'Custom' && <span className="text-muted-foreground text-sm">/month</span>}
        </div>
        <CardDescription className="mt-4 leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <ul className="space-y-4">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <Check className="h-5 w-5 text-pharmav-secondary shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="p-8 border-t border-border/40">
        <Button 
          className={cn(
            "w-full rounded-full h-12 font-semibold transition-all",
            featured 
              ? "bg-pharmav-primary hover:bg-pharmav-primary/90 text-white shadow-lg" 
              : "variant-outline border-2 hover:bg-muted"
          )}
        >
          {price === 'Custom' ? 'Contact Sales' : 'Get Started'}
        </Button>
      </CardFooter>
    </Card>
  );
}