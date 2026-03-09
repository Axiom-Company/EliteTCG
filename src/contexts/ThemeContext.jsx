import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('eliteDark') === 'true'; } catch { return false; }
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('site-dark');
    } else {
      document.documentElement.classList.remove('site-dark');
    }
    try { localStorage.setItem('eliteDark', String(dark)); } catch {}
  }, [dark]);

  const toggleDark = () => setDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ dark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
