import { useState, useEffect } from "react";
import { fetchSetoresParaUnidade } from "../../../../hooks/useCamposFormulario";
import type { UpdateNotificacaoPayload } from "../../../../services/notificacaoDetalheService";
import type { NotificacaoDetalheDTO, NotificacaoRaw } from "../../../../types/notificacaoDetalhe";
import { CAMPO_IDS } from "../../../../types/notificacaoDetalhe";
import { ModalBase } from "./ModalBase";
import styles from "../NotificacaoDetalhe.module.css";

// --------------------------------------------------------------------------
// Constantes de opções (alinhadas ao protótipo)
// --------------------------------------------------------------------------

const TURNO_OPTIONS = [
  { id: "66666666-6666-4666-b666-000000000017", label: "Manhã (07h-13h)" },
  { id: "66666666-6666-4666-b666-000000000018", label: "Tarde (13h-19h)" },
  { id: "66666666-6666-4666-b666-000000000019", label: "Noite (19h-07h)" },
  { id: "66666666-6666-4666-b666-000000000020", label: "Não sei informar" },
];

const FAIXA_ETARIA_OPTIONS = [
  { id: "66666666-6666-4666-b666-000000000006", label: "Recém-nascido" },
  { id: "66666666-6666-4666-b666-000000000007", label: "0-1 ano" },
  { id: "66666666-6666-4666-b666-000000000008", label: "2-12 anos" },
  { id: "66666666-6666-4666-b666-000000000009", label: "13-17 anos" },
  { id: "66666666-6666-4666-b666-000000000010", label: "18-59 anos" },
  { id: "66666666-6666-4666-b666-000000000011", label: "60 anos ou mais" },
  { id: "66666666-6666-4666-b666-000000000012", label: "Não sei informar" },
];

const SEXO_OPTIONS = [
  { id: "66666666-6666-4666-b666-000000000013", label: "Feminino" },
  { id: "66666666-6666-4666-b666-000000000014", label: "Masculino" },
  { id: "66666666-6666-4666-b666-000000000015", label: "Outro" },
  { id: "66666666-6666-4666-b666-000000000016", label: "Não sei informar" },
];

type EditModalProps = {
  detalhe: NotificacaoDetalheDTO;
  rawData: NotificacaoRaw;
  saving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
  onClose: () => void;
  onSave: (payload: UpdateNotificacaoPayload) => void;
};

export function EditModal({
  detalhe,
  rawData,
  saving,
  saveError,
  saveSuccess,
  onClose,
  onSave,
}: EditModalProps) {
  const toDateInput = (ptDate: string) => {
    const parts = ptDate.split("/");
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return "";
  };

  function findOpcaoId(campoId: string): string {
    return rawData.respostas.find((r) => r.campo_id === campoId)?.valor_opcao_id ?? "";
  }

  const [dataIncidente, setDataIncidente] = useState(toDateInput(detalhe.dataIncidente));
  const [turnoId, setTurnoId] = useState(findOpcaoId(CAMPO_IDS.TURNO));
  const [unidadeId] = useState(rawData.unidade_id);
  const [setorId, setSetorId] = useState(rawData.setor_id);
  const [setorOutroText, setSetorOutroText] = useState<string>(
    rawData.respostas.find((r) => r.campo_id === CAMPO_IDS.SETOR)?.valor_texto ?? "",
  );
  const [idadeId, setIdadeId] = useState(findOpcaoId(CAMPO_IDS.IDADE));
  const [sexoId, setSexoId] = useState(findOpcaoId(CAMPO_IDS.SEXO));
  const [sexoOutroText, setSexoOutroText] = useState<string>(
    rawData.respostas.find((r) => r.campo_id === CAMPO_IDS.SEXO)?.valor_texto ?? "",
  );
  const [nomeNotificante, setNomeNotificante] = useState<string>(
    rawData.respostas.find((r) => r.campo_id === CAMPO_IDS.NOME_OPC)?.valor_texto ?? "",
  );
  const [contatoNotificante, setContatoNotificante] = useState<string>(
    rawData.respostas.find((r) => r.campo_id === CAMPO_IDS.CONTATO_OPC)?.valor_texto ?? "",
  );

  const [localError, setLocalError] = useState<string | null>(null);

  const [setores, setSetores] = useState<{ id: string; valor: string }[]>([]);

  useEffect(() => {
    if (unidadeId) {
      fetchSetoresParaUnidade(unidadeId).then(setSetores);
    }
  }, [unidadeId]);

  function handleSave() {
    setLocalError(null);

    if (!dataIncidente) {
      setLocalError("A data do incidente é obrigatória.");
      return;
    }
    if (dataIncidente && new Date(dataIncidente) > new Date()) {
      setLocalError("A data do incidente não pode ser futura.");
      return;
    }
    if (!turnoId) {
      setLocalError("O turno é obrigatório.");
      return;
    }
    if (!setorId) {
      setLocalError("O setor é obrigatório.");
      return;
    }

    const respostas = [];

    if (turnoId) {
      respostas.push({ campo_id: CAMPO_IDS.TURNO, valor_opcao_id: turnoId });
    }

    if (detalhe.paciente.envolvido) {
      if (!idadeId) {
        setLocalError("A idade do paciente é obrigatória.");
        return;
      }
      if (!sexoId) {
        setLocalError("O sexo do paciente é obrigatório.");
        return;
      }
      respostas.push({ campo_id: CAMPO_IDS.IDADE, valor_opcao_id: idadeId });

      const isSexoOutro =
        SEXO_OPTIONS.find((s) => s.id === sexoId)?.label.toLowerCase() === "outro";

      if (isSexoOutro && !sexoOutroText.trim()) {
        setLocalError("Por favor, especifique o sexo/gênero.");
        return;
      }

      const resposta: {
        campo_id: string;
        valor_opcao_id: string;
        valor?: string;
      } = {
        campo_id: CAMPO_IDS.SEXO,
        valor_opcao_id: sexoId,
      };
      if (isSexoOutro && sexoOutroText.trim()) resposta.valor = sexoOutroText.trim();
      respostas.push(resposta);
    }

    const isSetorOutro = setores.find((s) => s.id === setorId)?.valor.toLowerCase() === "outro";

    if (isSetorOutro && !setorOutroText.trim()) {
      setLocalError("Por favor, especifique o setor.");
      return;
    }

    if (isSetorOutro && setorOutroText.trim()) {
      respostas.push({
        campo_id: CAMPO_IDS.SETOR,
        valor: setorOutroText.trim(),
      });
    }

    if (nomeNotificante.trim()) {
      respostas.push({ campo_id: CAMPO_IDS.NOME_OPC, valor: nomeNotificante.trim() });
    }

    if (contatoNotificante.trim()) {
      respostas.push({ campo_id: CAMPO_IDS.CONTATO_OPC, valor: contatoNotificante.trim() });
    }

    onSave({
      data_incidente: dataIncidente ? new Date(dataIncidente).toISOString() : undefined,
      unidade_id: unidadeId,
      setor_id: setorId,
      respostas: respostas.length > 0 ? respostas : undefined,
    });
  }

  return (
    <ModalBase onClose={onClose} ariaLabel="Editar informações gerais">
      <>
        {/* Cabeçalho do modal */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Editar informações gerais</h2>
          <p className={styles.modalSubtitle}>Altere os dados da notificação conforme necessário</p>
        </div>

        {/* Corpo rolável */}
        <div className={styles.modalBody}>
          {/* Data + Turno */}
          <div className={styles.modalGrid}>
            <div className={styles.infoItem}>
              <p className={styles.formQuestion}>Data do incidente</p>
              <input
                type="date"
                className={styles.modalInput}
                data-testid="field-data-incidente"
                value={dataIncidente}
                onChange={(e) => setDataIncidente(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                disabled={saving}
              />
            </div>
            <div>
              <p className={styles.formQuestion}>Turno</p>
              <select
                className={styles.modalInput}
                data-testid="field-turno"
                value={turnoId}
                onChange={(e) => setTurnoId(e.target.value)}
                disabled={saving}
              >
                <option value="" disabled hidden>
                  Selecione
                </option>
                {TURNO_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Instituição + Setor */}
          <div className={styles.modalGrid}>
            <div>
              <p className={styles.formQuestion}>Instituição</p>
              <select
                className={styles.modalInput}
                data-testid="field-unidade"
                value={unidadeId}
                disabled={true}
              >
                <option value={rawData.unidade_id}>{detalhe.unidade}</option>
              </select>
            </div>
            <div>
              <p className={styles.formQuestion}>Setor</p>
              <select
                className={styles.modalInput}
                data-testid="field-setor"
                value={setorId}
                onChange={(e) => {
                  setSetorId(e.target.value);
                  setSetorOutroText("");
                }}
                disabled={saving || !unidadeId}
              >
                <option value="" disabled hidden>
                  Selecione
                </option>
                {setores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.valor}
                  </option>
                ))}
              </select>
              {setores.find((s) => s.id === setorId)?.valor.toLowerCase() === "outro" && (
                <div style={{ marginTop: "8px" }}>
                  <p className={styles.formQuestion}>Especifique o setor</p>
                  <input
                    type="text"
                    className={styles.modalInput}
                    data-testid="field-setor-outro"
                    value={setorOutroText}
                    onChange={(e) => setSetorOutroText(e.target.value)}
                    placeholder="Digite o nome do setor"
                    disabled={saving}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Faixa etária + Sexo (apenas se paciente envolvido) */}
          {detalhe.paciente.envolvido && (
            <div className={styles.modalGrid}>
              <div>
                <p className={styles.formQuestion}>Idade do paciente</p>
                <select
                  className={styles.modalInput}
                  data-testid="field-idade"
                  value={idadeId}
                  onChange={(e) => setIdadeId(e.target.value)}
                  disabled={saving}
                >
                  <option value="" disabled hidden>
                    Selecione
                  </option>
                  {FAIXA_ETARIA_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className={styles.formQuestion}>Sexo</p>
                <select
                  className={styles.modalInput}
                  data-testid="field-sexo"
                  value={sexoId}
                  onChange={(e) => {
                    setSexoId(e.target.value);
                    setSexoOutroText("");
                  }}
                  disabled={saving}
                >
                  <option value="" disabled hidden>
                    Selecione
                  </option>
                  {SEXO_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {SEXO_OPTIONS.find((s) => s.id === sexoId)?.label.toLowerCase() === "outro" && (
                  <div style={{ marginTop: "8px" }}>
                    <p className={styles.formQuestion}>Especifique</p>
                    <input
                      type="text"
                      className={styles.modalInput}
                      data-testid="field-sexo-outro"
                      value={sexoOutroText}
                      onChange={(e) => setSexoOutroText(e.target.value)}
                      placeholder="Descreva o sexo/gênero"
                      disabled={saving}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Nome e contato do notificante (opcionais) */}
          <div className={styles.modalGrid}>
            <div>
              <p className={styles.formQuestion}>Nome do notificante</p>
              <input
                type="text"
                className={styles.modalInput}
                data-testid="field-nome-notificante"
                value={nomeNotificante}
                onChange={(e) => setNomeNotificante(e.target.value)}
                placeholder="Nome do notificante (opcional)"
                disabled={saving}
              />
            </div>
            <div>
              <p className={styles.formQuestion}>Celular/E-mail</p>
              <input
                type="text"
                className={styles.modalInput}
                data-testid="field-contato-notificante"
                value={contatoNotificante}
                onChange={(e) => setContatoNotificante(e.target.value)}
                placeholder="Celular ou e-mail (opcional)"
                disabled={saving}
              />
            </div>
          </div>

          {(localError || saveError) && (
            <p className={styles.modalError}>{localError || saveError}</p>
          )}
          {saveSuccess && <p className={styles.modalSuccess}>Alterações salvas com sucesso.</p>}
        </div>

        {/* Rodapé */}
        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} data-testid="btn-edit-cancelar" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button className={styles.saveBtn} data-testid="btn-edit-salvar" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </>
    </ModalBase>
  );
}
