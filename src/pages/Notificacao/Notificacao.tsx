import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsCheckCircle } from "react-icons/bs";
import { Button } from "../../components/common/ui/Button";
import { StepForm } from "../../components/form/StepForm";
import { FieldRenderer } from "../../components/form/FieldRenderer";
import { useCamposFormulario } from "../../hooks/useCamposFormulario";
import { useNotificacao } from "../../hooks/useNotificacao";
import type { CampoDinamico } from "../../types/formulario";
import styles from "./Notificacao.module.css";

const SECAO_PACIENTE = "Tela 2 - Informações sobre o Paciente";

/**
 * Agrupa campos por secao (string vinda do backend).
 * Retorna um Map ordenado pela primeira aparição de cada secao.
 */
function groupBySecao(campos: CampoDinamico[]): Map<string, CampoDinamico[]> {
  const map = new Map<string, CampoDinamico[]>();
  for (const campo of campos) {
    const secao = campo.secao ?? 'Etapa 1';
    const existing = map.get(secao) ?? [];
    map.set(secao, [...existing, campo]);
  }
  return map;
}

/**
 * Retorna true se o campo "envolve paciente" está respondido com "Sim".
 * Identifica o campo dinamicamente: é o campo da Tela 1 que tem opção "Sim" e "Não".
 */
function pacienteEnvolvido(campos: CampoDinamico[], formValues: Record<string, unknown>): boolean {
  const campoPaciente = campos.find(
    (c) =>
      c.secao === "Tela 1 - Abertura" &&
      c.opcoes?.some((o) => o.valor === "Sim") &&
      c.opcoes?.some((o) => o.valor === "Não")
  );
  if (!campoPaciente) return true; // sem dado suficiente → exibe a tela por segurança
  const simOpcao = campoPaciente.opcoes?.find((o) => o.valor === "Sim");
  return formValues[campoPaciente.id] === simOpcao?.id;
}

function isStepComplete(
  campos: CampoDinamico[],
  formValues: Record<string, unknown>
): boolean {
  return campos
    .filter((c) => c.obrigatorio)
    .every((c) => {
      const v = formValues[c.id];
      if (v === undefined || v === null || v === "") return false;
      if (Array.isArray(v)) return v.length > 0;
      return true;
    });
}

export default function Notificacao() {
  const navigate = useNavigate();
  const { campos, loading, error } = useCamposFormulario();
  const { formValues, updateField, submit, submitting, submitError } =
    useNotificacao();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const secaoMap = groupBySecao(campos);
  const todasSecoes = Array.from(secaoMap.keys());

  // Tela 2 só aparece se o usuário respondeu "Sim" em "A notificação envolve paciente?"
  const secoes = todasSecoes.filter(
    (s) => s !== SECAO_PACIENTE || pacienteEnvolvido(campos, formValues)
  );

  const totalSteps = secoes.length || 1;
  const currentSecao = secoes[currentStepIndex] ?? 'Etapa 1';
  const camposEtapaAtual = secaoMap.get(currentSecao) ?? [];
  const isLastStep = currentStepIndex === totalSteps - 1;
  const isCurrentStepOptional = camposEtapaAtual.every((c) => !c.obrigatorio);
  const canAdvance = isStepComplete(camposEtapaAtual, formValues) && !submitting;

  async function handleNext() {
    if (isLastStep) {
      try {
        // Submete apenas os campos das seções ativas (exclui Tela 2 se não envolveu paciente)
        const camposAtivos = secoes.flatMap((s) => secaoMap.get(s) ?? []);
        await submit(camposAtivos);
        setSubmitted(true);
      } catch {
        // submitError is handled by the hook
      }
    } else {
      setCurrentStepIndex((i) => i + 1);
    }
  }

  function handlePrev() {
    setCurrentStepIndex((i) => Math.max(0, i - 1));
  }

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <p className={styles.loadingText}>Carregando formulário...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.successCard}>
          <BsCheckCircle className={styles.successIcon} />
          <h2 className={styles.successTitle}>
            Notificação enviada com sucesso!
          </h2>
          <p className={styles.successText}>
            Agradecemos o tempo dedicado para registrar o incidente. Sua
            contribuição é muito importante para melhorar a segurança do
            paciente.
          </p>
          <div className={styles.successActions}>
            <Button
              title="Voltar ao início"
              variant="outlined"
              color="gray"
              onClick={() => navigate("/")}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>REGISTRO DE INCIDENTE</h1>
        <p className={styles.pageSubtitle}>
          Formulário para notificação de incidentes de segurança do paciente
        </p>
      </div>

      <StepForm
        currentStep={currentStepIndex + 1}
        totalSteps={totalSteps}
        stepTitle={currentSecao}
        onNext={handleNext}
        onPrev={currentStepIndex > 0 ? handlePrev : undefined}
        isLastStep={isLastStep}
        canAdvance={canAdvance}
        optional={isCurrentStepOptional}
      >
        {camposEtapaAtual.map((campo) => (
          <FieldRenderer
            key={campo.id}
            {...campo}
            value={formValues[campo.id]}
            onChange={(value) => updateField(campo.id, value)}
          />
        ))}

        {submitError && <p className={styles.submitError}>{submitError}</p>}
      </StepForm>
    </div>
  );
}
