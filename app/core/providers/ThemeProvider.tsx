"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  isLight: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme-preference");
    const lightModeEnabled = savedTheme === "light";

    if (lightModeEnabled) {
      setIsLight(true);
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }

    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newStatus = !isLight;
    setIsLight(newStatus);

    if (newStatus) {
      document.body.classList.add("light-mode");
      localStorage.setItem("theme-preference", "light");
    } else {
      document.body.classList.remove("light-mode");
      localStorage.setItem("theme-preference", "dark");
    }
  };

  if (!mounted) {
    return null;
  }
  return (
    <ThemeContext.Provider value={{ isLight, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
