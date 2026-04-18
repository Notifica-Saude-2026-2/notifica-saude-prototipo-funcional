import { useContext } from "react";
import { AccessibilityContext } from "../contexts/AccessibilityContext";

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility deve ser usado dentro de AccessibilityProvider.");
  return ctx;
}
