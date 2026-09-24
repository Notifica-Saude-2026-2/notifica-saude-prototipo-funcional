import { useState, type ReactNode } from "react";
import { MdWarningAmber } from "react-icons/md";
import { ModalBase } from "./ModalBase";
import styles from "../NotificacaoDetalhe.module.css";
import {
  PLANO_LIMITES,
  camposPendentesPlano,
  createEmptyActionPlan,
  datasPlanoInvalidas,
  limitesExcedidosPlano,
  nomesResponsaveis,
} from "../../../../types/actionPlan";
import type { ActionPlan, ActionStatus, ResponsavelRow } from "../../../../types/actionPlan";
import { TableField } from "../../../../components/analise/TableField";
import { SectionInfoBox } from "../../../../components/analise/SectionInfoBox";
import analiseStyles from "../../../../components/analise/Analise.module.css";
import {
  FUNCAO_PROFISSIONAL_OPTIONS,
  SETOR_HOSPITALAR_OPTIONS,
} from "../../../../constants/analiseSchema";
import { OUTRO_MAX_LENGTH } from "../../../../constants/limites";

export type {
  ActionPlan,
  ActionStatus,
  ActionEffect,
  ActionAttachment,
} from "../../../../types/actionPlan";

type Props = {
  onClose: () => void;
  onSave: (plan: ActionPlan) => void;
  /** Pré-preenche "O que será feito" (ex.: recomendação vinda da análise do incidente). */
  initialWhat?: string;
  /** Marca a ação como originada de uma recomendação da Análise, para não sugeri-la de novo. */
  origemRecomendacao?: string;
  /** Edição de uma ação já existente (ex.: completar uma ação pré-criada a partir de uma
      recomendação da Análise, que chega só com o "O que será feito"). */
  initialPlan?: ActionPlan;
};

const L = PLANO_LIMITES;
const OUTRO = "__outro__";

/** Colunas da tabela "Quem será responsável?" — mesma lógica do condutor da análise. */
const RESPONSAVEL_COLUMNS = [
  {
    id: "nome",
    label: "Nome",
    type: "text" as const,
    placeholder: "Nome completo",
    maxLength: L.nomeResponsavel,
    // Larguras em % (a tabela ocupa 100% do modal); o nome fica com mais espaço.
    tableWidth: "40%",
  },
  {
    id: "funcao",
    label: "Função",
    type: "choice" as const,
    options: FUNCAO_PROFISSIONAL_OPTIONS,
    allowOther: true,
    tableWidth: "30%",
  },
  {
    id: "setor",
    label: "Setor",
    type: "choice" as const,
    options: SETOR_HOSPITALAR_OPTIONS,
    allowOther: true,
    tableWidth: "30%",
  },
];

/** Plano inicial do formulário — converte dados antigos (responsável em texto livre). */
function planoInicial(
  initialPlan: ActionPlan | undefined,
  initialWhat: string | undefined,
): ActionPlan {
  if (!initialPlan) {
    return { ...createEmptyActionPlan(), what: initialWhat ?? "", responsaveis: [{}] };
  }
  const responsaveis: ResponsavelRow[] =
    initialPlan.responsaveis && initialPlan.responsaveis.length > 0
      ? initialPlan.responsaveis
      : [initialPlan.responsible ? { nome: initialPlan.responsible } : {}];
  return { ...initialPlan, responsaveis };
}

/** Células vazias de uma tabela ("linha:coluna"), pra destacar em vermelho depois de tentar salvar. */
function celulasVazias(rows: Record<string, string>[], colunas: string[]) {
  return rows.flatMap((row, i) =>
    colunas.filter((c) => !(row[c] ?? "").trim()).map((c) => `${i}:${c}`),
  );
}

export function ActionPlanModal({
  onClose,
  onSave,
  initialWhat,
  origemRecomendacao,
  initialPlan,
}: Props) {
  const editando = !!initialPlan;
  // Ação que veio da Análise e ainda não foi completada: o modal vira "Completar plano de ação".
  const completando = editando && camposPendentesPlano(initialPlan).length > 0;
  const titulo = completando
    ? "Completar plano de ação"
    : editando
      ? "Editar plano de ação"
      : "Registrar plano de ação";
  const [plan, setPlan] = useState<ActionPlan>(() => planoInicial(initialPlan, initialWhat));
  // "Onde será feito?": um dos setores ou "Outro" (texto livre). Começa em "Outro" quando o valor
  // salvo não é um dos setores da lista.
  const [ondeOutro, setOndeOutro] = useState(
    () => !!initialPlan?.where && !SETOR_HOSPITALAR_OPTIONS.includes(initialPlan.where),
  );
  const [error, setError] = useState("");
  // Só destaca campos vazios depois da 1ª tentativa de salvar (não enquanto a pessoa preenche).
  const [tentouSalvar, setTentouSalvar] = useState(false);

  function update<K extends keyof ActionPlan>(field: K, value: ActionPlan[K]) {
    setPlan((current) => ({ ...current, [field]: value }));
    setError("");
  }

  const vazio = (v: string | undefined) => tentouSalvar && !(v ?? "").trim();
  const datasInvalidas = datasPlanoInvalidas(plan);

  function save() {
    setTentouSalvar(true);
    const faltando = camposPendentesPlano(plan);
    const acimaDoLimite = limitesExcedidosPlano(plan, {
      funcao: FUNCAO_PROFISSIONAL_OPTIONS,
      setor: SETOR_HOSPITALAR_OPTIONS,
      outroMax: OUTRO_MAX_LENGTH,
    });
    const problemas: string[] = [];
    if (faltando.length > 0) {
      problemas.push(
        `Preencha os campos obrigatórios. Falta${faltando.length > 1 ? "m" : ""}: ${faltando.join(", ")}.`,
      );
    }
    if (datasInvalidas) {
      problemas.push("A previsão de início não pode ser posterior à previsão de conclusão.");
    }
    if (acimaDoLimite.length > 0) {
      problemas.push(`Textos acima do limite de caracteres: ${acimaDoLimite.join("; ")}.`);
    }
    if (problemas.length > 0) {
      setError(problemas.join(" "));
      return;
    }

    const final: ActionPlan = { ...plan, responsible: nomesResponsaveis(plan) };
    onSave(origemRecomendacao ? { ...final, origemRecomendacao } : final);
  }

  const celulasResponsaveis = tentouSalvar
    ? celulasVazias(plan.responsaveis ?? [], ["nome", "funcao", "setor"])
    : [];
  const celulasRecurso = tentouSalvar ? celulasVazias(plan.resourceItems, ["pedido", "preco"]) : [];

  return (
    <ModalBase onClose={onClose} ariaLabel={titulo} modalStyle={{ maxWidth: 820 }}>
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>{titulo}</h2>
      </div>

      <div className={`${styles.modalBody} ${styles.planoBody}`}>
        <p className={styles.actionPlanIntro}>
          {completando
            ? "Esta ação foi criada a partir de uma recomendação da análise e ainda não está completa. Preencha os demais campos para que ela possa ser acompanhada."
            : "Registre as ações necessárias para tratar o problema identificado."}
        </p>
        {error && (
          <p className={styles.modalError} role="alert">
            {error}
          </p>
        )}

        <TextField
          label="1. O que será feito?"
          value={plan.what}
          onChange={(value) => update("what", value)}
          required
          multiline
          maxLength={L.textoLongo}
          invalid={vazio(plan.what)}
          info='Descreva a ação concreta que vai tratar a causa identificada — o que precisa acontecer, e não só o objetivo (ex.: "Instalar sinalização de piso molhado nos corredores" em vez de "Melhorar a segurança").'
          placeholder="Descreva a ação de forma concreta"
          testId="plano-what"
        />

        <div>
          <p className={styles.formQuestion}>
            2. Onde será feito?<span className={styles.required}>*</span>
          </p>
          <Info>
            Indique o setor ou local em que a ação será executada. Isso ajuda a saber quem precisa
            ser envolvido e onde acompanhar a execução.
          </Info>
          <select
            className={`${styles.modalSelect} ${vazio(plan.where) && !ondeOutro ? styles.modalInputError : ""}`}
            value={ondeOutro ? OUTRO : plan.where}
            onChange={(event) => {
              const v = event.target.value;
              setOndeOutro(v === OUTRO);
              update("where", v === OUTRO ? "" : v);
            }}
            data-testid="plano-where"
          >
            <option value="">Selecione o setor</option>
            {SETOR_HOSPITALAR_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value={OUTRO}>Outro</option>
          </select>
          {ondeOutro && (
            <div style={{ marginTop: 8 }}>
              <LimitedInput
                value={plan.where}
                onChange={(v) => update("where", v)}
                maxLength={L.ondeOutro}
                invalid={vazio(plan.where)}
                placeholder="Especifique onde a ação será feita"
                testId="plano-where-outro"
              />
            </div>
          )}
        </div>

        <div>
          <p className={styles.formQuestion}>
            3. Quem será o(s) responsável(eis)?<span className={styles.required}>*</span>
          </p>
          <Info>
            Informe quem vai garantir que a ação aconteça. Toda ação precisa de ao menos um
            responsável identificado, para que o andamento possa ser acompanhado e cobrado.
          </Info>
          <TableField
            field={{
              id: "responsaveis",
              label: "",
              type: "table",
              repeatable: true,
              required: true,
              minRows: 1,
              lockMinRows: true,
              itemLabel: "Responsável",
              addButtonLabel: "+ Adicionar responsável",
              stackOnMobile: true,
              columns: RESPONSAVEL_COLUMNS,
            }}
            value={plan.responsaveis}
            onChange={(rows) => update("responsaveis", rows)}
            invalidCells={celulasResponsaveis}
            data-testid="plano-responsaveis"
          />
        </div>

        {/* Previsões: explicação + as duas datas + erro de datas num bloco só (espaçamento igual
            ao das outras perguntas). */}
        <div>
          <Info>
            Defina quando a ação deve começar e até quando deve estar concluída. As datas servem
            para acompanhar o andamento e identificar ações atrasadas.
          </Info>
          <div className={styles.modalGrid}>
            <TextField
              label="4. Previsão de início"
              value={plan.startDate}
              onChange={(value) => update("startDate", value)}
              required
              type="date"
              max={plan.conclusionDate || undefined}
              invalid={vazio(plan.startDate) || datasInvalidas}
              testId="plano-start"
            />
            <TextField
              label="5. Previsão de conclusão"
              value={plan.conclusionDate}
              onChange={(value) => update("conclusionDate", value)}
              required
              type="date"
              min={plan.startDate || undefined}
              invalid={vazio(plan.conclusionDate) || datasInvalidas}
              testId="plano-end"
            />
          </div>
          {datasInvalidas && (
            <p className={styles.modalFieldError} role="alert">
              <MdWarningAmber size={15} aria-hidden="true" /> A previsão de início não pode ser
              posterior à previsão de conclusão.
            </p>
          )}
        </div>

        {/* Na edição, a situação é alterada pelo "Atualizar andamento" (que pede os dados de cada
            situação); aqui só no cadastro. */}
        {!editando && (
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
        )}
        <ChoiceField
          label="6. Precisa de recurso para executar essa ação?"
          value={plan.resource}
          onChange={(value) => {
            update("resource", value);
            // Ao marcar "Sim", já abre a 1ª linha da tabela de recursos (mínimo de 1 item).
            if (value === "Sim" && plan.resourceItems.length === 0) update("resourceItems", [{}]);
          }}
          info="Informe se a ação depende de algum gasto — compra de material ou equipamento, contratação de serviço, treinamento etc. Se sim, liste cada item com o custo estimado (ex.: “Tapete antiderrapante — R$ 350,00”), para que a gestão possa prever e aprovar o orçamento. Todo item adicionado precisa ter o pedido e o preço preenchidos."
        />
        {plan.resource === "Sim" && (
          <div>
            <p className={styles.formQuestion}>
              Se sim, qual e quanto irá custar?
              <span className={styles.required}>*</span>
            </p>
            <TableField
              field={{
                id: "resource_items",
                label: "",
                type: "table",
                repeatable: true,
                requireCompleteRows: true,
                minRows: 1,
                lockMinRows: true,
                itemLabel: "Recurso",
                addButtonLabel: "+ Adicionar recurso",
                stackOnMobile: true,
                columns: [
                  {
                    id: "pedido",
                    label: "Pedido / item",
                    type: "text",
                    placeholder: "Ex.: Tapete antiderrapante",
                    maxLength: L.textoCurto,
                    tableWidth: "65%",
                  },
                  { id: "preco", label: "Preço estimado", type: "currency", tableWidth: "35%" },
                ],
              }}
              value={plan.resourceItems}
              onChange={(rows) => update("resourceItems", rows)}
              invalidCells={celulasRecurso}
              data-testid="action-plan-resource-items"
            />
          </div>
        )}
        <ChoiceField
          label="7. Depende da aprovação da Alta Gestão?"
          value={plan.approval}
          onChange={(value) => update("approval", value)}
          info="Marque “Sim” se a ação só pode acontecer com autorização da Alta Gestão (ex.: investimento, contratação, mudança de processo institucional) e informe qual aprovação é necessária. Isso sinaliza que o prazo pode depender de uma decisão superior."
        />
        {plan.approval === "Sim" && (
          <TextField
            label="Se sim, qual?"
            value={plan.approvalDetail}
            onChange={(value) => update("approvalDetail", value)}
            required
            maxLength={L.textoCurto}
            invalid={vazio(plan.approvalDetail)}
          />
        )}
        <TextField
          label="8. Como vamos comprovar que foi feito?"
          value={plan.proof}
          onChange={(value) => update("proof", value)}
          required
          multiline
          maxLength={L.textoLongo}
          invalid={vazio(plan.proof)}
          info="Diga qual evidência vai mostrar que a ação foi realmente executada (ex.: lista de presença do treinamento, foto da sinalização instalada, protocolo publicado)."
        />
        <TextField
          label="9. Qual resultado esperamos?"
          value={plan.expectedResult}
          onChange={(value) => update("expectedResult", value)}
          required
          multiline
          maxLength={L.textoLongo}
          invalid={vazio(plan.expectedResult)}
          info="Descreva o efeito que a ação deve produzir (ex.: “reduzir as quedas no corredor”, “nenhum paciente sem pulseira de identificação”). É com base nisso que a eficácia da ação será avaliada depois."
        />
        <TextField
          label="10. Como vamos saber se funcionou?"
          value={plan.verification}
          onChange={(value) => update("verification", value)}
          required
          multiline
          maxLength={L.textoLongo}
          invalid={vazio(plan.verification)}
          info="Explique como o resultado será medido ou conferido (ex.: auditoria mensal, acompanhamento do número de notificações de queda do setor)."
        />
        <TextField
          label="11. Quando verificar o resultado?"
          value={plan.verificationDate}
          onChange={(value) => update("verificationDate", value)}
          required
          maxLength={L.textoCurto}
          invalid={vazio(plan.verificationDate)}
          info="Indique quando a eficácia será avaliada (ex.: 30 dias após a conclusão, na auditoria de dezembro) — é preciso dar tempo para a ação surtir efeito antes de avaliar."
        />
        <ChoiceField
          label="12. Esta ação irá gerar um indicador de acompanhamento?"
          value={plan.indicator}
          onChange={(value) => update("indicator", value)}
          info="Marque “Sim” se a ação vai gerar um indicador para acompanhar ao longo do tempo (ex.: taxa de quedas por 1.000 pacientes-dia) e informe qual. Indicadores mostram se a melhoria se mantém depois que a ação termina."
        />
        {plan.indicator === "Sim" && (
          <TextField
            label="Qual indicador?"
            value={plan.indicatorDetail}
            onChange={(value) => update("indicatorDetail", value)}
            required
            maxLength={L.textoCurto}
            invalid={vazio(plan.indicatorDetail)}
          />
        )}
      </div>

      <div className={styles.modalFooter}>
        <button className={styles.cancelBtn} onClick={onClose}>
          Cancelar
        </button>
        <button className={styles.saveBtn} onClick={save} data-testid="btn-salvar-plano-acao">
          {editando ? "Salvar alterações" : "Salvar plano de ação"}
        </button>
      </div>
    </ModalBase>
  );
}

/** Texto explicativo do campo (fundo azul claro + ícone de info) — mesmo padrão da análise. */
function Info({ children }: { children: ReactNode }) {
  return <SectionInfoBox className={analiseStyles.sectionInfoBoxField}>{children}</SectionInfoBox>;
}

/** Contador "N/máx" — fica vermelho quando passa do limite. */
function Counter({ value, max }: { value: string; max: number }) {
  return (
    <div
      className={`${styles.modalCharCounter} ${value.length > max ? styles.modalCharCounterOver : ""}`}
    >
      {value.length}/{max}
    </div>
  );
}

function LimitedInput({
  value,
  onChange,
  maxLength,
  invalid,
  placeholder,
  testId,
}: {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  invalid?: boolean;
  placeholder?: string;
  testId?: string;
}) {
  return (
    <>
      <input
        className={`${styles.modalInput} ${invalid || value.length > maxLength ? styles.modalInputError : ""}`}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        data-testid={testId}
      />
      <Counter value={value} max={maxLength} />
    </>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  multiline = false,
  required = false,
  maxLength,
  invalid,
  placeholder,
  min,
  max,
  testId,
  info,
}: {
  info?: ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  multiline?: boolean;
  required?: boolean;
  maxLength?: number;
  invalid?: boolean;
  placeholder?: string;
  min?: string;
  max?: string;
  testId?: string;
}) {
  const acima = !!maxLength && value.length > maxLength;
  const className = `${styles.modalInput} ${multiline ? styles.modalTextarea : ""} ${invalid || acima ? styles.modalInputError : ""}`;
  return (
    <div>
      <p className={styles.formQuestion}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </p>
      {info && <Info>{info}</Info>}
      {multiline ? (
        <textarea
          className={className}
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          data-testid={testId}
        />
      ) : (
        <input
          className={className}
          type={type}
          value={value}
          placeholder={placeholder}
          min={min}
          max={max}
          onChange={(event) => onChange(event.target.value)}
          data-testid={testId}
        />
      )}
      {maxLength && <Counter value={value} max={maxLength} />}
    </div>
  );
}

function ChoiceField({
  label,
  value,
  onChange,
  info,
}: {
  info?: ReactNode;
  label: string;
  value: "Sim" | "Não";
  onChange: (value: "Sim" | "Não") => void;
}) {
  return (
    <div role="radiogroup" aria-label={label}>
      <p className={styles.formQuestion}>{label}</p>
      {info && <Info>{info}</Info>}
      <div className={styles.actionPlanChoiceOptions}>
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
      </div>
    </div>
  );
}
