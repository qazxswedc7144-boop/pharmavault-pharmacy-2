import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PricingCard } from '@/components/ui/pricing-card';
export function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-24 md:py-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h1 className="text-5xl font-display font-bold mb-6">Plans that scale with your <span className="text-gradient-pharmav">Pharmacy</span></h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Transparent pricing designed to empower pharmacies of all sizes. No hidden fees, just pure efficiency.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <PricingCard 
              title="Basic" 
              price="$49" 
              description="Ideal for single-counter pharmacies just getting started."
              features={[
                "Up to 500 Inventory Items",
                "Basic Sales Tracking",
                "Daily Profit Summary",
                "Single User License",
                "Community Support"
              ]}
            />
            <PricingCard 
              title="Professional" 
              price="$99" 
              description="The standard choice for busy independent pharmacies."
              features={[
                "Unlimited Inventory Items",
                "Advanced Financial Reports",
                "Automated Expiry Alerts",
                "Batch Management",
                "Up to 5 User Licenses",
                "Priority Email Support"
              ]}
              featured
            />
            <PricingCard 
              title="Enterprise" 
              price="Custom" 
              description="Advanced features for multi-branch pharmacy networks."
              features={[
                "Multi-location Syncing",
                "API for Integration",
                "Custom Data Exports",
                "Dedicated Account Manager",
                "Unlimited Users",
                "24/7 Telephone Support"
              ]}
            />
          </div>
          <div className="mt-32 p-12 rounded-3xl bg-pharmav-primary/5 border border-pharmav-primary/20 text-center">
            <h2 className="text-2xl font-bold mb-4">Need a custom solution for a hospital chain?</h2>
            <p className="text-muted-foreground mb-8">We offer specialized deployment and white-glove onboarding for large organizations.</p>
            <button className="px-8 py-3 rounded-full bg-pharmav-primary text-white font-semibold hover:bg-pharmav-primary/90 transition-colors">
              Talk to Sales
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}