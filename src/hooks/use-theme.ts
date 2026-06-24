import React, { useState, useEffect } from 'react';
export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
      if (savedTheme) return savedTheme === 'dark';
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      console.warn('Failed to access localStorage for theme', e);
      return false;
    }
  });
  useEffect(() => {
    try {
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
  const toggleTheme = React.useCallback(() => {
    setIsDark(prev => !prev);
  }, []);
  return { isDark, toggleTheme };
}