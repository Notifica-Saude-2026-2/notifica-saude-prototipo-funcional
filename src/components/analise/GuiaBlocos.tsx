import { useState, type ReactNode } from "react";
import { FiAlertTriangle, FiCheck, FiCheckCircle, FiChevronDown, FiX } from "react-icons/fi";
import type { AnaliseField, GuiaLista } from "../../types/analise";
import type { TableRow } from "./TableField";
import styles from "./Analise.module.css";

/** Renderiza trechos entre **dois asteriscos** em negrito e entre *um asterisco* em itálico
    (usado na descrição das seções e nos textos de orientação). */
export function TextoComNegrito({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).map((parte, i) => {
        if (parte.startsWith("**") && parte.endsWith("**"))
          return <strong key={i}>{parte.slice(2, -2)}</strong>;
        if (parte.length > 2 && parte.startsWith("*") && parte.endsWith("*"))
          return <em key={i}>{parte.slice(1, -1)}</em>;
        return parte;
      })}
    </>
  );
}

/**
 * Bloco com seta para recolher — para exemplos e textos maiores (pedido da proponente: depois da
 * leitura, a pessoa recolhe e o conteúdo para de ocupar espaço). Abre expandido na primeira vez;
 * se a pessoa recolher, fica recolhido nas próximas análises (quem já conhece não precisa ver).
 */
export function Recolhivel({
  titulo,
  children,
  className,
  storageKey,
  "data-testid": testId,
}: {
  titulo: string;
  children: ReactNode;
  className?: string;
  /** Chave para lembrar no navegador se o bloco foi recolhido. */
  storageKey: string;
  "data-testid"?: string;
}) {
  const chave = `analise-recolhido-${storageKey}`;
  const [aberto, setAbertoState] = useState(() => {
    try {
      return localStorage.getItem(chave) !== "true";
    } catch {
      return true;
    }
  });
  function setAberto(atualizar: (a: boolean) => boolean) {
    const proximo = atualizar(aberto);
    setAbertoState(proximo);
    try {
      localStorage.setItem(chave, String(!proximo));
    } catch {
      // preferência é best-effort no protótipo
    }
  }
  return (
    <div className={className}>
      <button
        type="button"
        className={styles.recolhivelHeader}
        onClick={() => setAberto((a) => !a)}
        aria-expanded={aberto}
        data-testid={testId}
      >
        <FiChevronDown
          size={16}
          aria-hidden="true"
          className={`${styles.collapseChevron} ${aberto ? styles.collapseChevronOpen : ""}`}
        />
        {titulo}
      </button>
      {aberto && <div className={styles.recolhivelBody}>{children}</div>}
    </div>
  );
}

/** Lista numerada com rótulo em negrito opcional (passo a passo, exemplos). */
export function ListaNumerada({ items }: { items: NonNullable<GuiaLista["items"]> }) {
  return (
    <ol className={styles.listaNumerada}>
      {items.map((item, i) => (
        <li key={i}>
          <span className={styles.listaNumero}>{i + 1}.</span>
          <span>
            {item.label && <strong>{item.label} </strong>}
            {item.text}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Exemplos de um campo, em bloco recolhível acima dele — como lista ou, quando `examples.rows`
    existe, como mini tabela com as mesmas colunas da tabela real do campo. */
export function ExemplosCampo({ field, examples }: { field: AnaliseField; examples: GuiaLista }) {
  const colunas = (field.columns ?? []).filter((c) => c.type !== "auto-index");
  return (
    <Recolhivel
      titulo={examples.title}
      className={styles.exemplosBox}
      storageKey={`exemplos-${field.id}`}
      data-testid={`field-${field.id}-exemplos-toggle`}
    >
      {examples.rows ? (
        <div className={styles.exemploTabelaWrap}>
          <table className={styles.exemploTabela}>
            <thead>
              <tr>
                {colunas.map((c) => (
                  <th key={c.id}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {examples.rows.map((row, i) => (
                <tr key={i}>
                  {colunas.map((c) => (
                    <td key={c.id}>{row[c.id]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ListaNumerada items={examples.items ?? []} />
      )}
    </Recolhivel>
  );
}

/**
 * "Como identificar" de um campo (ex.: PPC): passos numerados + colunas de exemplos do que é e do
 * que não é, num bloco recolhível. Tons neutros; só o ícone de cada coluna indica sim/não.
 */
export function PainelComoIdentificar({
  fieldId,
  painel,
}: {
  fieldId: string;
  painel: NonNullable<AnaliseField["guidePanels"]>;
}) {
  return (
    <Recolhivel
      titulo={painel.title}
      className={styles.exemplosBox}
      storageKey={`como-identificar-${fieldId}`}
      data-testid={`field-${fieldId}-como-identificar-toggle`}
    >
      <div className={styles.painelGrid}>
        <ol className={styles.listaNumerada}>
          {painel.steps.map((passo, i) => (
            <li key={i}>
              <span className={styles.listaNumero}>{i + 1}.</span>
              <span>
                <TextoComNegrito texto={passo} />
              </span>
            </li>
          ))}
        </ol>
        {painel.columns.map((coluna) => (
          <div key={coluna.title} className={styles.painelColuna}>
            <p className={styles.painelColunaTitulo}>
              {coluna.tone === "positivo" ? (
                <FiCheck size={14} aria-hidden="true" className={styles.painelIconeSim} />
              ) : (
                <FiX size={14} aria-hidden="true" className={styles.painelIconeNao} />
              )}
              {coluna.title}
            </p>
            <ul className={styles.painelLista}>
              {coluna.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Recolhivel>
  );
}

/**
 * "Antes de seguir, confira" — checklist exibido abaixo do campo, com um aviso ao lado quando
 * alguma linha da tabela bate com `rowAlert` (ex.: fatos com status "Em análise").
 */
export function ChecklistRevisao({
  checklist,
  rowAlert,
  rows,
}: {
  checklist: { title: string; items: string[] };
  rowAlert?: { columnId: string; equals: string; singular: string; plural: string; text: string };
  rows: TableRow[];
}) {
  const n = rowAlert ? rows.filter((r) => r[rowAlert.columnId] === rowAlert.equals).length : 0;
  return (
    <div className={styles.revisaoBox} data-testid="checklist-revisao">
      <div className={styles.revisaoChecklist}>
        <p className={styles.revisaoTitulo}>{checklist.title}</p>
        <ul className={styles.revisaoLista}>
          {checklist.items.map((item) => (
            <li key={item}>
              <FiCheckCircle size={13} aria-hidden="true" className={styles.revisaoCheck} />
              {item}
            </li>
          ))}
        </ul>
      </div>
      {rowAlert && n > 0 && (
        <div className={styles.revisaoAlerta} role="status" data-testid="checklist-revisao-alerta">
          <FiAlertTriangle size={14} aria-hidden="true" className={styles.revisaoAlertaIcon} />
          <div>
            <p className={styles.revisaoAlertaTitulo}>
              {n === 1 ? rowAlert.singular : rowAlert.plural.replace("{n}", String(n))}
            </p>
            <p className={styles.revisaoAlertaTexto}>{rowAlert.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}
