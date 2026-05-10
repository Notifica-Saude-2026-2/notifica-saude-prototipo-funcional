import { useState } from "react";
import {
  classificarNotificacao,
  atualizarClassificacao,
  type ClassificarPayload,
} from "../../../services/notificacaoDetalheService";
import type { ClassificacaoRaw } from "../../../types/notificacaoDetalhe";
import { ApiError } from "../../../services/api";
import styles from "./NotificacaoDetalhe.module.css";

// --------------------------------------------------------------------------
// Opções fixas — espelham o protótipo
// --------------------------------------------------------------------------

const CLASSIFICACAO_OPTIONS = [
  {
    value: "CIRCUNSTANCIA_RISCO",
    label: "Circunstância notificável",
    desc: "situação de risco que poderia causar dano",
    title: "ex.: cama sem grades, equipamentos sem manutenção",
  },
  {
    value: "NEAR_MISS",
    label: "Near Miss",
    desc: "um incidente que não atingiu o paciente",
    title: "ex.: bolsa de sangue conectada ao paciente errado, mas detectada antes da transfusão",
  },
  {
    value: "INCIDENTE_SEM_DANO",
    label: "Incidente sem dano",
    desc: "um evento atingiu o paciente, mas não resultou em dano perceptível",
    title: "ex.: bolsa transfundida mas não incompatível",
  },
  {
    value: "EVENTO_ADVERSO",
    label: "Evento adverso",
    desc: "um incidente que resulta em dano a um paciente",
    title: "ex.: bolsa errada transfundida e paciente morreu de reação hemolítica",
  },
];

const GRAU_DANO_OPTIONS = [
  { value: "LEVE", label: "Leve", desc: "sintomas leves, intervenção mínima" },
  { value: "MODERADO", label: "Moderado", desc: "requer intervenção, sem risco de vida imediato" },
  { value: "GRAVE", label: "Grave", desc: "risco de vida ou dano permanente" },
  { value: "OBITO", label: "Óbito", desc: "morte causada pelo dano" },
  {
    value: "NEVER_EVENT",
    label: "Never Event",
    desc: "incidentes graves que nunca deveriam ocorrer",
  },
];

const TIPO_ESPECIFICO_OPTIONS = [
  { value: "CIRURGIA_PARTE_ERRADA", label: "Cirurgia em parte errada do corpo" },
  { value: "CIRURGIA_PACIENTE_ERRADO", label: "Cirurgia em paciente errado" },
  { value: "CIRURGIA_PROCEDIMENTO_ERRADO", label: "Procedimento cirúrgico errado" },
  { value: "RETENCAO_CORPO_ESTRANHO", label: "Retenção não intencional de corpo estranho" },
  { value: "EMBOLIA_GASOSA", label: "Embolia gasosa" },
  { value: "TRANSFUSAO_INCOMPATIVEL", label: "Incompatibilidade sanguínea (transfusão)" },
  { value: "MORTE_MATERNA", label: "Morte ou lesão grave materna (parto)" },
  { value: "MORTE_NEONATAL", label: "Morte ou lesão grave neonatal (parto de baixo risco)" },
  { value: "SUICIDIO_HOSPITALAR", label: "Suicídio ou tentativa no ambiente hospitalar" },
  { value: "VIOLACAO_SEXUAL", label: "Abuso ou violação sexual no hospital" },
  { value: "FUGA_PACIENTE", label: "Fuga de paciente com dano grave ou morte" },
  { value: "QUEDA_MORTE", label: "Queda que resultou em morte" },
  { value: "ERROS_MEDICAMENTOS_MORTE", label: "Morte por erro de medicação" },
  { value: "HIPER_HIPOGLICEMIA_MORTE", label: "Morte por hiper/hipoglicemia severa" },
  { value: "ALTA_TENSAO_MORTE", label: "Morte por alta tensão ou queimadura grave" },
  { value: "REACAO_ADVERSA_VACINA_MORTE", label: "Morte por reação adversa a vacina" },
  { value: "INFECCAO_HOSPITALAR_GRAVE", label: "Infecção hospitalar grave ou óbito por infecção" },
  { value: "DISPOSITIVO_MEDICO_MORTE", label: "Morte ou lesão grave por dispositivo médico" },
  { value: "ESCARAS_GRAVES", label: "Lesão por pressão Grau 3 ou 4 (adquirida no hospital)" },
  { value: "IDENTIFICACAO_ERRADA", label: "Identificação errada do paciente" },
  { value: "COMUNICACAO_FALHA", label: "Falha na comunicação (dano grave)" },
  { value: "QUEDA_LESAO_GRAVE", label: "Queda que resultou em lesão grave" },
  { value: "INTERVENCAO_NEONATAL", label: "Morte ou lesão grave por intervenção em neonato" },
  { value: "COMPLICACAO_ANESTESIA", label: "Complicação por anestesia" },
  { value: "REACAO_TRANSFUSIONAL", label: "Reação transfusional grave" },
  { value: "CORPO_ESTRANHO_NEONATO", label: "Retenção de corpo estranho em neonato" },
  { value: "PNEUMOTORAX_NEONATO", label: "Pneumotórax iatrogênico em neonato" },
  { value: "ENTEROCOLITE_NEONATO", label: "Enterocolite necrotizante em neonato" },
  { value: "PARALISIA_BRAQUIAL_NEONATO", label: "Paralisia braquial obstétrica" },
];

const ENVOLVIDOS_OPTIONS = [
  { value: "PROFISSIONAL_SAUDE", label: "Profissional de saúde" },
  { value: "PACIENTE", label: "Paciente" },
  { value: "FAMILIAR_ACOMPANHANTE", label: "Familiar/acompanhante" },
  { value: "EQUIPAMENTO", label: "Equipamento" },
  { value: "SISTEMA", label: "Sistema" },
  { value: "AMBIENTE_FISICO", label: "Ambiente físico" },
  { value: "MEDICAMENTO", label: "Medicamento" },
  { value: "DISPOSITIVO_MEDICO", label: "Dispositivo médico" },
  { value: "OUTRO", label: "Outro" },
];

// --------------------------------------------------------------------------
// SelectCardGroup — single ou múltiplo, igual ao protótipo
// --------------------------------------------------------------------------

type SelectOption = { value: string; label: string; desc?: string; title?: string };

function SelectCardGroup({
  options,
  value,
  onChange,
  multiple = false,
  disabled = false,
}: {
  options: SelectOption[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
}) {
  function isChecked(v: string) {
    return multiple ? (value as string[]).includes(v) : value === v;
  }

  function toggle(v: string) {
    if (disabled) return;
    if (multiple) {
      const arr = value as string[];
      onChange(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    } else {
      onChange(value === v ? "" : v);
    }
  }

  return (
    <div className={styles.selectGroup}>
      {options.map((o) => (
        <div
          key={o.value}
          className={styles.selectItem}
          data-checked={isChecked(o.value) ? "true" : "false"}
          data-disabled={disabled ? "true" : "false"}
          onClick={() => toggle(o.value)}
          title={o.title}
          role={multiple ? "checkbox" : "radio"}
          aria-checked={isChecked(o.value)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") toggle(o.value);
          }}
        >
          <span className={styles.selectBox}>{isChecked(o.value) ? "✓" : ""}</span>
          <span className={styles.selectLabel}>
            <strong>{o.label}</strong>
            {o.desc ? ` - ${o.desc}` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

// --------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------

type ClassificacaoModalProps = {
  notificacaoId: string;
  classificacaoExistente?: ClassificacaoRaw | null;
  onClose: () => void;
  onSuccess: (classificacao: ClassificacaoRaw) => void;
};

// --------------------------------------------------------------------------
// Modal principal
// --------------------------------------------------------------------------

export function ClassificacaoModal({
  notificacaoId,
  classificacaoExistente,
  onClose,
  onSuccess,
}: ClassificacaoModalProps) {
  const [classificacao, setClassificacao] = useState(classificacaoExistente?.tipo_incidente ?? "");
  const [grauDano, setGrauDano] = useState(classificacaoExistente?.grau_dano ?? "");
  const [tipoEspecifico, setTipoEspecifico] = useState(
    classificacaoExistente?.tipo_especifico ?? "",
  );
  const [envolvidos, setEnvolvidos] = useState<string[]>(classificacaoExistente?.envolvidos ?? []);
  const [outroEnvolvido, setOutroEnvolvido] = useState(
    classificacaoExistente?.outro_envolvido ?? "",
  );
  const [observacoes, setObservacoes] = useState(classificacaoExistente?.observacoes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdverso = classificacao === "EVENTO_ADVERSO";
  const isNeverEvent = grauDano === "NEVER_EVENT";
  const isOutroEnvolvido = envolvidos.includes("OUTRO");
  const isRascunho = !!classificacaoExistente;

  // Formata data de validade para exibição (CA-06)
  const dataValidadeFormatada = classificacaoExistente?.data_validade
    ? new Date(classificacaoExistente.data_validade).toLocaleDateString("pt-BR")
    : null;

  async function handleSalvar(isDraft = false) {
    if (!isDraft) {
      if (!classificacao) {
        setError("Selecione a classificação do incidente.");
        return;
      }
      if (isAdverso && !grauDano) {
        setError("Selecione o grau do dano para Evento adverso.");
        return;
      }
      if (isNeverEvent && !tipoEspecifico) {
        setError("Selecione o tipo específico para Never Event.");
        return;
      }
      if (envolvidos.length === 0) {
        setError("Selecione ao menos um envolvido no incidente.");
        return;
      }
      if (isOutroEnvolvido && !outroEnvolvido.trim()) {
        setError("Especifique o envolvido 'Outro'.");
        return;
      }
    }

    if (observacoes.length > 400) {
      setError("A observação pode ter no máximo 400 caracteres.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload: ClassificarPayload = {
      tipo_incidente: classificacao || null,
      tipo_especifico: isNeverEvent ? tipoEspecifico : null,
      envolvidos: envolvidos.length > 0 ? envolvidos : [],
      outro_envolvido: isOutroEnvolvido ? outroEnvolvido.trim() : null,
      grau_dano: isAdverso && grauDano ? grauDano : null,
      observacoes: observacoes.trim() || null,
      rascunho: isDraft,
    };

    try {
      const result = isRascunho
        ? await atualizarClassificacao(notificacaoId, payload)
        : await classificarNotificacao(notificacaoId, payload);
      onSuccess(result);
      onClose();
    } catch (e) {
      let msg = "Erro ao salvar classificação.";
      if (e instanceof ApiError) {
        if (e.status === 409) msg = "Classificação já existe ou já foi finalizada.";
        else if (e.status === 422) msg = "Dados inválidos. Verifique os campos.";
        else msg = `Erro ${e.status}: tente novamente.`;
      }
      setError(msg);
      setSaving(false);
    }
  }

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Classificar incidente"
    >
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h2 className={styles.modalTitle}>
              {isRascunho ? "Continuar classificação" : "Classificar incidente"}
            </h2>
            {classificacaoExistente &&
              !classificacaoExistente.rascunho &&
              dataValidadeFormatada && (
                <span className={styles.prazoBadge}>
                  Prazo para análise: {dataValidadeFormatada}
                </span>
              )}
          </div>
          {isRascunho && classificacaoExistente?.rascunho && (
            <span className={styles.rascunhoBadge}>Rascunho</span>
          )}
        </div>

        {/* Body scrollável */}
        <div className={styles.modalBody}>
          {/* 1. Classificação */}
          <div>
            <p className={styles.formQuestion}>Defina a classificação do incidente</p>
            <SelectCardGroup
              options={CLASSIFICACAO_OPTIONS}
              value={classificacao}
              onChange={(v) => {
                setClassificacao(v as string);
                if (v !== "EVENTO_ADVERSO") {
                  setGrauDano("");
                  setTipoEspecifico("");
                }
              }}
              disabled={saving}
            />
          </div>

          {/* 2. Grau do dano — apenas para EVENTO_ADVERSO */}
          {isAdverso && (
            <div>
              <p className={styles.formQuestion}>Classifique o grau do dano</p>
              <SelectCardGroup
                options={GRAU_DANO_OPTIONS}
                value={grauDano}
                onChange={(v) => {
                  setGrauDano(v as string);
                  if (v !== "NEVER_EVENT") setTipoEspecifico("");
                }}
                disabled={saving}
              />
            </div>
          )}

          {/* 3. Tipo de incidente (apenas para NEVER_EVENT) */}
          {isNeverEvent && (
            <div>
              <p className={styles.formQuestion}>Tipo específico de Never Event</p>
              <SelectCardGroup
                options={TIPO_ESPECIFICO_OPTIONS}
                value={tipoEspecifico}
                onChange={(v) => setTipoEspecifico(v as string)}
                disabled={saving}
              />
            </div>
          )}

          {/* 4. Envolvidos (múltiplo) */}
          <div>
            <p className={styles.formQuestion}>O incidente envolve</p>
            <SelectCardGroup
              options={ENVOLVIDOS_OPTIONS}
              value={envolvidos}
              onChange={(v) => setEnvolvidos(v as string[])}
              multiple
              disabled={saving}
            />

            {isOutroEnvolvido && (
              <div style={{ marginTop: "10px" }}>
                <input
                  type="text"
                  className={styles.modalInput}
                  placeholder="Especifique o envolvido..."
                  value={outroEnvolvido}
                  onChange={(e) => setOutroEnvolvido(e.target.value)}
                  maxLength={200}
                  disabled={saving}
                  required
                />
              </div>
            )}
          </div>

          {/* 5. Observações */}
          <div>
            <p className={styles.formQuestion}>Observações do NSP</p>
            <textarea
              className={styles.modalInput}
              rows={4}
              maxLength={400}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              disabled={saving}
              placeholder="Descreva observações relevantes sobre o incidente (máx 400 caracteres)..."
              style={{ resize: "vertical" }}
            />
            <small style={{ color: "#666" }}>{observacoes.length}/400</small>
          </div>

          {error && <p className={styles.modalError}>{error}</p>}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className={styles.cancelBtn}
              style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
              onClick={() => handleSalvar(true)}
              disabled={saving}
            >
              Salvar rascunho
            </button>
            <button
              className={styles.saveBtn}
              onClick={() => handleSalvar(false)}
              disabled={saving}
            >
              {saving ? "Salvando..." : "Finalizar classificação"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
