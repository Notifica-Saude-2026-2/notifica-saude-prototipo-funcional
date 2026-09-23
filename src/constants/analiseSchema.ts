import type {
  AnaliseFlowSchema,
  ChecklistItemDef,
  DetailFieldDef,
  TableColumn,
} from "../types/analise";

// --------------------------------------------------------------------------
// Taxonomia comum (Protocolo de Londres, revisão 2024) — 8 categorias fixas
// --------------------------------------------------------------------------

export const FATORES_CONTRIBUINTES_ITEMS: ChecklistItemDef[] = [
  {
    id: "fatores_paciente",
    label: "Fatores do paciente",
    example: "doença/complexidade, barreira de comunicação, aspectos sociais",
  },
  {
    id: "fatores_individuais",
    label: "Fatores individuais dos profissionais",
    example: "conhecimento/habilidades, saúde física ou mental, valores profissionais",
  },
  {
    id: "fatores_tarefas",
    label: "Fatores das tarefas",
    example: "clareza do processo, disponibilidade de POP/protocolo, acurácia de exames",
  },
  {
    id: "fatores_equipe",
    label: "Fatores da equipe",
    example: "comunicação verbal/escrita, supervisão, liderança, apoio mútuo",
  },
  {
    id: "fatores_ambiente",
    label: "Fatores do ambiente de trabalho",
    example: "dimensionamento de pessoal, carga de trabalho, equipamentos, ambiente físico",
  },
  {
    id: "fatores_tecnologia",
    label: "Tecnologia e sistemas eletrônicos de informação",
    example: "hardware/software, suporte a decisão, interface, integração de fluxo",
  },
  {
    id: "fatores_organizacionais",
    label: "Fatores organizacionais, gerenciais e culturais",
    example: "recursos, treinamento, políticas e metas, cultura de segurança",
  },
  {
    id: "fatores_institucionais",
    label: "Fatores do contexto institucional",
    example: "contexto regulatório, políticas públicas de saúde, rede externa",
  },
];

export const FATORES_CONTRIBUINTES_DETAIL_FIELDS: DetailFieldDef[] = [
  {
    id: "achado",
    label: "O que foi identificado / achado",
    type: "textarea",
    placeholder: "Descreva o que foi identificado nesta categoria",
  },
  {
    id: "fonte",
    label: "Fonte / evidência",
    type: "text",
    placeholder: "Ex.: prontuário, entrevista, protocolo",
  },
];

/** Colunas da tabela "Níveis de 'Por quê?'" dos 5 Porquês — extraído como constante compartilhada
    porque agora é usado embutido em cada categoria de fatores contribuintes (ver
    ChecklistWithDetailField / enablePorques), não mais numa seção solta. */
export const FIVE_WHYS_NIVEIS_COLUMNS: TableColumn[] = [
  { id: "nivel", label: "Nível", type: "auto-index" },
  {
    id: "pergunta",
    label: "Por que aconteceu?",
    type: "textarea",
    placeholder: "Ex.: Por que o paciente caiu?",
    maxLength: 100,
    deriveFromPreviousRow: { sourceColumnId: "resposta", prefix: "Por que ", suffix: "?" },
  },
  {
    id: "resposta",
    label: "Resposta",
    type: "textarea",
    placeholder: "Responda o porquê acima",
    maxLength: 100,
  },
];

const EQUIPE_RESPONSAVEL_COLUMNS = [
  {
    id: "nome",
    label: "Nome do profissional",
    type: "text" as const,
    placeholder: "Nome completo do profissional",
    maxLength: 50,
  },
  { id: "formacao", label: "Formação", type: "text" as const, placeholder: "Ex.: Enfermagem" },
  { id: "funcao", label: "Função", type: "text" as const, placeholder: "Ex.: Enfermeiro(a)" },
  { id: "setor", label: "Setor", type: "text" as const, placeholder: "Ex.: UTI" },
];

// --------------------------------------------------------------------------
// Equipe responsável (ACR) — mesma informação da tabela acima, mas com Formação/Função/Setor como
// listas pré-definidas (sempre com "Outro" como escape) em vez de texto livre, para reduzir
// divergência de grafia entre análises. Usado só no fluxo ACR por ora — Londres Rápido/Completo
// seguem com EQUIPE_RESPONSAVEL_COLUMNS até termos a tela equivalente revisada para eles também.
const FORMACAO_OPTIONS = [
  "Enfermagem",
  "Medicina",
  "Farmácia",
  "Fisioterapia",
  "Nutrição",
  "Odontologia",
  "Psicologia",
  "Serviço Social",
  "Administração",
];

export const FUNCAO_PROFISSIONAL_OPTIONS = [
  "Enfermeiro(a)",
  "Técnico(a) de Enfermagem",
  "Médico(a)",
  "Farmacêutico(a)",
  "Fisioterapeuta",
  "Nutricionista",
  "Coordenador(a)",
  "Gestor(a) de Qualidade e Segurança",
  "Analista de Qualidade",
];

export const SETOR_HOSPITALAR_OPTIONS = [
  "Qualidade e Segurança do Paciente",
  "Clínica Médica",
  "Farmácia Hospitalar",
  "Centro Cirúrgico",
  "UTI",
  "Pronto-Socorro",
  "Enfermagem",
  "Administrativo",
];

const EQUIPE_MEMBRO_COLUMNS = [
  {
    id: "nome",
    label: "Nome",
    type: "text" as const,
    placeholder: "Nome completo do profissional",
    maxLength: 50,
  },
  {
    id: "formacao",
    label: "Formação",
    type: "choice" as const,
    options: FORMACAO_OPTIONS,
    allowOther: true,
  },
  {
    id: "funcao",
    label: "Função",
    type: "choice" as const,
    options: FUNCAO_PROFISSIONAL_OPTIONS,
    allowOther: true,
  },
  {
    id: "setor",
    label: "Setor",
    type: "choice" as const,
    options: SETOR_HOSPITALAR_OPTIONS,
    allowOther: true,
  },
];

const FONTES_CONSULTADAS_OPTIONS = [
  "Prontuário",
  "Protocolo/POP",
  "Relato da equipe",
  "Paciente/família",
];

const RECOMENDACOES_FIELD = {
  id: "recomendacoes",
  label: "Recomendações",
  type: "table" as const,
  repeatable: true,
  minRows: 1,
  itemLabel: "Recomendação",
  addButtonLabel: "+ Adicionar recomendação",
  helpText:
    'Registre o que precisa ser feito para tratar as causas identificadas e evitar que o incidente se repita — uma recomendação por vez, de forma concreta e ligada aos fatores levantados na análise. Ao concluir a análise, cada recomendação pode virar uma ação no Plano de ação desta notificação (já com o "O quê" preenchido), onde ganha responsável, prazo e acompanhamento até ser concluída.',
  helpTextInline: true,
  // Coluna única: o rótulo dela não é exibido (o card já se chama "Recomendação N") — ver TableField.
  // Opcional, mas cada recomendação adicionada precisa ser preenchida (até 300 caracteres).
  requireCompleteRows: true,
  columns: [
    {
      id: "recomendacao",
      label: "Recomendação",
      type: "textarea" as const,
      placeholder: "Descreva uma ação concreta para evitar que o problema se repita",
      maxLength: 300,
    },
  ],
  pullsInto: "plano_de_acao.acoes",
};

// --------------------------------------------------------------------------
// ACR — Análise de Causa Raiz
// --------------------------------------------------------------------------

export const acrFlow: AnaliseFlowSchema = {
  flowId: "acr",
  flowName: "Registro de ACR — Análise de Causa Raiz",
  globalNote:
    "Cultura justa, não punitiva: a investigação retrospectiva nunca deve buscar punir individualmente profissionais da ponta assistencial. Foco em vulnerabilidades latentes e barreiras do sistema.",
  sections: [
    {
      id: "secao1",
      title: "Seção 1 — Informações da notificação",
      kind: "form",
      description: "Revise os dados da notificação e informe qual incidente será investigado.",
      fields: [
        {
          id: "resumo_notificacao",
          label: "Resumo do Incidente",
          type: "readonly",
          source:
            "Dados da notificação (Épico 1) e da classificação (US 2.3) já registrados no incidente.",
        },
        {
          id: "incidente_investigado",
          label: "Informe o incidente em investigação",
          type: "text",
          placeholder: "Ex.: Queda do paciente durante a transferência para o leito",
          required: true,
          maxLength: 100,
          helpText:
            "Campo preenchido manualmente por quem está analisando. O texto informado aqui é exibido no topo das próximas seções.",
        },
      ],
    },
    {
      id: "secao2",
      title: "Seção 2 — Informações da análise",
      kind: "form",
      description:
        "Registre quem conduz a análise, os demais participantes, as fontes consultadas e as entrevistas.",
      fields: [
        {
          id: "condutor_analise",
          label: "Condutor da análise",
          type: "table",
          repeatable: false,
          minRows: 1,
          required: true,
          helpTextInline: true,
          helpText:
            "Informe o condutor da análise e, abaixo, os demais membros participantes. Documentar a autoria de forma rastreável evita investigações conduzidas por uma única pessoa.",
          columns: EQUIPE_MEMBRO_COLUMNS,
        },
        {
          id: "membros_participantes",
          label: "Demais membros participantes",
          type: "table",
          repeatable: true,
          minRows: 0,
          requireCompleteRows: true,
          itemLabel: "Membro",
          addButtonLabel: "+ Adicionar membro",
          columns: EQUIPE_MEMBRO_COLUMNS,
        },
        {
          id: "fontes_consultadas",
          label: "Fontes consultadas",
          type: "choice",
          multiple: true,
          allowOther: true,
          required: true,
          helpTextInline: true,
          helpText:
            "Selecione as fontes de informação utilizadas na análise. Você pode selecionar uma ou mais opções.",
          options: FONTES_CONSULTADAS_OPTIONS,
        },
        {
          id: "alguem_precisa_ser_ouvido",
          label: "Alguém precisa ser ouvido?",
          type: "choice",
          options: ["Sim", "Não"],
          required: true,
          helpTextInline: true,
          helpText:
            'Escolha uma das opções. Ao marcar "Sim", registre ao menos uma entrevista na tabela exibida abaixo.',
        },
        {
          id: "registro_entrevistas",
          label: "Registro de cada entrevista",
          type: "table",
          repeatable: true,
          // Obrigatória quando visível (resposta "Sim"): ao menos uma entrevista, com todos os
          // campos preenchidos. Já abre com uma linha em branco pra pessoa começar.
          required: true,
          minRows: 1,
          itemLabel: "Entrevista",
          addButtonLabel: "+ Adicionar entrevista",
          visibleIf: { field: "alguem_precisa_ser_ouvido", equals: "Sim" },
          columns: [
            // Proporção na linha do card: Data 2 · Nome 6 · Função 2.
            { id: "data", label: "Data", type: "date", width: 2 },
            {
              id: "nome",
              label: "Nome",
              type: "text",
              placeholder: "Nome da pessoa entrevistada",
              maxLength: 50,
              width: 6,
            },
            {
              id: "funcao",
              label: "Função",
              type: "choice",
              options: FUNCAO_PROFISSIONAL_OPTIONS,
              allowOther: true,
              width: 2,
            },
            {
              id: "relato",
              label: "Relato / fatos relevantes",
              type: "textarea",
              placeholder: "Descreva o que a pessoa relatou e os fatos relevantes",
              maxLength: 500,
            },
            {
              id: "problemas_percebidos",
              label: "Problemas ou condições percebidos",
              type: "textarea",
              placeholder: "Descreva problemas ou condições que a pessoa percebeu",
              maxLength: 500,
            },
          ],
        },
      ],
    },
    {
      id: "secao3",
      title: "Seção 3 — Cronologia do Incidente",
      kind: "form",
      description:
        "Liste os fatos em ordem cronológica, sempre com a fonte, e registre os problemas na prestação do cuidado (PPC).",
      fields: [
        {
          id: "cronologia",
          label: "Cronologia",
          type: "table",
          repeatable: true,
          // Obrigatória: ao menos um evento, com todos os campos preenchidos. Já abre com uma linha.
          required: true,
          minRows: 1,
          itemLabel: "Evento",
          addButtonLabel: "+ Adicionar evento",
          // Linha do tempo em formato de tabela: um evento por linha, todos os campos lado a lado
          // (com rolagem horizontal se não couber), na ordem Data · Hora · Fato · Fonte · Status.
          layout: "table",
          helpTextInline: true,
          helpText: "Nunca registrar fatos baseados em suposições — sempre indicar a fonte.",
          columns: [
            { id: "data", label: "Data", type: "date" },
            { id: "hora", label: "Hora", type: "time" },
            {
              id: "fato",
              label: "Fato",
              type: "textarea",
              placeholder: "Descreva o que aconteceu neste momento (sem suposições)",
              tableWidth: "420px",
              maxLength: 500,
            },
            {
              id: "fonte",
              label: "Fonte",
              type: "choice",
              options: ["Prontuário", "Inspeção no local", "Entrevista", "Outro"],
              allowOther: true,
            },
            {
              id: "status",
              label: "Status",
              type: "choice",
              options: ["Confirmado", "Provável", "Em análise"],
              helpTextItems: [
                {
                  label: "Confirmado",
                  description: "fonte documental direta.",
                  color: "#16a34a",
                },
                {
                  label: "Provável",
                  description: "relato/entrevista sem confirmação documental.",
                  color: "#f59e0b",
                },
                {
                  label: "Em análise",
                  description:
                    "informação pendente de validação (inclui divergência entre fontes — registrar as duas versões, uma por linha).",
                  color: "#3949ab",
                },
              ],
            },
          ],
        },
        {
          id: "tem_ppc",
          label: "Foi identificado algum Problema na Prestação do Cuidado (PPC)?",
          type: "choice",
          options: ["Não", "Sim"],
          required: true,
          helpTextInline: true,
          helpText:
            "Considere se houve alguma ação ou omissão da equipe que tenha contribuído para o incidente. Exemplos de PPC:",
          helpTextItems: [
            { label: "", description: "não ouvir as preocupações dos pacientes e familiares." },
            { label: "", description: "avaliação inadequada dos riscos." },
            { label: "", description: "falha em monitorizar, observar ou agir." },
            { label: "", description: "decisão incorreta." },
            { label: "", description: "planejamento incorreto, erro de diagnóstico." },
            { label: "", description: "não procurar ajuda quando necessário, pouca cooperação." },
            { label: "", description: "falha na comunicação, não passar plantão." },
            {
              label: "",
              description: "violar prática de segurança, por pressão ou conclusão de tarefa.",
            },
            {
              label: "",
              description:
                "violar prática de segurança, por não ter consciência do risco ou não acreditar na sua efetividade.",
            },
          ],
        },
        {
          id: "ppc",
          label: "Problemas na prestação do cuidado",
          type: "table",
          repeatable: true,
          // Com "Sim" em "Foi identificado algum PPC?": ao menos 1 PPC, com todos os campos
          // preenchidos. Já abre com uma linha. Exibido como tabela, um PPC por linha.
          required: true,
          minRows: 1,
          layout: "table",
          itemLabel: "PPC",
          addButtonLabel: "+ Adicionar PPC",
          visibleIf: { field: "tem_ppc", equals: "Sim" },
          columns: [
            // Numeração automática pela posição da linha (1, 2, 3...) — não editável.
            { id: "numero", label: "PPC nº", type: "auto-index", tableWidth: "80px" },
            {
              id: "ocorrido",
              label: "O que ocorreu (desvio observável)",
              type: "textarea",
              placeholder: "Descreva o desvio observado no cuidado",
              tableWidth: "340px",
              maxLength: 500,
            },
            {
              id: "esperado",
              label: "O esperado",
              type: "textarea",
              placeholder: "Descreva o que deveria ter acontecido",
              tableWidth: "340px",
              maxLength: 500,
            },
            {
              id: "fonte",
              label: "Fonte / evidência",
              type: "choice",
              // Mesmas opções da Fonte da cronologia; "Outro" abre campo de texto (máx. 30).
              options: ["Prontuário", "Inspeção no local", "Entrevista"],
              allowOther: true,
              tableWidth: "240px",
            },
          ],
        },
      ],
    },
    {
      id: "secao4",
      title: "Seção 4 — Análise dos fatores contribuintes",
      kind: "form",
      description:
        "Marque os fatos e PPCs que terão os fatores contribuintes analisados na próxima etapa.",
      fields: [
        {
          id: "itens_selecionados",
          label: "Fatos da Cronologia e PPCs registrados",
          type: "item_selector",
          selectorSources: [
            { fieldId: "cronologia", itemLabel: "Evento", textColumnId: "fato" },
            { fieldId: "ppc", itemLabel: "PPC", textColumnId: "ocorrido" },
          ],
        },
      ],
    },
    {
      id: "secao4a",
      title: "Seção 4A — Fatores contribuintes por item selecionado",
      kind: "form",
      // Texto que antes ficava no ícone de info do campo — agora direto na caixa da seção (uma vez só,
      // em vez de repetir em cada item).
      description:
        'Para cada item selecionado, marque as categorias de fatores contribuintes que se aplicam a ele. Em qualquer categoria marcada, use "Por que isso aconteceu?" para aprofundar com os 5 Porquês quando fizer sentido — não é obrigatório em todas.',
      repeatablePerSelectedItemOf: "itens_selecionados",
      fields: [
        {
          id: "fatores_por_item",
          label: "Fatores contribuintes deste item",
          type: "checklist_with_detail",
          // Ao menos 1 categoria marcada; cada categoria marcada exige seus campos (achado e fonte).
          // O 5 Porquês é opcional, mas cada nível criado precisa estar completo (ver validacao.ts).
          required: true,
          taxonomy: "Protocolo de Londres (revisão 2024) — 8 categorias fixas",
          items: FATORES_CONTRIBUINTES_ITEMS,
          detailFields: FATORES_CONTRIBUINTES_DETAIL_FIELDS,
          allowOther: true,
          otherLabel: "Outro / não mapeado nas categorias acima",
          enablePorques: true,
        },
      ],
    },
    {
      id: "secao6",
      title: "Seção 5 — Resultado (Ishikawa + Recomendações)",
      kind: "form",
      description:
        "Revise o diagrama e registre recomendações ligadas aos achados e causas já identificados.",
      fields: [
        {
          id: "diagrama_ishikawa",
          label: "Diagrama de Ishikawa (espinha de peixe)",
          type: "computed",
          helpText:
            'O Diagrama de Ishikawa (ou espinha de peixe) reúne numa só imagem os fatores contribuintes registrados na Seção 4A, agrupados por categoria, todos convergindo para o incidente — a "cabeça" do peixe. Ele é montado automaticamente e ajuda a enxergar o quadro completo de uma vez: quais áreas mais contribuíram, como as causas se relacionam e onde concentrar os esforços de melhoria. Também é útil para apresentar o resultado da investigação à equipe e à gestão, e serve de base para as recomendações abaixo.',
          helpTextInline: true,
          ishikawaSource: {
            selectorFieldId: "itens_selecionados",
            selectorSources: [
              { fieldId: "cronologia", itemLabel: "Evento", textColumnId: "fato" },
              { fieldId: "ppc", itemLabel: "PPC", textColumnId: "ocorrido" },
            ],
            perItemSectionId: "secao4a",
            checklistFieldId: "fatores_por_item",
          },
        },
        RECOMENDACOES_FIELD,
      ],
      onSubmit: { action: "concluirInvestigacao", next: "fim" },
    },
  ],
};

// --------------------------------------------------------------------------
// Protocolo de Londres — Investigação Rápida
// --------------------------------------------------------------------------

export const londresRapidoFlow: AnaliseFlowSchema = {
  flowId: "londres_rapido",
  flowName: "Protocolo de Londres — Investigação rápida",
  globalNote:
    "'Rápida' não significa superficial: se surgirem dúvidas, versões conflitantes ou necessidade de novas fontes/entrevistas, a investigação pode ser ampliada para a aplicação completa, reaproveitando todos os dados já preenchidos aqui. Cultura justa, não punitiva: foco em vulnerabilidades do sistema, nunca em punição individual.",
  sections: [
    {
      id: "secao1",
      title: "Seção 1 — Informações da notificação",
      kind: "form",
      description: "Revise os dados da notificação e informe qual incidente será investigado.",
      fields: [
        {
          id: "resumo_notificacao",
          label: "Resumo do Incidente",
          type: "readonly",
          source:
            "Dados da notificação (Épico 1) e da classificação (US 2.3) já registrados no incidente.",
        },
        {
          id: "incidente_investigado",
          label: "Informe o incidente em investigação",
          type: "text",
          placeholder: "Ex.: Queda do paciente durante a transferência para o leito",
          required: true,
          maxLength: 100,
          helpText:
            "Campo preenchido manualmente por quem está analisando. O texto informado aqui é levado automaticamente para as telas seguintes deste fluxo.",
        },
      ],
    },
    {
      id: "secao2",
      title: "Seção 2 — Equipe responsável pela análise",
      kind: "form",
      description: "Registre os profissionais que participam da análise.",
      fields: [
        {
          id: "equipe_responsavel",
          label: "Equipe responsável pela análise",
          type: "table",
          repeatable: true,
          minRows: 1,
          helpText:
            "Documentar a autoria da análise de forma rastreável. Evitar investigações conduzidas por uma única pessoa.",
          columns: EQUIPE_RESPONSAVEL_COLUMNS,
        },
      ],
    },
    {
      id: "secao3",
      title: "Seção 3 — Fontes consultadas",
      kind: "form",
      description: "Indique as fontes de informação consultadas.",
      fields: [
        {
          id: "fontes_consultadas",
          label: "Fontes consultadas",
          type: "choice",
          multiple: true,
          helpText: "Marcar apenas fontes realmente consultadas.",
          options: FONTES_CONSULTADAS_OPTIONS,
          allowOther: true,
        },
      ],
    },
    {
      id: "secao4",
      title: "Seção 4 — Linha do tempo",
      kind: "form",
      description: "Registre fatos curtos, em ordem cronológica, sem explicar causas ainda.",
      fields: [
        {
          id: "linha_do_tempo",
          label: "Linha do tempo",
          type: "table",
          repeatable: true,
          itemLabel: "Evento",
          columns: [
            { id: "data", label: "Data", type: "date" },
            { id: "horario", label: "Horário", type: "time" },
            {
              id: "fato",
              label: "Fato",
              type: "textarea",
              placeholder: "Descreva o que aconteceu neste momento (sem suposições)",
            },
            { id: "fonte", label: "Fonte", type: "text" },
          ],
        },
      ],
    },
    {
      id: "secao5",
      title: "Seção 5 — Processo esperado x problema no cuidado",
      kind: "form",
      description:
        "Compare o processo esperado com o que ocorreu, descrevendo o desvio sem atribuir culpa.",
      fields: [
        {
          id: "problemas_cuidado",
          label: "Problemas no cuidado",
          type: "table",
          repeatable: true,
          itemLabel: "PPC",
          columns: [
            {
              id: "esperado",
              label: "O esperado",
              type: "textarea",
              placeholder: "Descreva o que deveria ter acontecido",
            },
            {
              id: "ocorrido",
              label: "O que ocorreu (desvio observável)",
              type: "textarea",
              placeholder: "Descreva o desvio observado no cuidado",
            },
          ],
        },
      ],
    },
    {
      id: "secao6",
      title: "Seção 6 — Fatores contribuintes",
      kind: "form",
      description: "Marque os fatores que contribuíram para o incidente.",
      fields: [
        {
          id: "fatores_contribuintes",
          label: "Fatores contribuintes",
          type: "checklist_with_detail",
          taxonomy: "Protocolo de Londres (revisão 2024) — 8 categorias fixas",
          items: FATORES_CONTRIBUINTES_ITEMS,
          detailFields: FATORES_CONTRIBUINTES_DETAIL_FIELDS,
          allowOther: true,
          otherLabel: "Outro / não mapeado nas categorias acima",
        },
      ],
    },
    {
      id: "secao7",
      title: "Seção 7 — Recomendação",
      kind: "form",
      description: "Registre recomendações ligadas aos problemas e fatores identificados.",
      fields: [RECOMENDACOES_FIELD],
    },
    {
      id: "secao8",
      title: "Seção 8 — Checagem de suficiência",
      kind: "decision",
      description: "Indique se a análise foi suficiente ou se precisa ser aprofundada.",
      fields: [
        {
          id: "analise_suficiente",
          label: "A análise foi suficiente?",
          type: "choice",
          options: [
            { value: "sim", label: "Sim — compreendemos suficientemente o caso" },
            { value: "nao", label: "Não — precisamos aprofundar" },
          ],
        },
      ],
      decisionLogic: [
        { if: { field: "analise_suficiente", equals: "sim" }, next: { goto: "fim" } },
        {
          if: { field: "analise_suficiente", equals: "nao" },
          next: {
            goto: "londres_completo.secao1",
            carryOverData: ["secao1", "secao2", "secao3", "secao4", "secao5", "secao6", "secao7"],
            mapping: {
              "secao4.linha_do_tempo":
                "londres_completo.secao5.cronologia_ampliada (status default = Confirmado, revisar)",
              "secao5.problemas_cuidado": "londres_completo.secao6.ppc",
              "secao6.fatores_contribuintes":
                "londres_completo.secao7.fatores_contribuintes (vincular a um PPC)",
              "secao7.recomendacoes": "londres_completo.secao8.recomendacoes",
            },
          },
        },
      ],
    },
  ],
};

// --------------------------------------------------------------------------
// Protocolo de Londres — Investigação Completa/Detalhada
// --------------------------------------------------------------------------

export const londresCompletoFlow: AnaliseFlowSchema = {
  flowId: "londres_completo",
  flowName: "Protocolo de Londres — Investigação completa",
  globalNote:
    "Considere especialmente o aprofundamento quando houver maior probabilidade de repetição, possibilidade de consequências graves ou importante potencial de aprendizagem para a organização. Cultura justa, não punitiva: foco em vulnerabilidades do sistema, nunca em punição individual.",
  sections: [
    {
      id: "secao1",
      title: "Seção 1 — Informações da notificação",
      kind: "form",
      description: "Revise os dados da notificação e informe qual incidente será investigado.",
      fields: [
        {
          id: "resumo_notificacao",
          label: "Resumo do Incidente",
          type: "readonly",
          source:
            "Dados da notificação (Épico 1) e da classificação (US 2.3) já registrados no incidente.",
        },
        {
          id: "incidente_investigado",
          label: "Informe o incidente em investigação",
          type: "text",
          placeholder: "Ex.: Queda do paciente durante a transferência para o leito",
          required: true,
          maxLength: 100,
          helpText:
            "Campo preenchido manualmente por quem está analisando. O texto informado aqui é levado automaticamente para as telas seguintes deste fluxo.",
        },
      ],
    },
    {
      id: "secao2",
      title: "Seção 2 — Equipe responsável pela análise",
      kind: "form",
      description: "Registre os profissionais que participam da análise.",
      fields: [
        {
          id: "equipe_responsavel",
          label: "Equipe responsável pela análise",
          type: "table",
          repeatable: true,
          minRows: 1,
          helpText:
            "Documentar a autoria da análise de forma rastreável. Evitar investigações conduzidas por uma única pessoa.",
          columns: EQUIPE_RESPONSAVEL_COLUMNS,
        },
      ],
    },
    {
      id: "secao3",
      title: "Seção 3 — Fontes consultadas",
      kind: "form",
      description: "Indique as fontes de informação consultadas.",
      fields: [
        {
          id: "fontes_consultadas",
          label: "Fontes consultadas",
          type: "choice",
          multiple: true,
          helpText: "Marcar apenas fontes realmente consultadas.",
          options: FONTES_CONSULTADAS_OPTIONS,
          allowOther: true,
        },
      ],
    },
    {
      id: "secao4",
      title: "Seção 4 — Entrevistas",
      kind: "form",
      description: "Registre quem pode esclarecer os fatos, preservando versões divergentes.",
      fields: [
        {
          id: "quem_ouvir",
          label: "Quem precisa ser ouvido?",
          type: "choice",
          multiple: true,
          options: [
            "Profissional diretamente envolvido",
            "Outro membro da equipe",
            "Liderança",
            "Paciente/família",
            "Equipe de apoio",
          ],
          allowOther: true,
        },
        {
          id: "registro_entrevistas",
          label: "Registro de cada entrevista",
          type: "table",
          repeatable: true,
          itemLabel: "Entrevista",
          columns: [
            { id: "data", label: "Data", type: "date" },
            {
              id: "nome",
              label: "Nome",
              type: "text",
              placeholder: "Nome da pessoa entrevistada",
              maxLength: 50,
            },
            { id: "funcao", label: "Função", type: "text", placeholder: "Ex.: Enfermeiro(a)" },
            {
              id: "relato",
              label: "Relato / fatos relevantes",
              type: "textarea",
              placeholder: "Descreva o que a pessoa relatou e os fatos relevantes",
            },
            {
              id: "problemas_percebidos",
              label: "Problemas ou condições percebidos",
              type: "textarea",
              placeholder: "Descreva problemas ou condições que a pessoa percebeu",
            },
          ],
        },
      ],
    },
    {
      id: "secao5",
      title: "Seção 5 — Cronologia ampliada",
      kind: "form",
      description: "Amplie a cronologia com fatos, fontes e divergências, sem suposições.",
      fields: [
        {
          id: "cronologia_ampliada",
          label: "Cronologia ampliada",
          type: "table",
          repeatable: true,
          itemLabel: "Evento",
          columns: [
            { id: "data", label: "Data", type: "date" },
            { id: "hora", label: "Hora", type: "time" },
            {
              id: "fato",
              label: "Fato",
              type: "textarea",
              placeholder: "Descreva o que aconteceu neste momento (sem suposições)",
            },
            { id: "fonte", label: "Fonte", type: "text" },
            {
              id: "status",
              label: "Status",
              type: "choice",
              options: ["Confirmado", "Provável", "Divergente"],
              helpText:
                "Confirmado = fonte documental direta. Provável = relato/entrevista sem confirmação documental. Divergente = duas fontes descrevem o mesmo momento de forma diferente (registrar as duas versões, uma por linha).",
            },
          ],
        },
      ],
    },
    {
      id: "secao6",
      title: "Seção 6 — Problemas na prestação do cuidado (PPC)",
      kind: "form",
      description: "Compare o esperado com o ocorrido em cada desvio, sem presumir a causa.",
      fields: [
        {
          id: "ppc",
          label: "Problemas na prestação do cuidado",
          type: "table",
          repeatable: true,
          itemLabel: "PPC",
          columns: [
            { id: "numero", label: "PPC nº", type: "text", placeholder: "Ex.: 1" },
            {
              id: "esperado",
              label: "O esperado",
              type: "textarea",
              placeholder: "Descreva o que deveria ter acontecido",
            },
            {
              id: "ocorrido",
              label: "O que ocorreu (desvio observável)",
              type: "textarea",
              placeholder: "Descreva o desvio observado no cuidado",
            },
            {
              id: "fonte",
              label: "Fonte / evidência",
              type: "text",
              placeholder: "Ex.: prontuário, entrevista, protocolo",
            },
          ],
        },
      ],
    },
    {
      id: "secao7",
      title: "Seção 7 — Fatores contribuintes por problema",
      kind: "form",
      description: "Para cada PPC, marque os fatores contribuintes vinculados a ele.",
      repeatablePerItemOf: "secao6.ppc",
      fields: [
        { id: "ppc_referencia", label: "PPC nº a que este bloco se refere", type: "text" },
        {
          id: "fatores_contribuintes",
          label: "Fatores contribuintes",
          type: "checklist_with_detail",
          taxonomy: "Protocolo de Londres (revisão 2024) — 8 categorias fixas",
          items: FATORES_CONTRIBUINTES_ITEMS,
          detailFields: FATORES_CONTRIBUINTES_DETAIL_FIELDS,
          allowOther: true,
          otherLabel: "Outro / não mapeado nas categorias acima",
          linkedTo: "secao6.ppc",
        },
      ],
    },
    {
      id: "secao8",
      title: "Seção 8 — Recomendações",
      kind: "form",
      description: "Registre recomendações ligadas aos PPCs e fatores identificados.",
      fields: [RECOMENDACOES_FIELD],
      onSubmit: { action: "concluirInvestigacao", next: "fim" },
    },
  ],
};

export const ANALISE_FLOWS: Record<string, AnaliseFlowSchema> = {
  acr: acrFlow,
  londres_rapido: londresRapidoFlow,
  londres_completo: londresCompletoFlow,
};
