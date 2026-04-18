import { useEffect, useRef, useState } from "react";
import { useAccessibility } from "../../../../hooks/useAccessibility";
import styles from "./AccessibilityWidget.module.css";

export function AccessibilityWidget() {
  const { fontSize, highContrast, setFontSize, toggleHighContrast, reset } = useAccessibility();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <div className={styles.wrapper}>
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Opções de acessibilidade"
          aria-modal="false"
          tabIndex={-1}
          className={styles.panel}
        >
          <p className={styles.sectionTitle}>Tamanho da fonte</p>
          <div className={styles.fontButtons}>
            <button
              className={`${styles.fontBtn} ${fontSize === "normal" ? styles.active : ""}`}
              onClick={() => setFontSize("normal")}
              aria-pressed={fontSize === "normal"}
            >
              A
            </button>
            <button
              className={`${styles.fontBtn} ${styles.fontMd} ${fontSize === "medium" ? styles.active : ""}`}
              onClick={() => setFontSize("medium")}
              aria-pressed={fontSize === "medium"}
            >
              A
            </button>
            <button
              className={`${styles.fontBtn} ${styles.fontLg} ${fontSize === "large" ? styles.active : ""}`}
              onClick={() => setFontSize("large")}
              aria-pressed={fontSize === "large"}
            >
              A
            </button>
          </div>

          <hr className={styles.divider} />

          <button
            className={`${styles.contrastBtn} ${highContrast ? styles.active : ""}`}
            onClick={toggleHighContrast}
            aria-pressed={highContrast}
          >
            {highContrast ? "◑ Alto contraste: ON" : "◑ Alto contraste: OFF"}
          </button>

          <hr className={styles.divider} />

          <button className={styles.resetBtn} onClick={reset}>
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
        ♿
      </button>
    </div>
  );
}
