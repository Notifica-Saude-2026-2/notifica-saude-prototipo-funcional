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
import step1Icon from "../../assets/step1.svg";
import step2Icon from "../../assets/step2.svg";
import step3Icon from "../../assets/step3.svg";
import step4Icon from "../../assets/step4.svg";

const SECAO_PACIENTE = "Tela 2 - Informações sobre o Paciente";
const CAMPO_CONTATO_ID = "55555555-5555-4555-b555-000000000007";
const CAMPO_NOME_ID = "55555555-5555-4555-b555-000000000006";

const SECAO_CONFIG: Record<string, { label: string; icon: string }> = {
  "Tela 1 - Abertura":                                                  { label: "Informações iniciais",                     icon: step1Icon },
  "Tela 2 - Informações sobre o Paciente":                              { label: "Informações sobre o paciente envolvido",   icon: step2Icon },
  "Tela 3 - Momento e Local do Incidente":                              { label: "Momento e local do incidente",             icon: step3Icon },
  "Tela 4 - Descrição do Incidente e Papel do Notificador":             { label: "Descrição do incidente",                   icon: step4Icon },
  "Identificação opcional do notificador":                              { label: "Informações opcionais do notificante",     icon: step2Icon },
};

function groupBySecao(campos: CampoDinamico[]): Map<string, CampoDinamico[]> {
  const map = new Map<string, CampoDinamico[]>();
  for (const campo of campos) {
    const secao = campo.secao ?? 'Etapa 1';
    const existing = map.get(secao) ?? [];
    map.set(secao, [...existing, campo]);
  }
  return map;
}
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

function todayStr(): string {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
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
      if (Array.isArray(v) && v.length === 0) return false;
      if (c.tipo === 'DATA') return (v as string) <= todayStr();

      const outroOption = c.opcoes?.find((o) => o.valor.toLowerCase() === 'outro');
      if (outroOption) {
        const outroSelected =
          (c.tipo === 'RADIO' && v === outroOption.id) ||
          (c.tipo === 'CHECKBOX' && Array.isArray(v) && v.includes(outroOption.id));
        if (outroSelected) {
          const outroVal = formValues[`${c.id}_outro`];
          if (!outroVal || (outroVal as string).trim() === '') return false;
        }
      }

      return true;
    });
}

export default function Notificacao() {
  const navigate = useNavigate();
  const { campos, loading, error, retry } = useCamposFormulario();
  const { formValues, updateField, resetForm, submit, submitting, submitError } =
    useNotificacao();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const secaoMap = groupBySecao(campos);
  const todasSecoes = Array.from(secaoMap.keys());

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
        <div className={styles.errorCard}>
          <p className={styles.errorTitle}>Não foi possível carregar o formulário</p>
          <p className={styles.errorMessage}>{error}</p>
          <Button
            title="Tentar novamente"
            variant="contained"
            color="primary"
            onClick={retry}
          />
        </div>
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
            <Button
              title="Enviar outra notificação"
              variant="contained"
              color="primary"
              onClick={() => {
                resetForm();
                setSubmitted(false);
                setCurrentStepIndex(0);
              }}
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
        stepTitle={SECAO_CONFIG[currentSecao]?.label ?? currentSecao}
        stepIcon={SECAO_CONFIG[currentSecao] && <img src={SECAO_CONFIG[currentSecao].icon} alt="" />}
        onNext={handleNext}
        onPrev={currentStepIndex > 0 ? handlePrev : undefined}
        isLastStep={isLastStep}
        canAdvance={canAdvance}
      >
        {isCurrentStepOptional && (
          <p className={styles.optionalNotice}>
            Esta etapa é opcional. Você pode enviar a notificação sem preencher os campos abaixo.
          </p>
        )}
        {camposEtapaAtual.map((campo) => (
          <FieldRenderer
            key={campo.id}
            {...campo}
            placeholder={
              campo.id === CAMPO_CONTATO_ID
                ? "Informe um telefone ou email completo (opcional)"
                : campo.id === CAMPO_NOME_ID
                  ? "Informe seu nome completo (opcional)"
                  : campo.placeholder
            }
            value={formValues[campo.id]}
            onChange={(value) => updateField(campo.id, value)}
            outroValue={(formValues[`${campo.id}_outro`] as string) ?? ''}
            onOutroChange={(v) => updateField(`${campo.id}_outro`, v)}
          />
        ))}

        {submitError && <p className={styles.submitError}>{submitError}</p>}
      </StepForm>
    </div>
  );
}
