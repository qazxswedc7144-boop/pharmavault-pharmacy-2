import React from 'react';
import { motion } from 'framer-motion';
import { 
  Pill, 
  ShieldCheck, 
  BarChart3, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  LayoutDashboard,
  Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { PricingCard } from '@/components/ui/pricing-card';
export function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 md:py-36 bg-gradient-hero">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pharmav-primary/10 text-pharmav-primary text-sm font-medium mb-8"
            >
              <Zap className="h-4 w-4" />
              <span>Version 2.0 is now live</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-balance leading-tight tracking-tight mb-8"
            >
              The vault for your <span className="text-gradient-pharmav">Pharmacy's</span> success.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 text-pretty"
            >
              Comprehensive inventory management, smart accounting, and deep analytics. Everything you need to run a modern pharmacy in one secure place.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Button size="lg" asChild className="rounded-full h-14 px-8 text-lg font-semibold bg-pharmav-primary hover:bg-pharmav-primary/90 shadow-neon-blue">
                <Link to="/dashboard" className="flex items-center gap-2">
                  Launch App <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full h-14 px-8 text-lg font-semibold border-2">
                <Link to="/pricing">View Plans</Link>
              </Button>
            </motion.div>
          </div>
        </section>
        {/* Features Grid */}
        <section className="py-24 bg-background border-y border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for efficiency</h2>
              <p className="text-muted-foreground">Every tool you need to streamline operations and increase profitability.</p>
            </div>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                { 
                  icon: <Package className="h-8 w-8 text-pharmav-primary" />,
                  title: "Inventory Control", 
                  desc: "Automatic stock tracking, batch management, and expiry alerts to minimize waste."
                },
                { 
                  icon: <BarChart3 className="h-8 w-8 text-green-500" />,
                  title: "Smart Accounting", 
                  desc: "Real-time sales tracking, profit/loss statements, and tax-ready financial reports."
                },
                { 
                  icon: <ShieldCheck className="h-8 w-8 text-blue-500" />,
                  title: "Secure & Compliant", 
                  desc: "Enterprise-grade security ensuring all your medical and financial data is protected."
                }
              ].map((feat, idx) => (
                <motion.div 
                  key={idx}
                  variants={itemVariants}
                  className="p-8 rounded-3xl bg-muted/50 border border-border/60 hover:border-pharmav-primary/40 transition-colors"
                >
                  <div className="mb-6">{feat.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        {/* Mock Pricing Preview */}
        <section className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
              <p className="text-muted-foreground">Choose the plan that fits your pharmacy's scale.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <PricingCard 
                title="Starter" 
                price="$49" 
                description="Perfect for small, independent pharmacies."
                features={["Up to 500 products", "Basic reporting", "1 user account"]}
              />
              <PricingCard 
                title="Professional" 
                price="$99" 
                description="Optimized for growing pharmacies with high volume."
                features={["Unlimited products", "Advanced analytics", "5 user accounts", "Expiry alerts"]}
                featured
              />
              <PricingCard 
                title="Enterprise" 
                price="Custom" 
                description="Full solution for pharmacy chains and hospitals."
                features={["Multi-location support", "API Access", "Unlimited users", "24/7 Priority support"]}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}