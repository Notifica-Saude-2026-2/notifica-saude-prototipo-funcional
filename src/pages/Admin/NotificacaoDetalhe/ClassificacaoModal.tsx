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
    value: "CIRCUNSTANCIA_NOTIFICAVEL",
    label: "Circunstância notificável",
    desc: "situação de risco que poderia causar dano",
    title: "ex.: cama sem grades, equipamentos sem manutenção",
  },
  {
    value: "NEAR_MISS",
    label: "Near Miss",
    desc: "um incidente que não atingiu o paciente",
    title:
      "ex.: uma bolsa de sangue foi conectada ao acesso venoso do paciente errado, mas o erro foi detectado antes do início da transfusão",
  },
  {
    value: "INCIDENTE_SEM_DANO",
    label: "Incidente sem dano",
    desc: "um evento atingiu o paciente, mas não resultou em dano perceptível",
    title: "ex.: se uma bolsa de sangue foi transfundida, mas não era incompatível",
  },
  {
    value: "EVENTO_ADVERSO",
    label: "Evento adverso",
    desc: "um incidente que resulta em dano a um paciente",
    title:
      "ex.: se a bolsa de sangue errada foi transfundida e o paciente morreu de uma reação hemolítica",
  },
];

const GRAU_DANO_OPTIONS = [
  { value: "LEVE", label: "Leve", desc: "sintomas leves, intervenção mínima" },
  {
    value: "MODERADO",
    label: "Moderado",
    desc: "requer intervenção, sem risco de vida imediato",
  },
  { value: "GRAVE", label: "Grave", desc: "risco de vida ou dano permanente" },
  { value: "OBITO", label: "Óbito", desc: "morte causada pelo dano" },
  {
    value: "NEVER_EVENT",
    label: "Never Event",
    desc: "incidentes graves que nunca deveriam ocorrer",
  },
];

const TIPO_ESPECIFICO_OPTIONS = [
  {
    value: "ALTA_LIBERACAO_PACIENTE_INCAPAZ_PESSOA_NAO_AUTORIZADA",
    label: "Alta ou liberação de paciente incapaz para pessoa não autorizada",
  },
  {
    value: "CONTAMINACAO_O2_GASES_MEDICINAIS",
    label: "Contaminação na administração de O2 ou gases medicinais",
  },
  {
    value: "DESAPARECIMENTO_CORPO_RECEM_NASCIDO_OBITO",
    label: "Desaparecimento do corpo do recém-nascido que foi a óbito",
  },
  {
    value: "EXODONTIA_DENTE_ERRADO",
    label: "Exodontia de dente errado",
  },
  {
    value: "GAS_ERRADO_O2_GASES_MEDICINAIS",
    label: "Gás errado na administração de O2 ou gases medicinais",
  },
  {
    value: "INSEMINACAO_FERTILIZACAO_ESPERMA_OVULO_ERRADO",
    label: "Inseminação artificial ou fertilização in vitro com esperma ou óvulo errado",
  },
  {
    value: "LESAO_GRAVE_QUEDA_DURANTE_CUIDADOS",
    label: "Lesão grave associada à queda do paciente durante prestação de cuidados",
  },
  {
    value: "LESAO_PRESSAO_ESTAGIO_3",
    label: "Lesão por Pressão estágio 3 (perda total da espessura da pele)",
  },
  {
    value: "LESAO_PRESSAO_ESTAGIO_4",
    label: "Lesão por Pressão estágio 4 (perda total da espessura da pele e perda tissular)",
  },
  {
    value: "LESAO_PRESSAO_NAO_CLASSIFICAVEL",
    label: "Lesão por Pressão Não Classificável (perda tissular não visível)",
  },
  {
    value: "OBITO_QUEDA_DURANTE_CUIDADOS",
    label: "Óbito associado à queda do paciente durante prestação de cuidados",
  },
  {
    value: "OBITO_INTRAOPERATORIO_POS_OPERATORIO_ASA_CLASSE_1",
    label: "Óbito intraoperatório ou pós-operatório em paciente ASA Classe 1",
  },
  {
    value: "OBITO_LESAO_GRAVE_FUGA_PACIENTE",
    label: "Óbito ou lesão grave associado à fuga do paciente",
  },
  {
    value: "OBITO_LESAO_GRAVE_CHOQUE_ELETRICO",
    label: "Óbito ou lesão grave por choque elétrico durante a assistência",
  },
  {
    value: "OBITO_LESAO_GRAVE_OBJETO_METALICO_RESSONANCIA_MAGNETICA",
    label: "Óbito ou lesão grave por objeto metálico em área de Ressonância Magnética",
  },
  {
    value: "OBITO_LESAO_GRAVE_CONTENCAO_FISICA_GRADES",
    label: "Óbito ou lesão grave por uso de contenção física ou grades da cama",
  },
  {
    value: "OBITO_LESAO_GRAVE_QUEIMADURA",
    label: "Óbito ou lesão grave por queimadura durante a assistência",
  },
  {
    value: "OBITO_LESAO_GRAVE_PERDA_AMOSTRA_BIOLOGICA",
    label: "Óbito ou lesão grave por perda irrecuperável de amostra biológica",
  },
  {
    value: "OBITO_LESAO_GRAVE_RECEM_NASCIDO_PARTO_BAIXO_RISCO",
    label: "Óbito ou lesão grave de recém-nascido em parto de baixo risco",
  },
  {
    value: "OBITO_LESAO_GRAVE_FALHA_EXAMES_LABORATORIAIS",
    label: "Óbito ou lesão grave por falha no acompanhamento de exames laboratoriais",
  },
  {
    value: "OBITO_LESAO_GRAVE_FALHA_EXAMES_RADIOLOGICOS",
    label: "Óbito ou lesão grave por falha no acompanhamento de exames radiológicos",
  },
  {
    value: "OBITO_LESAO_MATERNA_PARTO_BAIXO_RISCO",
    label: "Óbito ou lesão materna grave em parto de baixo risco",
  },
  {
    value: "PROCEDIMENTO_CIRURGICO_LOCAL_ERRADO",
    label: "Procedimento cirúrgico realizado em local errado",
  },
  {
    value: "PROCEDIMENTO_CIRURGICO_LADO_ERRADO",
    label: "Procedimento cirúrgico realizado no lado errado do corpo",
  },
  {
    value: "PROCEDIMENTO_CIRURGICO_PACIENTE_ERRADO",
    label: "Procedimento cirúrgico realizado no paciente errado",
  },
  {
    value: "QUEDA_RECEM_NASCIDO_PARTO",
    label: "Queda do recém-nascido durante o parto",
  },
  {
    value: "CIRURGIA_ERRADA_PACIENTE",
    label: "Realização de cirurgia errada em um paciente",
  },
  {
    value: "RETENCAO_CORPO_ESTRANHO_APOS_CIRURGIA",
    label: "Retenção não intencional de corpo estranho após a cirurgia",
  },
  {
    value: "SUICIDIO_TENTATIVA_DANO_AUTO_INFLIGIDO",
    label: "Suicídio, tentativa ou dano auto infligido com lesão grave durante a assistência",
  },
  {
    value: "TROCA_BEBES",
    label: "Troca de bebês",
  },
];

const CATEGORIA_INCIDENTE_OPTIONS = [
  { value: "ERRO_MEDICACAO", label: "Erro de medicação" },
  { value: "FALHA_IDENTIFICACAO", label: "Falha na identificação do paciente" },
  { value: "QUEDA", label: "Queda" },
  { value: "LESAO_PRESSAO", label: "Lesão por pressão" },
  {
    value: "INFECCAO_ASSISTENCIA",
    label: "Infecção relacionada à assistência",
  },
  { value: "PROCEDIMENTO_CIRURGICO", label: "Procedimento cirúrgico" },
  {
    value: "EQUIPAMENTO_DISPOSITIVO",
    label: "Equipamento ou dispositivo médico",
  },
  { value: "FALHA_DIAGNOSTICO", label: "Falha de diagnóstico" },
  { value: "COMUNICACAO", label: "Comunicação" },
  { value: "TRANSFUSAO_SANGUINEA", label: "Transfusão sanguínea" },
  { value: "DOCUMENTACAO_PRONTUARIO", label: "Documentação / prontuário" },
  { value: "OUTRO", label: "Outro" },
];

const ENVOLVIDOS_OPTIONS = [
  { value: "PROFISSIONAL_SAUDE", label: "Profissional de saúde" },
  { value: "PACIENTE", label: "Paciente" },
  { value: "FAMILIAR_ACOMPANHANTE", label: "Familiar/acompanhante" },
  { value: "EQUIPAMENTO", label: "Equipamento médico" },
  { value: "DISPOSITIVO_MEDICO", label: "Dispositivo médico" },
  { value: "MEDICAMENTO", label: "Medicamento" },
  { value: "SISTEMA", label: "Sistema de informação" },
  { value: "AMBIENTE_FISICO", label: "Ambiente físico" },
  { value: "OUTRO", label: "Outro" },
];

const PROTOCOLO_OPTIONS = [
  {
    value: "INVESTIGACAO_DIRETA",
    label: "Investigação Direta",
    desc: "ACR + Ishikawa + 5 Porquês + SMART — Para circunstâncias notificáveis, near misses, incidentes sem dano e incidentes com dano leve",
    title:
      "Se você estiver diante de um near miss (quase erro) ou de um incidente sem dano, mas que possua altíssimo potencial de dano ou grande oportunidade de aprendizado organizacional, mude a ferramenta e utilize o Protocolo de Londres",
  },
  {
    value: "INVESTIGACAO_SISTEMICA_PROFUNDA",
    label: "Investigação Sistêmica Profunda",
    desc: "Protocolo de Londres + SMART — Para incidentes com dano moderado, grave, óbitos e Never Events",
  },
];

// --------------------------------------------------------------------------
// SelectCardGroup — single ou múltiplo, igual ao protótipo
// --------------------------------------------------------------------------

type SelectOption = {
  value: string;
  label: string;
  desc?: string;
  title?: string;
};

function SelectCardGroup({
  options,
  value,
  onChange,
  multiple = false,
  disabled = false,
  testId,
  testIdPrefix,
}: {
  options: SelectOption[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  /** data-testid no container (grupos de seleção única) */
  testId?: string;
  /** prefixo de data-testid por item: "{testIdPrefix}-{value}" (grupos múltiplos) */
  testIdPrefix?: string;
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
    <div className={styles.selectGroup} data-testid={testId}>
      {options.map((o) => (
        <div
          key={o.value}
          className={styles.selectItem}
          data-checked={isChecked(o.value) ? "true" : "false"}
          data-disabled={disabled ? "true" : "false"}
          data-testid={testIdPrefix ? `${testIdPrefix}-${o.value}` : undefined}
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
  const [tiposIncidentes, setTiposIncidentes] = useState<string[]>(
    classificacaoExistente?.tipos_incidentes ?? [],
  );
  const [outroTipoIncidente, setOutroTipoIncidente] = useState(
    classificacaoExistente?.outro_tipo_incidente ?? "",
  );
  const [envolvidos, setEnvolvidos] = useState<string[]>(classificacaoExistente?.envolvidos ?? []);
  const [outroEnvolvido, setOutroEnvolvido] = useState(
    classificacaoExistente?.outro_envolvido ?? "",
  );
  const [observacoes, setObservacoes] = useState(classificacaoExistente?.observacoes ?? "");
  const [protocoloInvestigacao, setProtocoloInvestigacao] = useState(
    classificacaoExistente?.protocolo_investigacao ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdverso = classificacao === "EVENTO_ADVERSO";
  const isNeverEvent = grauDano === "NEVER_EVENT";

  const showTipoIncidente = !!classificacao && !isNeverEvent;

  function sugerirProtocolo(clasf: string, grau: string): string {
    if (!clasf) return "";
    const isSistemico = clasf === "EVENTO_ADVERSO" && !!grau && grau !== "LEVE";
    return isSistemico ? "INVESTIGACAO_SISTEMICA_PROFUNDA" : "INVESTIGACAO_DIRETA";
  }

  function handleClassificacaoChange(v: string | string[]) {
    const clasf = v as string;
    setClassificacao(clasf);
    setGrauDano("");
    setProtocoloInvestigacao(sugerirProtocolo(clasf, ""));
  }

  function handleGrauDanoChange(v: string | string[]) {
    const grau = v as string;
    setGrauDano(grau);
    setProtocoloInvestigacao(sugerirProtocolo(classificacao, grau));
  }
  const isOutroTipoIncidente = tiposIncidentes.includes("OUTRO");
  const isOutroEnvolvido = envolvidos.includes("OUTRO");
  const isRascunho = !!classificacaoExistente;

  const isFormValid =
    !!classificacao &&
    (!isAdverso || !!grauDano) &&
    (!isNeverEvent || !!tipoEspecifico) &&
    (!showTipoIncidente || tiposIncidentes.length > 0) &&
    (!showTipoIncidente || !isOutroTipoIncidente || !!outroTipoIncidente.trim()) &&
    envolvidos.length > 0 &&
    (!isOutroEnvolvido || !!outroEnvolvido.trim()) &&
    !!protocoloInvestigacao &&
    observacoes.length <= 400;

  // data_validade: @db.Timestamptz — ISO 8601 com timezone; new Date() é seguro
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
      if (showTipoIncidente && tiposIncidentes.length === 0) {
        setError("Selecione ao menos um tipo de incidente.");
        return;
      }
      if (showTipoIncidente && isOutroTipoIncidente && !outroTipoIncidente.trim()) {
        setError("Especifique o tipo de incidente 'Outro'.");
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
      if (!protocoloInvestigacao) {
        setError("Selecione o protocolo de investigação.");
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
      tipos_incidentes: showTipoIncidente ? tiposIncidentes : [],
      outro_tipo_incidente:
        showTipoIncidente && isOutroTipoIncidente ? outroTipoIncidente.trim() : null,
      envolvidos: envolvidos.length > 0 ? envolvidos : [],
      outro_envolvido: isOutroEnvolvido ? outroEnvolvido.trim() : null,
      grau_dano: isAdverso && grauDano ? grauDano : null,
      observacoes: observacoes.trim() || null,
      protocolo_investigacao: protocoloInvestigacao || null,
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
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Registar análise">
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h2 className={styles.modalTitle}>
              {isRascunho ? "Continuar classificação" : "Registrar análise"}
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
              onChange={handleClassificacaoChange}
              disabled={saving}
              testId="classificacao-tipo-input"
            />
          </div>

          {/* 2. Grau do dano — apenas para EVENTO_ADVERSO */}
          {isAdverso && (
            <div>
              <p className={styles.formQuestion}>Classifique o grau do dano</p>
              <SelectCardGroup
                options={GRAU_DANO_OPTIONS}
                value={grauDano}
                onChange={handleGrauDanoChange}
                disabled={saving}
                testId="classificacao-grau-dano-input"
              />
            </div>
          )}

          {/* 3. Tipo específico (apenas para NEVER_EVENT) */}
          {isNeverEvent && (
            <div>
              <p className={styles.formQuestion}>Tipo específico de Never Event</p>
              <SelectCardGroup
                options={TIPO_ESPECIFICO_OPTIONS}
                value={tipoEspecifico}
                onChange={(v) => setTipoEspecifico(v as string)}
                disabled={saving}
                testId="classificacao-never-event-input"
              />
            </div>
          )}

          {/* 4. Tipo de incidente (múltipla escolha) - exibido se não for Never Event */}
          {showTipoIncidente && (
            <div>
              <p className={styles.formQuestion}>Tipo de incidente</p>
              <SelectCardGroup
                options={CATEGORIA_INCIDENTE_OPTIONS}
                value={tiposIncidentes}
                onChange={(v) => setTiposIncidentes(v as string[])}
                multiple
                disabled={saving}
                testIdPrefix="classificacao-tipo-incidente"
              />

              {isOutroTipoIncidente && (
                <div style={{ marginTop: "10px" }}>
                  <input
                    type="text"
                    className={styles.modalInput}
                    placeholder="Especifique o tipo de incidente..."
                    value={outroTipoIncidente}
                    onChange={(e) => setOutroTipoIncidente(e.target.value)}
                    maxLength={200}
                    disabled={saving}
                    required
                    data-testid="classificacao-tipo-incidente-outro-input"
                  />
                </div>
              )}
            </div>
          )}

          {/* 5. Envolvidos (múltiplo) */}
          <div>
            <p className={styles.formQuestion}>O incidente envolve</p>
            <SelectCardGroup
              options={ENVOLVIDOS_OPTIONS}
              value={envolvidos}
              onChange={(v) => setEnvolvidos(v as string[])}
              multiple
              disabled={saving}
              testIdPrefix="classificacao-envolvidos"
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
                  data-testid="classificacao-envolvidos-outro-input"
                />
              </div>
            )}
          </div>

          {/* 6. Observações */}
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
              data-testid="classificacao-observacoes-input"
            />
            <small style={{ color: "#666" }}>{observacoes.length}/400</small>
          </div>

          {/* 7. Sugestão de protocolo de investigação */}
          {!!classificacao && (
            <div>
              <p className={styles.formQuestion}>Sugestão de protocolo de investigação</p>
              <SelectCardGroup
                options={PROTOCOLO_OPTIONS}
                value={protocoloInvestigacao}
                onChange={(v) => setProtocoloInvestigacao(v as string)}
                disabled={saving}
                testId="classificacao-protocolo-input"
              />
            </div>
          )}

          {error && <p className={styles.modalError}>{error}</p>}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button
            className={styles.saveBtn}
            onClick={() => handleSalvar(false)}
            disabled={saving || !isFormValid}
            data-testid="classificacao-salvar-button"
          >
            {saving ? "Salvando..." : "Salvar classificação"}
          </button>
        </div>
      </div>
    </div>
  );
}
