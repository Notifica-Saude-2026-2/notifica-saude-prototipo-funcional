import { createContext, useEffect, useState } from "react";

type FontSize = "normal" | "medium" | "large";

type AccessibilityContextType = {
  fontSize: FontSize;
  highContrast: boolean;
  setFontSize: (size: FontSize) => void;
  toggleHighContrast: () => void;
  reset: () => void;
};

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

const STORAGE_KEY = "notifica-saude-a11y";

const defaults = { fontSize: "normal" as FontSize, highContrast: false };

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      return saved.fontSize ?? defaults.fontSize;
    } catch {
      return defaults.fontSize;
    }
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      return saved.highContrast ?? defaults.highContrast;
    } catch {
      return defaults.highContrast;
    }
  });

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-font-size", fontSize);
    html.setAttribute("data-high-contrast", String(highContrast));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ fontSize, highContrast }));
  }, [fontSize, highContrast]);

  function setFontSize(size: FontSize) {
    setFontSizeState(size);
  }

  function toggleHighContrast() {
    setHighContrast((prev) => !prev);
  }

  function reset() {
    setFontSizeState(defaults.fontSize);
    setHighContrast(defaults.highContrast);
  }

  return (
    <AccessibilityContext.Provider value={{ fontSize, highContrast, setFontSize, toggleHighContrast, reset }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export { AccessibilityContext };
