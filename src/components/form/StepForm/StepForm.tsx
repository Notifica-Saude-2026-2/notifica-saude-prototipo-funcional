import React, { useRef, useEffect } from "react";
import styles from "./StepForm.module.css";
import { Button } from "../../common/ui/Button";

type StepFormProps = {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  stepIcon?: React.ReactNode;
  children: React.ReactNode;
  onNext: () => void;
  onPrev?: () => void;
  isLastStep?: boolean;
  canAdvance?: boolean;
  /** Rótulo do botão no último passo. Padrão: "Enviar notificação" (fluxo de notificação pública). */
  submitLabel?: string;
  /**
   * Usa botões de navegação no tamanho do design system interno (admin), em vez do botão grande
   * e "touch-friendly" pensado para o formulário público de notificação. Ative em telas internas
   * (ex.: fluxo de Análise) para não destoar do resto do admin.
   */
  compact?: boolean;
};

export const StepForm: React.FC<StepFormProps> = ({
  currentStep,
  totalSteps,
  stepTitle,
  stepIcon,
  children,
  onNext,
  onPrev,
  isLastStep = false,
  canAdvance = true,
  submitLabel = "Enviar notificação",
  compact = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentStep]);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.progressBar}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={[styles.progressSegment, i < currentStep ? styles.active : ""]
              .join(" ")
              .trim()}
          />
        ))}
      </div>

      <div className={styles.stepHeader}>
        {stepIcon && <span className={styles.stepIcon}>{stepIcon}</span>}
        <span className={styles.stepTitle}>{stepTitle}</span>
      </div>

      <div className={styles.content}>{children}</div>

      <div className={styles.navigation}>
        {onPrev && (
          <Button
            title="Voltar"
            variant="outlined"
            color="gray"
            onClick={onPrev}
            className={compact ? styles.compactBtn : undefined}
            data-testid="stepform-btn-prev"
          />
        )}
        <Button
          title={isLastStep ? submitLabel : "Próximo"}
          variant="contained"
          color={isLastStep ? "green" : "primary"}
          onClick={onNext}
          disabled={!canAdvance}
          className={compact ? styles.compactBtn : undefined}
          data-testid={isLastStep ? "stepform-btn-submit" : "stepform-btn-next"}
        />
      </div>
    </div>
  );
};
