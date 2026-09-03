import { useState } from "react";
import { ModalBase } from "./ModalBase";
import styles from "../NotificacaoDetalhe.module.css";
import { createEmptyActionPlan } from "../../../../types/actionPlan";
import type {
  ActionAttachment,
  ActionEffect,
  ActionPlan,
  ActionStatus,
} from "../../../../types/actionPlan";
import { TableField } from "../../../../components/analise/TableField";

export type {
  ActionPlan,
  ActionStatus,
  ActionEffect,
  ActionAttachment,
} from "../../../../types/actionPlan";

type Props = {
  onClose: () => void;
  onSave: (plan: ActionPlan) => void;
  /** Pré-preenche "O que será feito" (ex.: recomendação vinda da Análise ACR/Londres). */
  initialWhat?: string;
  /** Marca a ação como originada de uma recomendação da Análise, para não sugeri-la de novo. */
  origemRecomendacao?: string;
};

export function ActionPlanModal({ onClose, onSave, initialWhat, origemRecomendacao }: Props) {
  const [plan, setPlan] = useState<ActionPlan>({
    ...createEmptyActionPlan(),
    what: initialWhat ?? "",
  });
  const [error, setError] = useState("");

  function update<K extends keyof ActionPlan>(field: K, value: ActionPlan[K]) {
    setPlan((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function save() {
    const required = [
      plan.what,
      plan.where,
      plan.responsible,
      plan.startDate,
      plan.conclusionDate,
      plan.proof,
      plan.expectedResult,
      plan.verification,
      plan.verificationDate,
    ];
    const resourceItemsPreenchidos =
      plan.resourceItems.length > 0 &&
      plan.resourceItems.every((item) => (item.pedido ?? "").trim() && (item.preco ?? "").trim());
    const missingConditionalDetail =
      (plan.resource === "Sim" && !resourceItemsPreenchidos) ||
      (plan.approval === "Sim" && !plan.approvalDetail.trim()) ||
      (plan.indicator === "Sim" && !plan.indicatorDetail.trim());

    if (required.some((value) => !value.trim()) || missingConditionalDetail) {
      setError("Preencha todos os campos obrigatórios antes de salvar o plano de ação.");
      return;
    }

    onSave(origemRecomendacao ? { ...plan, origemRecomendacao } : plan);
  }

  return (
    <ModalBase onClose={onClose} ariaLabel="Registrar plano de ação" modalStyle={{ maxWidth: 760 }}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>Registrar plano de ação</h2>
      </div>

      <div className={styles.modalBody}>
        <p className={styles.actionPlanIntro}>
          Registre as ações necessárias para tratar o problema identificado.
        </p>
        {error && <p className={styles.modalError}>{error}</p>}

        <TextField
          label="1. O que será feito?"
          value={plan.what}
          onChange={(value) => update("what", value)}
          required
          multiline
        />
        <TextField
          label="2. Onde será feito?"
          value={plan.where}
          onChange={(value) => update("where", value)}
          required
        />
        <TextField
          label="3. Quem será responsável?"
          value={plan.responsible}
          onChange={(value) => update("responsible", value)}
          required
        />
        <div className={styles.modalGrid}>
          <TextField
            label="4. Previsão de início"
            value={plan.startDate}
            onChange={(value) => update("startDate", value)}
            required
            type="date"
          />
          <TextField
            label="5. Previsão de conclusão"
            value={plan.conclusionDate}
            onChange={(value) => update("conclusionDate", value)}
            required
            type="date"
          />
        </div>
        <div>
          <p className={styles.formQuestion}>Situação da ação</p>
          <select
            className={styles.modalSelect}
            value={plan.status}
            onChange={(event) => update("status", event.target.value as ActionStatus)}
          >
            <option>Em andamento</option>
            <option>Parcialmente concluído</option>
            <option>Concluído</option>
            <option>Atrasada</option>
            <option>Cancelada</option>
          </select>
        </div>
        <ChoiceField
          label="6. Precisa de recurso para executar essa ação?"
          value={plan.resource}
          onChange={(value) => update("resource", value)}
        />
        {plan.resource === "Sim" && (
          <div>
            <p className={styles.formQuestion}>Se sim, qual e quanto irá custar? *</p>
            <TableField
              field={{
                id: "resource_items",
                label: "",
                type: "table",
                repeatable: true,
                minRows: 1,
                columns: [
                  { id: "pedido", label: "Pedido / item", type: "text" },
                  { id: "preco", label: "Preço estimado", type: "text" },
                ],
              }}
              value={plan.resourceItems}
              onChange={(rows) => update("resourceItems", rows)}
              data-testid="action-plan-resource-items"
            />
          </div>
        )}
        <ChoiceField
          label="7. Depende da aprovação da Alta Gestão?"
          value={plan.approval}
          onChange={(value) => update("approval", value)}
        />
        {plan.approval === "Sim" && (
          <TextField
            label="Se sim, qual?"
            value={plan.approvalDetail}
            onChange={(value) => update("approvalDetail", value)}
            required
          />
        )}
        <TextField
          label="8. Como vamos comprovar que foi feito?"
          value={plan.proof}
          onChange={(value) => update("proof", value)}
          required
          multiline
        />
        <TextField
          label="9. Qual resultado esperamos?"
          value={plan.expectedResult}
          onChange={(value) => update("expectedResult", value)}
          required
          multiline
        />
        <TextField
          label="10. Como vamos saber se funcionou?"
          value={plan.verification}
          onChange={(value) => update("verification", value)}
          required
          multiline
        />
        <TextField
          label="11. Quando verificar o resultado?"
          value={plan.verificationDate}
          onChange={(value) => update("verificationDate", value)}
          required
        />
        <ChoiceField
          label="12. Esta ação irá gerar um indicador de acompanhamento?"
          value={plan.indicator}
          onChange={(value) => update("indicator", value)}
        />
        {plan.indicator === "Sim" && (
          <TextField
            label="Qual indicador?"
            value={plan.indicatorDetail}
            onChange={(value) => update("indicatorDetail", value)}
            required
          />
        )}
      </div>

      <div className={styles.modalFooter}>
        <button className={styles.cancelBtn} onClick={onClose}>
          Cancelar
        </button>
        <button className={styles.saveBtn} onClick={save}>
          Salvar plano de ação
        </button>
      </div>
    </ModalBase>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  multiline = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  multiline?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <p className={styles.formQuestion}>
        {label}
        {required && " *"}
      </p>
      {multiline ? (
        <textarea
          className={styles.modalInput}
          rows={3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className={styles.modalInput}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}

function ChoiceField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: "Sim" | "Não";
  onChange: (value: "Sim" | "Não") => void;
}) {
  return (
    <fieldset className={styles.actionPlanChoice}>
      <legend className={styles.formQuestion}>{label}</legend>
      {(["Não", "Sim"] as const).map((option) => (
        <label key={option}>
          <input
            type="radio"
            name={label}
            checked={value === option}
            onChange={() => onChange(option)}
          />{" "}
          {option}
        </label>
      ))}
    </fieldset>
  );
}
