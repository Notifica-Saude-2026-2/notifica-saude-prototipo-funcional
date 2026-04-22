import { useEffect, useRef, useState } from "react";
import { useAccessibility } from "../../../../hooks/useAccessibility";
import styles from "./AccessibilityWidget.module.css";

type FontSize = "normal" | "medium" | "large";

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const FONT_LABELS: Record<FontSize, string> = {
  normal: "normal",
  medium: "médio",
  large: "grande",
};

export function AccessibilityWidget() {
  const { fontSize, highContrast, setFontSize, toggleHighContrast, reset } = useAccessibility();
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Focus trap + Escape key
  useEffect(() => {
    if (!open) return;

    function getFocusable() {
      return Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []
      );
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (e.key === "Tab") {
        const focusable = getFocusable();
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Click outside closes panel
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        !panelRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Focus panel when opened
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  function handleSetFontSize(size: FontSize) {
    setFontSize(size);
    setAnnouncement(`Tamanho da fonte alterado para ${FONT_LABELS[size]}`);
  }

  function handleToggleHighContrast() {
    toggleHighContrast();
    setAnnouncement(highContrast ? "Alto contraste desativado" : "Alto contraste ativado");
  }

  function handleReset() {
    reset();
    setAnnouncement("Preferências de acessibilidade restauradas para o padrão");
  }

  return (
    <div className={styles.wrapper}>
      <span role="status" aria-live="polite" className={styles.srOnly}>
        {announcement}
      </span>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Opções de acessibilidade"
          aria-modal="true"
          tabIndex={-1}
          className={styles.panel}
        >
          <p className={styles.sectionTitle}>Tamanho da fonte</p>
          <div className={styles.fontButtons}>
            <button
              className={`${styles.fontBtn} ${fontSize === "normal" ? styles.active : ""}`}
              onClick={() => handleSetFontSize("normal")}
              aria-pressed={fontSize === "normal"}
            >
              A
            </button>
            <button
              className={`${styles.fontBtn} ${styles.fontMd} ${fontSize === "medium" ? styles.active : ""}`}
              onClick={() => handleSetFontSize("medium")}
              aria-pressed={fontSize === "medium"}
            >
              A
            </button>
            <button
              className={`${styles.fontBtn} ${styles.fontLg} ${fontSize === "large" ? styles.active : ""}`}
              onClick={() => handleSetFontSize("large")}
              aria-pressed={fontSize === "large"}
            >
              A
            </button>
          </div>

          <hr className={styles.divider} />

          <button
            className={`${styles.contrastBtn} ${highContrast ? styles.active : ""}`}
            onClick={handleToggleHighContrast}
            aria-pressed={highContrast}
          >
            {highContrast ? "◑ Alto contraste: ON" : "◑ Alto contraste: OFF"}
          </button>

          <hr className={styles.divider} />

          <button className={styles.resetBtn} onClick={handleReset}>
            ↺ Restaurar padrões
          </button>
        </div>
      )}

      <button
        ref={buttonRef}
        className={styles.trigger}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Abrir opções de acessibilidade"
        aria-expanded={open}
        title="Acessibilidade"
      >
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
          <circle cx="12" cy="4" r="2" />
          <path d="M15.5 8.5h-7a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5H10v6a1 1 0 0 0 2 0v-3h1v3a1 1 0 0 0 2 0v-6h1.5a.5.5 0 0 0 .5-.5V9a.5.5 0 0 0-.5-.5z" />
        </svg>
      </button>
    </div>
  );
}
