import { useState } from "react";
import type { MetodologiaAbordagem } from "../../types/analise";
import { METODOLOGIA_LABEL } from "../../types/analise";
import styles from "./Analise.module.css";

const CRITERIOS_DIRETOS_OPTIONS = ["Never event", "Óbito relacionado à assistência", "Dano grave"];
const CRITERIOS_AVALIATIVOS_OPTIONS = [
  "Alta probabilidade de repetição do evento",
  "Cenário complexo (muitos profissionais ou setores envolvidos, interações instáveis)",
  "Alto potencial de aprendizado (revela falha sistêmica ainda não mapeada)",
  "Nenhum dos anteriores (dano leve ou moderado isolado, causa pontual, baixa chance de repetição)",
];
const NENHUM_DOS_ANTERIORES = CRITERIOS_AVALIATIVOS_OPTIONS[3];

const ABORDAGEM_OPTIONS: { value: MetodologiaAbordagem; tooltip: string }[] = [
  {
    value: "ACR",
    tooltip:
      "Metodologia retrospectiva e estruturada para reconstruir o incidente e compreender como e por que ele ocorreu, buscando causas e fatores contribuintes relacionados ao sistema. Indicada quando a equipe precisa reconstruir cuidadosamente a sequência do incidente e compreender as relações entre acontecimentos, condições existentes e fatores causais.",
  },
  {
    value: "LONDRES_RAPIDO",
    tooltip:
      "Investigação sistêmica e estruturada, realizada de forma objetiva, percorrendo os elementos essenciais do Protocolo de Londres. Indicada quando o caso está relativamente claro e as principais informações estão disponíveis.",
  },
  {
    value: "LONDRES_COMPLETO",
    tooltip:
      "Utiliza a mesma abordagem sistêmica do Protocolo de Londres, com maior aprofundamento na coleta e análise das informações. Indicada quando o caso não está suficientemente esclarecido, exige entrevistas ou diferentes fontes de informação.",
  },
];

type Suggestion = {
  label: string;
  strong: boolean;
  suggested: MetodologiaAbordagem[];
};

function computeSuggestion(criteriosDiretos: string[], criteriosAvaliativos: string[]): Suggestion {
  if (criteriosDiretos.length > 0) {
    return {
      label:
        "Como o incidente envolve Never Event, óbito relacionado à assistência ou dano grave, a investigação completa é recomendada (Protocolo de Londres Rápido não fica disponível).",
      strong: true,
      suggested: ["ACR", "LONDRES_COMPLETO"],
    };
  }
  const count = criteriosAvaliativos.filter((c) => c !== NENHUM_DOS_ANTERIORES).length;
  if (count >= 2) {
    return {
      label:
        "Duas ou mais condições avaliativas se aplicam: a investigação completa é recomendada.",
      strong: false,
      suggested: ["ACR", "LONDRES_COMPLETO"],
    };
  }
  return {
    label: "Cenário aparentemente simples: a investigação rápida deve ser suficiente.",
    strong: false,
    suggested: ["LONDRES_RAPIDO"],
  };
}

type Props = {
  onComplete: (result: {
    criteriosDiretos: string[];
    criteriosAvaliativos: string[];
    abordagem: MetodologiaAbordagem;
  }) => void;
};

export function EscolhaMetodologiaStep({ onComplete }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [criteriosDiretos, setCriteriosDiretos] = useState<string[]>([]);
  const [criteriosAvaliativos, setCriteriosAvaliativos] = useState<string[]>([]);
  const [abordagem, setAbordagem] = useState<MetodologiaAbordagem | "">("");

  const suggestion = computeSuggestion(criteriosDiretos, criteriosAvaliativos);
  const rapidoIndisponivel = criteriosDiretos.length > 0;

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  if (step === 1) {
    return (
      <div>
        <p className={styles.fieldLabel}>Este incidente envolve algum destes critérios?</p>
        <div className={styles.checklistList} style={{ marginBottom: 16 }}>
          {CRITERIOS_DIRETOS_OPTIONS.map((opt) => (
            <label
              key={opt}
              className={`${styles.checklistItem} ${criteriosDiretos.includes(opt) ? styles.checklistItemChecked : ""}`}
              style={{ display: "flex", gap: 10 }}
            >
              <input
                type="checkbox"
                className={styles.checklistCheckbox}
                checked={criteriosDiretos.includes(opt)}
                onChange={() => toggle(criteriosDiretos, setCriteriosDiretos, opt)}
                data-testid={`escolha-metodologia-criterio-direto-${opt}`}
              />
              <span className={styles.checklistItemLabel}>{opt}</span>
            </label>
          ))}
        </div>

        {criteriosDiretos.length === 0 && (
          <>
            <p className={styles.fieldLabel}>Caso nenhum critério direto se aplique, avalie:</p>
            <p className={styles.helpText}>Você pode selecionar mais de uma opção.</p>
            <div className={styles.checklistList}>
              {CRITERIOS_AVALIATIVOS_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className={`${styles.checklistItem} ${criteriosAvaliativos.includes(opt) ? styles.checklistItemChecked : ""}`}
                  style={{ display: "flex", gap: 10 }}
                >
                  <input
                    type="checkbox"
                    className={styles.checklistCheckbox}
                    checked={criteriosAvaliativos.includes(opt)}
                    onChange={() => toggle(criteriosAvaliativos, setCriteriosAvaliativos, opt)}
                    data-testid={`escolha-metodologia-criterio-avaliativo-${opt}`}
                  />
                  <span className={styles.checklistItemLabel}>{opt}</span>
                </label>
              ))}
            </div>
          </>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
          <button
            type="button"
            className={styles.stepPrimaryBtn}
            onClick={() => setStep(2)}
            data-testid="escolha-metodologia-avancar"
          >
            Avançar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`${styles.suggestionBanner} ${suggestion.strong ? styles.suggestionBannerStrong : ""}`}
      >
        {suggestion.label}
      </div>

      <p className={styles.fieldLabel}>Marque a abordagem que será encaminhada ao setor</p>
      <div className={styles.checklistList}>
        {ABORDAGEM_OPTIONS.map((opt) => {
          const disabled = opt.value === "LONDRES_RAPIDO" && rapidoIndisponivel;
          const isSuggested = suggestion.suggested.includes(opt.value);
          return (
            <label
              key={opt.value}
              className={`${styles.checklistItem} ${abordagem === opt.value ? styles.checklistItemChecked : ""}`}
              style={{ display: "flex", gap: 10, opacity: disabled ? 0.5 : 1 }}
              title={
                disabled
                  ? "Não disponível quando o incidente envolve Never Event, óbito relacionado à assistência ou dano grave."
                  : opt.tooltip
              }
            >
              <input
                type="radio"
                className={styles.checklistCheckbox}
                checked={abordagem === opt.value}
                disabled={disabled}
                onChange={() => setAbordagem(opt.value)}
                data-testid={`escolha-metodologia-abordagem-${opt.value}`}
              />
              <div>
                <span className={styles.checklistItemLabel}>
                  {METODOLOGIA_LABEL[opt.value]} {isSuggested && !disabled && "· sugerida"}
                </span>
                <p className={styles.checklistItemExample}>{opt.tooltip}</p>
              </div>
            </label>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
        <button
          type="button"
          className={styles.stepSecondaryBtn}
          onClick={() => setStep(1)}
          data-testid="escolha-metodologia-voltar"
        >
          Voltar
        </button>
        <button
          type="button"
          className={styles.stepPrimaryBtn}
          disabled={!abordagem}
          onClick={() =>
            abordagem && onComplete({ criteriosDiretos, criteriosAvaliativos, abordagem })
          }
          data-testid="escolha-metodologia-confirmar"
        >
          Confirmar abordagem
        </button>
      </div>
    </div>
  );
}
