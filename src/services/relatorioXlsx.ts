// --------------------------------------------------------------------------
// Relatório de incidentes em XLSX (extração de dados).
//
// Escopo por perfil:
//   - NSP e Administrador: todos os incidentes da instituição.
//   - Gestor da área: só os incidentes do próprio setor encaminhados a ele (RN-26), sem a
//     indicação de notificação anônima (RN-27).
//
// Nome e contato do notificante nunca são exportados em relatórios, para nenhum perfil.
//
// A planilha é montada no navegador com o ExcelJS, carregado sob demanda (import dinâmico) para
// não pesar no carregamento inicial da aplicação.
// --------------------------------------------------------------------------

import type { Workbook, Worksheet, Cell } from "exceljs";
import { getNotificacoes, setores } from "./localStore";
import {
  STATUS_LABEL,
  GRAU_DANO_LABEL,
  TIPO_INCIDENTE_LABEL,
  TIPO_ESPECIFICO_LABEL,
  CATEGORIA_INCIDENTE_LABEL,
  ENVOLVIDO_LABEL,
} from "./notificacaoDetalheService";
import { CAMPO_IDS, type NotificacaoRaw } from "../types/notificacaoDetalhe";
import { camposPendentesPlano, nomesResponsaveis } from "../types/actionPlan";
import { STATUS_COLORS, GRAU_DANO_COLORS } from "../utils/statusColors";

export type UsuarioRelatorio = {
  nome: string;
  perfil: string;
  setor_id?: string | null;
};

/** Ordem do ciclo de vida (épico 6) — usada no resumo e na ordenação. */
const ORDEM_STATUS = [
  "NOVA",
  "CLASSIFICADA",
  "ENCAMINHADA_SETOR",
  "EM_ANALISE",
  "ANALISADA",
  "EM_ACAO",
  "CONCLUIDA",
  "ARQUIVADA",
];

// Paleta do design system (sem "#", formato ARGB do Excel)
const COR = {
  primaria: "FF183EFF",
  marinho: "FF131D53",
  texto: "FF3F4252",
  suave: "FF6B6375",
  borda: "FFE3E4EA",
  fundo: "FFF5F6FA",
  wash: "FFEEF1FF",
  branco: "FFFFFFFF",
};

const argb = (hex: string) => "FF" + hex.replace("#", "").toUpperCase();

function resposta(n: NotificacaoRaw, campoId: string): string {
  const r = n.respostas.find((x) => x.campo_id === campoId);
  if (!r) return "";
  return r.opcao_selecionada?.valor ?? r.valor_entidade_label ?? r.valor_texto ?? "";
}

/** O Excel não tem fuso horário: o ExcelJS grava a data em UTC. Para a planilha mostrar o mesmo
    horário que a pessoa vê no sistema, a data vai com os componentes do horário local. */
const paraExcel = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000);
const diaExcel = (ano: number, mes: number, dia: number) => new Date(Date.UTC(ano, mes, dia));

const data = (iso: string | null | undefined) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : paraExcel(d);
};

/** Datas "aaaa-mm-dd" (sem hora) viram meia-noite local, para não voltar um dia no Excel. */
const dataLocal = (ymd: string | null | undefined) => {
  if (!ymd) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(ymd);
  if (!m) return data(ymd);
  return diaExcel(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};

const dataIncidente = (iso: string) => {
  // data_incidente é gravada à meia-noite UTC — mantém o dia do calendário
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? null
    : diaExcel(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

function situacaoAnalise(n: NotificacaoRaw): string {
  if (!n.analise) return "Não iniciada";
  return n.analise.concluida ? "Concluída" : "Em andamento";
}

/** Incidentes visíveis para o usuário (RN-26). */
export function incidentesNoEscopo(usuario: UsuarioRelatorio): NotificacaoRaw[] {
  const todos = getNotificacoes();
  if (usuario.perfil !== "GESTOR_AREA") return todos;
  return todos.filter(
    (n) =>
      n.setor_id === usuario.setor_id &&
      (n.status === "ENCAMINHADA_SETOR" || n.analise_via_encaminhamento === true),
  );
}

// --------------------------------------------------------------------------
// Estilo
// --------------------------------------------------------------------------

const BORDA_FINA = { style: "thin" as const, color: { argb: COR.borda } };

function estilizarCabecalho(ws: Worksheet, linha: number, primeiraColuna = 1) {
  const row = ws.getRow(linha);
  row.height = 30;
  row.eachCell((c, col) => {
    if (col < primeiraColuna) return;
    c.font = { name: "Calibri", bold: true, size: 11, color: { argb: COR.branco } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR.primaria } };
    c.alignment = { vertical: "middle", horizontal: "left", wrapText: false, indent: 1 };
    c.border = { bottom: { style: "thin", color: { argb: COR.marinho } } };
    // Título sempre inteiro: largura para o texto em negrito, o recuo e o botão do filtro.
    const coluna = ws.getColumn(col);
    const minima = Math.ceil(String(c.value ?? "").length * 1.1) + 5;
    if ((coluna.width ?? 0) < minima) coluna.width = minima;
  });
}

function estilizarCorpo(ws: Worksheet, de: number, ate: number, primeiraColuna = 1) {
  for (let i = de; i <= ate; i++) {
    const row = ws.getRow(i);
    row.eachCell({ includeEmpty: true }, (c, col) => {
      if (col < primeiraColuna) return;
      c.font = { name: "Calibri", size: 10, color: { argb: COR.texto } };
      c.alignment = { vertical: "top", wrapText: true, ...c.alignment };
      c.border = { bottom: BORDA_FINA };
      if ((i - de) % 2 === 1)
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR.fundo } };
    });
  }
}

function etiqueta(c: Cell, fundo: string, texto: string) {
  c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: argb(fundo) } };
  c.font = { name: "Calibri", size: 10, bold: true, color: { argb: argb(texto) } };
  c.alignment = { vertical: "top", horizontal: "center" };
}

// --------------------------------------------------------------------------
// Abas
// --------------------------------------------------------------------------

function abaResumo(
  wb: Workbook,
  itens: NotificacaoRaw[],
  usuario: UsuarioRelatorio,
  escopo: string,
) {
  const ws = wb.addWorksheet("Resumo", {
    views: [{ showGridLines: false }],
    properties: { tabColor: { argb: COR.marinho } },
    pageSetup: {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      paperSize: 9,
    },
  });
  // Três tabelas lado a lado (status, setor e grau do dano), cada uma com três colunas
  // (item, incidentes e %), separadas por uma coluna estreita.
  ws.columns = [
    { width: 3 },
    { width: 24 },
    { width: 11 },
    { width: 8 },
    { width: 3 },
    { width: 24 },
    { width: 11 },
    { width: 8 },
    { width: 3 },
    { width: 24 },
    { width: 11 },
    { width: 8 },
  ];

  const instituicao = itens[0]?.unidade?.nome ?? "—";
  const info: [string, string | Date | number][] = [
    ["Instituição", instituicao],
    ["Escopo", escopo],
    ["Gerado em", paraExcel(new Date())],
    ["Gerado por", usuario.nome],
    ["Total de incidentes", itens.length],
  ];
  info.forEach(([k, v], i) => {
    const r = 2 + i;
    const ck = ws.getCell(r, 2);
    ck.value = k;
    ck.font = { name: "Calibri", size: 10, bold: true, color: { argb: COR.suave } };
    ws.mergeCells(r, 3, r, 8);
    const cv = ws.getCell(r, 3);
    cv.value = v;
    cv.font = {
      name: "Calibri",
      size: 11,
      color: { argb: COR.texto },
      bold: k === "Total de incidentes",
    };
    if (v instanceof Date) cv.numFmt = "dd/mm/yyyy hh:mm";
    cv.alignment = { horizontal: "left" };
  });

  const LINHA_TABELAS = 9;
  const total = itens.length || 1;
  const borda = { bottom: BORDA_FINA };

  function tabela(
    col: number,
    tituloTabela: string,
    cabecalhoItem: string,
    linhas: { rotulo: string; qtd: number; cor?: { bg: string; text: string } }[],
  ) {
    const t = ws.getCell(LINHA_TABELAS, col);
    t.value = tituloTabela;
    t.font = { name: "Calibri", size: 12, bold: true, color: { argb: COR.marinho } };

    const rc = LINHA_TABELAS + 1;
    ws.getRow(rc).height = 30;
    [cabecalhoItem, "Incidentes", "%"].forEach((h, j) => {
      const c = ws.getCell(rc, col + j);
      c.value = h;
      c.font = { name: "Calibri", bold: true, size: 11, color: { argb: COR.branco } };
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR.primaria } };
      c.alignment = {
        vertical: "middle",
        horizontal: j === 0 ? "left" : "center",
        indent: j === 0 ? 1 : 0,
      };
    });

    linhas.forEach((l, i) => {
      const r = rc + 1 + i;
      const valores: (string | number)[] = [l.rotulo, l.qtd, l.qtd / total];
      valores.forEach((v, j) => {
        const c = ws.getCell(r, col + j);
        c.value = v;
        c.font = { name: "Calibri", size: 10, color: { argb: COR.texto } };
        c.alignment = {
          vertical: "middle",
          horizontal: j === 0 ? "left" : "center",
          indent: j === 0 ? 1 : 0,
        };
        c.border = borda;
        if (i % 2 === 1)
          c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COR.fundo } };
        if (j === 2) c.numFmt = "0%";
      });
      if (l.cor) {
        const c = ws.getCell(r, col);
        etiqueta(c, l.cor.bg, l.cor.text);
        c.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
      }
    });
  }

  const contar = (fn: (n: NotificacaoRaw) => string) => {
    const m = new Map<string, number>();
    for (const n of itens) m.set(fn(n), (m.get(fn(n)) ?? 0) + 1);
    return m;
  };

  const porStatus = contar((n) => n.status);
  tabela(
    2,
    "Incidentes por status",
    "Status",
    ORDEM_STATUS.map((s) => ({
      rotulo: STATUS_LABEL[s],
      qtd: porStatus.get(s) ?? 0,
      cor: STATUS_COLORS[s],
    })),
  );

  const porSetor = contar((n) => n.setor?.nome ?? "Sem setor");
  tabela(
    6,
    "Incidentes por setor",
    "Setor",
    [...porSetor.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ rotulo: k, qtd: v })),
  );

  const porGrau = contar((n) =>
    n.classificacao && !n.classificacao.rascunho
      ? (n.classificacao.grau_dano ?? "SEM_DANO")
      : "NAO_CLASSIFICADO",
  );
  const graus: [string, string][] = [
    ["SEM_DANO", "Sem dano"],
    ["LEVE", "Leve"],
    ["MODERADO", "Moderado"],
    ["GRAVE", "Grave"],
    ["OBITO", "Óbito"],
    ["NEVER_EVENT", "Never Event"],
    ["NAO_CLASSIFICADO", "Ainda não classificado"],
  ];
  tabela(
    10,
    "Incidentes por grau do dano",
    "Grau do dano",
    graus.map(([k, l]) => ({ rotulo: l, qtd: porGrau.get(k) ?? 0, cor: GRAU_DANO_COLORS[k] })),
  );
}

type Coluna = {
  titulo: string;
  largura: number;
  valor: (n: NotificacaoRaw) => unknown;
  formato?: string;
};

function abaIncidentes(wb: Workbook, itens: NotificacaoRaw[], mostrarAnonima: boolean) {
  const ws = wb.addWorksheet("Incidentes", {
    views: [{ state: "frozen", xSplit: 1, ySplit: 1, showGridLines: false }],
    properties: { tabColor: { argb: COR.primaria } },
    pageSetup: { orientation: "landscape", paperSize: 9 },
  });
  ws.pageSetup.printTitlesRow = "1:1";

  const lista = (
    codigos: string[] | undefined,
    mapa: Record<string, string>,
    outro?: string | null,
  ) =>
    (codigos ?? [])
      .map((c) => (c === "OUTRO" && outro ? `Outro: ${outro}` : (mapa[c] ?? c)))
      .join("; ");

  const cls = (n: NotificacaoRaw) =>
    n.classificacao && !n.classificacao.rascunho ? n.classificacao : null;

  const colunas: Coluna[] = [
    { titulo: "Incidente", largura: 11, valor: (n) => `#${n.codigo}` },
    { titulo: "Status", largura: 14, valor: (n) => STATUS_LABEL[n.status] ?? n.status },
    {
      titulo: "Data do incidente",
      largura: 13,
      valor: (n) => dataIncidente(n.data_incidente),
      formato: "dd/mm/yyyy",
    },
    { titulo: "Turno", largura: 10, valor: (n) => resposta(n, CAMPO_IDS.TURNO) },
    { titulo: "Horário", largura: 9, valor: (n) => resposta(n, CAMPO_IDS.HORARIO) },
    {
      titulo: "Registrado em",
      largura: 16,
      valor: (n) => data(n.data_registro),
      formato: "dd/mm/yyyy hh:mm",
    },
    { titulo: "Instituição", largura: 16, valor: (n) => n.unidade?.nome ?? "" },
    { titulo: "Setor", largura: 16, valor: (n) => n.setor?.nome ?? "" },
    { titulo: "Descrição", largura: 60, valor: (n) => n.descricao ?? "" },
    { titulo: "Envolve paciente", largura: 11, valor: (n) => resposta(n, CAMPO_IDS.ENV_PACIENTE) },
    { titulo: "Faixa etária", largura: 15, valor: (n) => resposta(n, CAMPO_IDS.IDADE) },
    { titulo: "Sexo", largura: 11, valor: (n) => resposta(n, CAMPO_IDS.SEXO) },
    { titulo: "Papel do notificante", largura: 20, valor: (n) => resposta(n, CAMPO_IDS.PAPEL) },
    ...(mostrarAnonima
      ? [
          {
            titulo: "Anônima",
            largura: 10,
            valor: (n: NotificacaoRaw) => (n.anonima ? "Sim" : "Não"),
          },
        ]
      : []),
    {
      titulo: "Classificação",
      largura: 22,
      valor: (n) =>
        cls(n) ? (TIPO_INCIDENTE_LABEL[cls(n)!.tipo_incidente ?? ""] ?? "") : "Não classificado",
    },
    {
      titulo: "Never Event",
      largura: 28,
      valor: (n) => TIPO_ESPECIFICO_LABEL[cls(n)?.tipo_especifico ?? ""] ?? "",
    },
    {
      titulo: "Tipo de incidente",
      largura: 26,
      valor: (n) =>
        lista(cls(n)?.tipos_incidentes, CATEGORIA_INCIDENTE_LABEL, cls(n)?.outro_tipo_incidente),
    },
    {
      titulo: "Envolvidos",
      largura: 22,
      valor: (n) => lista(cls(n)?.envolvidos, ENVOLVIDO_LABEL, cls(n)?.outro_envolvido),
    },
    {
      titulo: "Grau do dano",
      largura: 13,
      valor: (n) => (cls(n) ? (GRAU_DANO_LABEL[cls(n)!.grau_dano ?? ""] ?? "Sem dano") : ""),
    },
    {
      titulo: "Classificado em",
      largura: 13,
      valor: (n) => data(cls(n)?.data_classificacao),
      formato: "dd/mm/yyyy",
    },
    {
      titulo: "Prazo para análise",
      largura: 13,
      valor: (n) => data(cls(n)?.data_validade),
      formato: "dd/mm/yyyy",
    },
    { titulo: "Responsável", largura: 18, valor: (n) => cls(n)?.profissional_nsp_nome ?? "" },
    { titulo: "Análise", largura: 14, valor: situacaoAnalise },
    {
      titulo: "Quem analisou",
      largura: 14,
      valor: (n) => (n.analise ? (n.analise_via_encaminhamento ? "Setor" : "Núcleo (NSP)") : ""),
    },
    {
      titulo: "Incidente investigado",
      largura: 40,
      valor: (n) =>
        n.analise?.concluida ? String(n.analise.valores["incidente_investigado"] ?? "") : "",
    },
    {
      titulo: "Análise concluída em",
      largura: 13,
      valor: (n) => data(n.analise?.data_conclusao),
      formato: "dd/mm/yyyy",
    },
    {
      titulo: "Recomendações",
      largura: 50,
      valor: (n) =>
        n.analise?.concluida ? n.analise.recomendacoes.map((r) => `• ${r.texto}`).join("\n") : "",
    },
    {
      titulo: "Ações no plano",
      largura: 10,
      valor: (n) => (n.planos_acao?.length ? n.planos_acao.length : ""),
    },
    {
      titulo: "Ações concluídas",
      largura: 11,
      valor: (n) =>
        n.planos_acao?.length ? n.planos_acao.filter((p) => p.status === "Concluído").length : "",
    },
    {
      titulo: "Última atualização",
      largura: 16,
      valor: (n) => data(n.updated_at),
      formato: "dd/mm/yyyy hh:mm",
    },
  ];

  ws.columns = colunas.map((c) => ({ header: c.titulo, width: c.largura }));
  estilizarCabecalho(ws, 1);

  itens.forEach((n) => ws.addRow(colunas.map((c) => c.valor(n) ?? "")));
  estilizarCorpo(ws, 2, itens.length + 1);

  colunas.forEach((c, i) => {
    if (c.formato) ws.getColumn(i + 1).eachCell((cell, r) => r > 1 && (cell.numFmt = c.formato!));
  });
  // Código e status em destaque
  const iStatus = colunas.findIndex((c) => c.titulo === "Status") + 1;
  const iGrau = colunas.findIndex((c) => c.titulo === "Grau do dano") + 1;
  itens.forEach((n, i) => {
    const r = i + 2;
    ws.getCell(r, 1).font = {
      name: "Calibri",
      size: 10,
      bold: true,
      color: { argb: COR.primaria },
    };
    const cor = STATUS_COLORS[n.status];
    if (cor) etiqueta(ws.getCell(r, iStatus), cor.bg, cor.text);
    const grau = cls(n)?.grau_dano;
    const cg = grau ? GRAU_DANO_COLORS[grau] : null;
    if (cg) etiqueta(ws.getCell(r, iGrau), cg.bg, cg.text);
  });

  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: colunas.length } };
}

function abaPlanoAcao(wb: Workbook, itens: NotificacaoRaw[]) {
  const ws = wb.addWorksheet("Plano de ação", {
    views: [{ state: "frozen", ySplit: 1, showGridLines: false }],
    properties: { tabColor: { argb: "FF43A047" } },
    pageSetup: {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      paperSize: 9,
    },
  });
  ws.pageSetup.printTitlesRow = "1:1";
  ws.columns = [
    { header: "Incidente", width: 10 },
    { header: "Nº", width: 5 },
    { header: "O que será feito", width: 50 },
    { header: "Onde", width: 20 },
    { header: "Responsáveis", width: 22 },
    { header: "Previsão de início", width: 13 },
    { header: "Previsão de conclusão", width: 13 },
    { header: "Situação", width: 22 },
    { header: "Início real", width: 12 },
    { header: "Conclusão real", width: 12 },
    { header: "Efetividade", width: 12 },
    { header: "Como comprovar", width: 36 },
    { header: "Resultado esperado", width: 36 },
    { header: "Recomendação de origem", width: 40 },
  ];
  estilizarCabecalho(ws, 1);

  const linhas: { n: NotificacaoRaw; pendente: boolean }[] = [];
  for (const n of itens) {
    (n.planos_acao ?? []).forEach((p, i) => {
      const pendente = camposPendentesPlano(p).length > 0;
      ws.addRow([
        `#${n.codigo}`,
        i + 1,
        p.what,
        p.where,
        nomesResponsaveis(p),
        dataLocal(p.startDate),
        dataLocal(p.conclusionDate),
        pendente ? "Preenchimento pendente" : p.status,
        dataLocal(p.realStartDate),
        dataLocal(p.realConclusionDate),
        p.effectiveness,
        p.proof,
        p.expectedResult,
        p.origemRecomendacao ?? "",
      ]);
      linhas.push({ n, pendente });
    });
  }
  estilizarCorpo(ws, 2, linhas.length + 1);
  [6, 7, 9, 10].forEach((c) =>
    ws.getColumn(c).eachCell((cell, r) => r > 1 && (cell.numFmt = "dd/mm/yyyy")),
  );
  linhas.forEach(({ pendente }, i) => {
    const r = i + 2;
    ws.getCell(r, 1).font = {
      name: "Calibri",
      size: 10,
      bold: true,
      color: { argb: COR.primaria },
    };
    const c = ws.getCell(r, 8);
    const v = String(c.value ?? "");
    if (pendente) etiqueta(c, "#fff8e1", "#c8850a");
    else if (v === "Concluído") etiqueta(c, "#dcfce7", "#15803d");
    else if (v === "Cancelada" || v === "Atrasada") etiqueta(c, "#fee4e2", "#b42318");
    else etiqueta(c, "#e8eaf6", "#283593");
  });
  if (linhas.length === 0) {
    ws.getCell("A2").value = "Nenhuma ação registrada nos incidentes deste relatório.";
    ws.getCell("A2").font = { name: "Calibri", size: 10, italic: true, color: { argb: COR.suave } };
  } else {
    ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 14 } };
  }
}

// --------------------------------------------------------------------------
// Ponto de entrada
// --------------------------------------------------------------------------

function nomeArquivo(escopoCurto: string) {
  const d = new Date();
  const p = (x: number) => String(x).padStart(2, "0");
  return `notificasaude-incidentes-${escopoCurto}-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.xlsx`;
}

export async function extrairRelatorioXlsx(usuario: UsuarioRelatorio) {
  const { default: ExcelJS } = await import("exceljs");
  const gestor = usuario.perfil === "GESTOR_AREA";
  const nomeSetor = setores.find((s) => s.id === usuario.setor_id)?.nome ?? "setor";

  const itens = incidentesNoEscopo(usuario).sort(
    (a, b) => new Date(b.data_registro).getTime() - new Date(a.data_registro).getTime(),
  );

  const wb = new ExcelJS.Workbook();
  wb.creator = "NotificaSaúde";
  wb.created = new Date();

  const escopo = gestor
    ? `Setor ${nomeSetor} (incidentes encaminhados)`
    : "Todos os setores da instituição";
  abaResumo(wb, itens, usuario, escopo);
  abaIncidentes(wb, itens, !gestor);
  abaPlanoAcao(wb, itens);

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo(gestor ? nomeSetor.toLowerCase().replace(/\s+/g, "-") : "instituicao");
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { total: itens.length, arquivo: a.download };
}
