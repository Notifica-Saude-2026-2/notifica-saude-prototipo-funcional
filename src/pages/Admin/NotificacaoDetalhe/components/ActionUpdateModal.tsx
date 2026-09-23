import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { FiLock, FiPaperclip, FiX } from "react-icons/fi";
import { MdWarningAmber } from "react-icons/md";
import { SectionInfoBox } from "../../../../components/analise/SectionInfoBox";
import analiseStyles from "../../../../components/analise/Analise.module.css";
import { ModalBase } from "./ModalBase";
import type { ActionAttachment, ActionEffect, ActionPlan, ActionStatus } from "./ActionPlanModal";
import styles from "../NotificacaoDetalhe.module.css";

type Props = { action: ActionPlan; onClose: () => void; onSave: (action: ActionPlan) => void };

/** Formatos aceitos nos anexos de evidência. */
const EXTENSOES_ACEITAS = ["pdf", "docx", "png", "jpg", "jpeg"];
const ACCEPT_ATTR = ".pdf,.docx,.png,.jpg,.jpeg";
const FORMATOS_LABEL = "PDF, DOCX, PNG e JPG/JPEG";

/** true depois da 1ª tentativa de salvar: aí os campos obrigatórios vazios ficam em vermelho. */
const MostrarPendencias = createContext(false);

const extensao = (nome: string) => nome.split(".").pop()?.toLowerCase() ?? "";

/** Texto explicativo do campo (fundo azul claro + ícone de info) — mesmo padrão da análise. */
function Info({ children }: { children: ReactNode }) {
  return <SectionInfoBox className={analiseStyles.sectionInfoBoxField}>{children}</SectionInfoBox>;
}

export function ActionUpdateModal({ action, onClose, onSave }: Props) {
  const [draft, setDraft] = useState(action);
  const [error, setError] = useState("");
  const [erroAnexo, setErroAnexo] = useState("");
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const update = <K extends keyof ActionPlan>(field: K, value: ActionPlan[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setError("");
  };
  const readAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  const attachFiles = async (files: FileList | null) => {
    if (!files) return;
    // Só aceita PDF, DOCX, PNG e JPG/JPEG — os demais são recusados com aviso (o "accept" do input
    // só filtra a janela de seleção; arrastar ou "Todos os arquivos" ainda deixaria passar).
    const todos = Array.from(files);
    const recusados = todos.filter((f) => !EXTENSOES_ACEITAS.includes(extensao(f.name)));
    const aceitos = todos.filter((f) => EXTENSOES_ACEITAS.includes(extensao(f.name)));
    setErroAnexo(
      recusados.length > 0
        ? `${recusados.length === 1 ? "O arquivo" : "Os arquivos"} ${recusados.map((f) => `"${f.name}"`).join(", ")} não ${recusados.length === 1 ? "foi anexado" : "foram anexados"}: só são aceitos ${FORMATOS_LABEL}.`
        : "",
    );
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (aceitos.length === 0) return;
    const attachments: ActionAttachment[] = await Promise.all(
      aceitos.map(async (file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: await readAsDataUrl(file),
      })),
    );
    setDraft((current) => ({ ...current, attachments: [...current.attachments, ...attachments] }));
  };
  const save = () => {
    setTentouSalvar(true);
    const vazio = (v: string) => !v.trim();
    const faltando: string[] = [];
    if (!draft.effectiveness) faltando.push("A ação produziu o efeito esperado?");
    if (["Parcialmente", "Não"].includes(draft.effectiveness) && vazio(draft.effectivenessReason))
      faltando.push("Justificativa do efeito");
    if (draft.status === "Concluído") {
      if (!draft.realConclusionDate) faltando.push("Data real de conclusão");
      if (vazio(draft.completionDescription)) faltando.push("O que foi realizado?");
    }
    if (draft.status === "Atrasada") {
      if (vazio(draft.delayReason)) faltando.push("Motivo do atraso");
      if (!draft.newConclusionDate) faltando.push("Nova previsão de finalização");
    }
    if (draft.status === "Cancelada" && vazio(draft.cancellationReason))
      faltando.push("Motivo do cancelamento");
    if (faltando.length > 0) {
      setError(
        `Preencha os campos obrigatórios destacados. Falta${faltando.length > 1 ? "m" : ""}: ${faltando.join(", ")}.`,
      );
      // Leva a pessoa até o primeiro campo pendente.
      setTimeout(() => {
        document
          .querySelector('[data-pendencia="true"]')
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }
    onSave({
      ...draft,
      status: draft.effectiveness === "Sim" ? "Concluído" : draft.status,
      updatedAt: new Date().toISOString(),
    });
  };
  return (
    <ModalBase
      onClose={onClose}
      ariaLabel="Atualizar andamento da ação"
      modalStyle={{ maxWidth: 800 }}
    >
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Atualizar andamento da ação</h2>
      </div>
      <MostrarPendencias.Provider value={tentouSalvar}>
        <div className={`${styles.modalBody} ${styles.planoBody}`}>
          <UpdateField
            label="Ação selecionada"
            value={draft.what}
            onChange={() => undefined}
            readOnly
          />
          {/* Situação e data real de início lado a lado (uma coluna só no celular — ver .modalGrid). */}
          <div>
            <Info>
              Informe em que pé a ação está. Cada situação pede dados próprios:{" "}
              <strong>Concluído</strong> → data real de conclusão e o que foi realizado;{" "}
              <strong>Atrasada</strong> → motivo do atraso e nova previsão;{" "}
              <strong>Cancelada</strong> → motivo do cancelamento.
            </Info>
            <div className={styles.modalGrid}>
              <SelectField
                label="Situação da ação"
                value={draft.status}
                options={[
                  "Em andamento",
                  "Parcialmente concluído",
                  "Concluído",
                  "Atrasada",
                  "Cancelada",
                ]}
                onChange={(value) => update("status", value as ActionStatus)}
              />
              <UpdateField
                label="Data real de início"
                value={draft.realStartDate}
                type="date"
                onChange={(value) => update("realStartDate", value)}
              />
            </div>
          </div>
          <UpdateField
            label="Resultado observado"
            value={draft.observedResult}
            multiline
            onChange={(value) => update("observedResult", value)}
            info={
              <>
                Descreva o que se percebeu na prática depois da ação (ex.: número de quedas no mês,
                adesão ao novo protocolo).
                {draft.expectedResult?.trim() && (
                  <>
                    {" "}
                    Resultado esperado no plano:{" "}
                    <strong>&ldquo;{draft.expectedResult}&rdquo;</strong>.
                  </>
                )}
              </>
            }
          />
          <SelectField
            label="A ação produziu o efeito esperado?"
            info={
              <>
                Compare o resultado observado com o esperado. Se a resposta for{" "}
                <strong>&ldquo;Sim&rdquo;</strong>, a ação é marcada como <strong>Concluída</strong>{" "}
                automaticamente; se for &ldquo;Parcialmente&rdquo; ou &ldquo;Não&rdquo;, é preciso
                explicar o porquê.
              </>
            }
            required
            value={draft.effectiveness}
            options={["", "Sim", "Parcialmente", "Não"]}
            onChange={(value) => update("effectiveness", value as ActionEffect)}
          />
          {["Parcialmente", "Não"].includes(draft.effectiveness) && (
            <UpdateField
              label={
                draft.effectiveness === "Parcialmente"
                  ? "Por que o efeito foi parcial?"
                  : "Por que a ação não foi efetiva?"
              }
              required
              value={draft.effectivenessReason}
              multiline
              onChange={(value) => update("effectivenessReason", value)}
            />
          )}
          {draft.status === "Concluído" && (
            <>
              <UpdateField
                label="Data real de conclusão"
                required
                value={draft.realConclusionDate}
                type="date"
                onChange={(value) => update("realConclusionDate", value)}
              />
              <UpdateField
                label="O que foi realizado?"
                required
                value={draft.completionDescription}
                multiline
                onChange={(value) => update("completionDescription", value)}
              />
            </>
          )}
          {draft.status === "Atrasada" && (
            <>
              <UpdateField
                label="Motivo do atraso"
                required
                value={draft.delayReason}
                multiline
                onChange={(value) => update("delayReason", value)}
              />
              <UpdateField
                label="Nova previsão de finalização"
                required
                value={draft.newConclusionDate}
                type="date"
                onChange={(value) => update("newConclusionDate", value)}
              />
            </>
          )}
          {draft.status === "Cancelada" && (
            <UpdateField
              label="Motivo do cancelamento"
              required
              value={draft.cancellationReason}
              multiline
              onChange={(value) => update("cancellationReason", value)}
            />
          )}
          <UpdateField
            label="Onde está armazenada a evidência?"
            value={draft.evidenceLocation}
            multiline
            placeholder="Ex.: Pasta compartilhada, protocolo ou link."
            onChange={(value) => update("evidenceLocation", value)}
            info={
              <>
                Informe onde fica guardada a comprovação de que a ação foi executada, para que
                qualquer pessoa consiga consultá-la depois.
                {draft.proof?.trim() && (
                  <>
                    {" "}
                    Comprovação definida no plano: <strong>&ldquo;{draft.proof}&rdquo;</strong>.
                  </>
                )}
              </>
            }
          />
          <div>
            <p className={styles.formQuestion}>Anexar arquivos</p>
            <Info>
              Anexe documentos ou imagens que comprovem a execução da ação (ex.: lista de presença,
              fotos, protocolo publicado). Formatos aceitos: <strong>{FORMATOS_LABEL}</strong>.
            </Info>
            <input
              ref={fileInputRef}
              className={styles.visuallyHiddenFile}
              id="action-update-attachments"
              type="file"
              multiple
              accept={ACCEPT_ATTR}
              onChange={(event) => void attachFiles(event.target.files)}
              data-testid="input-anexos"
            />
            <div className={styles.attachRow}>
              <label htmlFor="action-update-attachments" className={styles.attachButton}>
                <FiPaperclip size={14} aria-hidden="true" /> Escolher arquivos
              </label>
              <span className={styles.attachHint}>{FORMATOS_LABEL}</span>
            </div>
            {erroAnexo && (
              <p className={styles.modalFieldError} role="alert">
                <MdWarningAmber size={15} aria-hidden="true" /> {erroAnexo}
              </p>
            )}
            {draft.attachments.length > 0 && (
              <ul className={styles.attachList}>
                {draft.attachments.map((attachment, i) => (
                  <li key={`${attachment.name}-${attachment.size}-${i}`}>
                    <FiPaperclip size={13} aria-hidden="true" />
                    <span className={styles.attachName}>{attachment.name}</span>
                    <button
                      type="button"
                      className={styles.attachRemove}
                      aria-label={`Remover ${attachment.name}`}
                      title="Remover anexo"
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          attachments: current.attachments.filter((_, j) => j !== i),
                        }))
                      }
                    >
                      <FiX size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {error && (
            <p className={styles.modalError} role="alert">
              {error}
            </p>
          )}
        </div>
      </MostrarPendencias.Provider>
      <div className={styles.modalFooter}>
        <button className={styles.cancelBtn} onClick={onClose}>
          Cancelar
        </button>
        <button className={styles.saveBtn} onClick={save}>
          Salvar atualização
        </button>
      </div>
    </ModalBase>
  );
}

function UpdateField({
  label,
  value,
  onChange,
  type = "text",
  multiline = false,
  readOnly = false,
  placeholder,
  required = false,
  info,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  multiline?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  required?: boolean;
  info?: ReactNode;
}) {
  const mostrar = useContext(MostrarPendencias);
  const pendente = mostrar && required && !readOnly && !value.trim();
  const classe = pendente ? `${styles.modalInput} ${styles.modalInputError}` : styles.modalInput;
  return (
    <div data-pendencia={pendente ? "true" : undefined}>
      <p className={styles.formQuestion}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </p>
      {info && <Info>{info}</Info>}
      {readOnly ? (
        // Campo travado (só leitura): visual de bloqueado + cadeado, pra não parecer editável.
        <div
          className={styles.modalLocked}
          aria-readonly="true"
          title="Este campo não pode ser alterado aqui"
        >
          <span className={styles.modalLockedText}>{value || "Não informado"}</span>
          <FiLock className={styles.modalLockedIcon} size={14} aria-hidden="true" />
        </div>
      ) : multiline ? (
        <textarea
          className={classe}
          rows={3}
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className={classe}
          type={type}
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {pendente && <CampoObrigatorio />}
    </div>
  );
}
function SelectField({
  label,
  value,
  options,
  onChange,
  required = false,
  info,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  required?: boolean;
  info?: ReactNode;
}) {
  const mostrar = useContext(MostrarPendencias);
  const pendente = mostrar && required && !value;
  return (
    <div data-pendencia={pendente ? "true" : undefined}>
      <p className={styles.formQuestion}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </p>
      {info && <Info>{info}</Info>}
      <select
        className={
          pendente ? `${styles.modalSelect} ${styles.modalInputError}` : styles.modalSelect
        }
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option || "Selecione"}
          </option>
        ))}
      </select>
      {pendente && <CampoObrigatorio />}
    </div>
  );
}

/** Mensagem abaixo de um campo obrigatório que ficou vazio. */
function CampoObrigatorio() {
  return (
    <p className={styles.modalFieldError} role="alert">
      <MdWarningAmber size={15} aria-hidden="true" /> Campo obrigatório.
    </p>
  );
}
