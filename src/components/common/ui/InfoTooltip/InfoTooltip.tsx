import Tooltip from "@mui/material/Tooltip";
import { FiInfo } from "react-icons/fi";

// Azul do sistema — mesmo tom usado na barra de progresso do StepForm (Analise/formulário público)
// e nos botões primários do admin. Centralizado aqui para não divergir entre os dois usos.
const INFO_COLOR = "#183eff";
// Fundo do balão de tooltip — mais escuro que o cinza padrão do MUI, pra melhorar o contraste do
// texto branco (pedido: "deixar o tooltip mais escuro").
const TOOLTIP_BG = "#20232e";

/** Um item de legenda estruturada — ex.: uma opção de status e o que ela significa. A bolinha
    colorida (quando informada) ajuda a reconhecer visualmente o mesmo status em outros lugares da
    tela (badges, tags) que já usam essa cor. */
export type TooltipLegendItem = {
  /** Rótulo curto que identifica o item (ex.: "Confirmado"). */
  label: string;
  /** Explicação do item — pode ser mais longa, fica na própria linha, sem disputar espaço com os
      outros itens da legenda. */
  description: string;
  /** Cor da bolinha ao lado do rótulo. Omitir quando o item não corresponde a uma cor já usada em
      outro lugar da tela (a linha aparece só com o texto, sem bolinha). */
  color?: string;
};

type Props = {
  /** Texto simples — complemento curto de uma frase só. Continua sendo o caso mais comum. */
  text?: string;
  /** Legenda estruturada — uma linha por item, com bolinha colorida opcional. Preferir a `text`
      sozinho sempre que o conteúdo for uma lista de opções/status a explicar: em uma string só,
      uma legenda com vários itens vira um parágrafo único difícil de ler (o motivo desta prop
      existir). Pode combinar com `text` — nesse caso `text` aparece como frase de introdução
      acima da lista (ex.: "Considere isso: <lista de exemplos>"). */
  items?: TooltipLegendItem[];
  /** Tamanho do ícone em px. Um pouco maior ao lado de títulos de seção; o padrão (13px) serve
      para rótulos de campo e cabeçalhos de coluna de tabela. */
  size?: number;
};

/**
 * Ícone "i" azul com legenda ao passar o mouse — usado em todo o sistema para explicar um título
 * de seção, rótulo de campo ou cabeçalho de coluna sem ocupar espaço permanente na tela.
 *
 * Preferir isso a um texto sempre visível (ex.: um card/caixa de orientação) quando o conteúdo é
 * um complemento opcional, não uma instrução de ação que precisa estar sempre à vista — mantém a
 * tela limpa (Nielsen: design estético e minimalista) e ainda assim documentada (Nielsen: ajuda e
 * documentação), com a mesma aparência e comportamento em qualquer lugar do sistema (Nielsen:
 * consistência e padrões).
 *
 * Aceita `text` (frase única), `items` (legenda de várias linhas, uma por opção) ou os dois juntos
 * (texto de introdução + lista). Por ser o único componente de tooltip do sistema, qualquer
 * melhoria de legibilidade feita aqui (como o suporte a `items`) já vale automaticamente para todo
 * "i" existente.
 */
export function InfoTooltip({ text, items, size = 13 }: Props) {
  const title = items ? (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {text && <span>{text}</span>}
      {items.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          style={{ display: "flex", gap: 7, alignItems: "flex-start" }}
        >
          {item.color ? (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: item.color,
                flexShrink: 0,
                marginTop: 4,
              }}
            />
          ) : (
            <span style={{ flexShrink: 0 }}>•</span>
          )}
          <span>
            {item.label && <strong>{item.label}: </strong>}
            {item.description}
          </span>
        </div>
      ))}
    </div>
  ) : (
    text
  );

  return (
    <Tooltip
      title={title}
      placement="top"
      slotProps={{
        tooltip: {
          sx: {
            fontFamily: '"Poppins", sans-serif',
            backgroundColor: TOOLTIP_BG,
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.45)",
            ...(items
              ? { maxWidth: 340, fontSize: 12.5, lineHeight: 1.45, padding: "10px 12px" }
              : null),
          },
        },
      }}
    >
      <span
        style={{
          display: "inline-flex",
          cursor: "help",
          color: INFO_COLOR,
          verticalAlign: "middle",
        }}
      >
        <FiInfo size={size} />
      </span>
    </Tooltip>
  );
}
