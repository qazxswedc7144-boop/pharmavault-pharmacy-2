import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Lock, Delete, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/offline-store';
export function PinLock({ children }: { children: React.ReactNode }) {
  const loginLockEnabled = useAppStore(s => s.loginLockEnabled);
  const correctPin = useAppStore(s => s.pin);
  const isLocked = useAppStore(s => s.isLocked);
  const setLocked = useAppStore(s => s.setLocked);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  useEffect(() => {
    if (loginLockEnabled && correctPin) {
      setLocked(true);
    } else {
      setLocked(false);
    }
  }, [loginLockEnabled, correctPin, setLocked]);
  const handleKeyPress = (num: string) => {
    if (input.length < 4) {
      const nextInput = input + num;
      setInput(nextInput);
      setError(false);
      if (nextInput.length === 4) {
        if (nextInput === correctPin) {
          setLocked(false);
          setInput('');
        } else {
          setError(true);
          setTimeout(() => {
            setInput('');
            setError(false);
          }, 500);
        }
      }
    }
  };
  const handleBackspace = () => setInput(input.slice(0, -1));
  if (!isLocked) return <>{children}</>;
  return (
    <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-2xl flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full p-8 text-center"
      >
        <div className="mb-8 flex justify-center">
          <div className="p-4 rounded-3xl bg-pharmav-primary/10 text-pharmav-primary">
            <Pill className="size-12" />
          </div>
        </div>
        <h1 className="text-3xl font-display font-bold mb-2">Pharmacy Secure</h1>
        <p className="text-muted-foreground mb-12">Enter your secure PIN to access PharmaVault</p>
        <motion.div 
          animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
          className="flex justify-center gap-4 mb-12"
        >
          {[0, 1, 2, 3].map((idx) => (
            <div 
              key={idx}
              className={`size-4 rounded-full border-2 transition-all duration-200 ${
                input.length > idx 
                  ? 'bg-pharmav-primary border-pharmav-primary scale-125' 
                  : 'border-muted-foreground/30'
              }`}
            />
          ))}
        </motion.div>
        <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key, i) => {
            if (key === '') return <div key={i} />;
            if (key === 'del') {
              return (
                <Button 
                  key={i} 
                  variant="ghost" 
                  className="size-16 rounded-full" 
                  onClick={handleBackspace}
                >
                  <Delete className="size-6" />
                </Button>
              );
            }
            return (
              <Button
                key={i}
                variant="outline"
                className="size-16 rounded-full text-2xl font-bold bg-background/50 border-border/60 hover:border-pharmav-primary/40 hover:text-pharmav-primary"
                onClick={() => handleKeyPress(key)}
              >
                {key}
              </Button>
            );
          })}
        </div>
        <div className="mt-12">
          <Button variant="link" className="text-muted-foreground text-xs" onClick={() => window.location.reload()}>
            Trouble logging in? Reload app
          </Button>
        </div>
      </motion.div>
    </div>
  );
}