import React, { useState, useEffect, useCallback } from 'react';
export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    try {
      if (typeof window === 'undefined') return false;
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      console.warn('Failed to access localStorage for theme', e);
      return false;
    }
  });
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const root = window.document.documentElement;
      if (isDark) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (e) {
      console.error('Failed to update theme in DOM or localStorage', e);
    }
  }, [isDark]);
  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);
  return { isDark, toggleTheme };
}