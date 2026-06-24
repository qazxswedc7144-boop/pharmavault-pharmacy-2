import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Pill className="h-6 w-6 text-pharmav-primary" />
              <span className="text-xl font-display font-bold">PharmaVault</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empowering modern pharmacies with secure, efficient, and intuitive inventory management and accounting solutions.
            </p>
            <div className="flex gap-4">
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-pharmav-primary cursor-pointer transition-colors" />
              <Github className="h-5 w-5 text-muted-foreground hover:text-pharmav-primary cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 text-muted-foreground hover:text-pharmav-primary cursor-pointer transition-colors" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-6">Product</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link to="/inventory" className="hover:text-pharmav-primary transition-colors">Inventory Tracking</Link></li>
              <li><Link to="/dashboard" className="hover:text-pharmav-primary transition-colors">Financial Reports</Link></li>
              <li><Link to="/pricing" className="hover:text-pharmav-primary transition-colors">Pricing Plans</Link></li>
              <li><Link to="#" className="hover:text-pharmav-primary transition-colors">Security Features</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-6">Company</h3>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-pharmav-primary transition-colors">About Us</Link></li>
              <li><Link to="#" className="hover:text-pharmav-primary transition-colors">Contact</Link></li>
              <li><Link to="#" className="hover:text-pharmav-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="#" className="hover:text-pharmav-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold mb-6">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for the latest updates and pharmacy tips.
            </p>
            <div className="flex gap-2">
              <Input placeholder="Email address" className="bg-muted border-none" />
              <Button size="icon" className="shrink-0 bg-pharmav-primary">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PharmaVault Inc. Built with care for modern healthcare.</p>
        </div>
      </div>
    </footer>
  );
}