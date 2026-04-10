import React from "react";
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
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.progressBar}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={[
              styles.progressSegment,
              i < currentStep ? styles.active : "",
            ]
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
          />
        )}
        <Button
          title={isLastStep ? "Enviar notificação" : "Próximo"}
          variant="contained"
          color={isLastStep ? "green" : "primary"}
          onClick={onNext}
          disabled={!canAdvance}
        />
      </div>
    </div>
  );
};
