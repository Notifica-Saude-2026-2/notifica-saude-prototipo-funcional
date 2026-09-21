import { useState } from "react";
import { ModalBase } from "./ModalBase";
import type { ActionAttachment, ActionEffect, ActionPlan, ActionStatus } from "./ActionPlanModal";
import styles from "../NotificacaoDetalhe.module.css";

type Props = { action: ActionPlan; onClose: () => void; onSave: (action: ActionPlan) => void };

export function ActionUpdateModal({ action, onClose, onSave }: Props) {
  const [draft, setDraft] = useState(action);
  const [error, setError] = useState("");
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
    const attachments: ActionAttachment[] = await Promise.all(
      Array.from(files).map(async (file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: await readAsDataUrl(file),
      })),
    );
    setDraft((current) => ({ ...current, attachments: [...current.attachments, ...attachments] }));
  };
  const save = () => {
    const invalid =
      !draft.effectiveness ||
      (draft.status === "Concluído" &&
        (!draft.realConclusionDate || !draft.completionDescription.trim())) ||
      (draft.status === "Atrasada" && (!draft.delayReason.trim() || !draft.newConclusionDate)) ||
      (draft.status === "Cancelada" && !draft.cancellationReason.trim()) ||
      (["Parcialmente", "Não"].includes(draft.effectiveness) && !draft.effectivenessReason.trim());
    if (invalid) {
      setError("Preencha os campos obrigatórios da situação selecionada.");
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
      <div className={styles.modalBody}>
        <UpdateField
          label="Ação selecionada"
          value={draft.what}
          onChange={() => undefined}
          readOnly
        />
        <SelectField
          label="Situação da ação"
          value={draft.status}
          options={["Em andamento", "Parcialmente concluído", "Concluído", "Atrasada", "Cancelada"]}
          onChange={(value) => update("status", value as ActionStatus)}
        />
        <UpdateField
          label="Data real de início"
          value={draft.realStartDate}
          type="date"
          onChange={(value) => update("realStartDate", value)}
        />
        <UpdateField
          label="Resultado observado"
          value={draft.observedResult}
          multiline
          onChange={(value) => update("observedResult", value)}
        />
        <SelectField
          label="A ação produziu o efeito esperado?"
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
        />
        <div>
          <p className={styles.formQuestion}>Anexar arquivos</p>
          <input
            className={styles.actionAttachmentInput}
            type="file"
            multiple
            onChange={(event) => void attachFiles(event.target.files)}
          />
          {draft.attachments.length > 0 && (
            <div className={styles.actionAttachmentList}>
              {draft.attachments.map((attachment) => (
                <span key={`${attachment.name}-${attachment.size}`}>{attachment.name}</span>
              ))}
            </div>
          )}
        </div>
        {error && <p className={styles.modalError}>{error}</p>}
      </div>
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  multiline?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <p className={styles.formQuestion}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </p>
      {multiline ? (
        <textarea
          className={styles.modalInput}
          rows={3}
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className={styles.modalInput}
          type={type}
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}
function SelectField({
  label,
  value,
  options,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <p className={styles.formQuestion}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </p>
      <select
        className={styles.modalSelect}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option || "Selecione"}
          </option>
        ))}
      </select>
    </div>
  );
}
