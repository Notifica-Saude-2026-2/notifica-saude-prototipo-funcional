import type {
  AnaliseFormSchema,
  ChecklistItemDef,
  DetailFieldDef,
  TableColumn,
} from "../types/analise";

// --------------------------------------------------------------------------
// Categorias de fatores contribuintes — 8 categorias fixas
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
    example: "clareza do processo, protocolo disponível, acesso à informação necessária",
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
    label: "Descreva o fator identificado e como ele contribuiu para este PPC",
    type: "textarea",
    placeholder: "Ex.: medicamentos com nomes semelhantes eram armazenados próximos",
  },
  {
    id: "fonte",
    label: "Fonte/evidência",
    type: "checkboxes",
    optional: true,
    options: [
      "Prontuário",
      "Entrevista",
      "Observação",
      "Protocolo/documento",
      "Sistema eletrônico",
      "Outro",
    ],
  },
];

/** Colunas da tabela de PPC (Seção 3) — também usadas no "Adicionar PPC" da Seção 4. */
export const PPC_COLUMNS: TableColumn[] = [
  // Numeração automática pela posição da linha (1, 2, 3...) — não editável.
  { id: "numero", label: "Nº", type: "auto-index", tableWidth: "50px" },
  {
    id: "problema",
    label: "Descreva o problema na prestação do cuidado (PPC)",
    type: "textarea",
    placeholder: "Ex.: administração de medicamento diferente do prescrito",
    tableWidth: "300px",
    maxLength: 500,
    rows: 3,
  },
  {
    id: "esperado",
    label: "O que deveria ter acontecido?",
    type: "textarea",
    placeholder: "Descreva o que deveria ter acontecido",
    tableWidth: "300px",
    maxLength: 500,
    rows: 3,
  },
  {
    id: "ocorrido",
    label: "O que aconteceu de diferente?",
    type: "textarea",
    placeholder: "Descreva o que aconteceu de diferente",
    tableWidth: "300px",
    maxLength: 500,
    rows: 3,
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

// --------------------------------------------------------------------------
// Equipe da análise — Formação/Função/Setor como listas pré-definidas (sempre com "Outro" como
// escape) em vez de texto livre, para reduzir divergência de grafia entre análises.
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
  label: "Recomendações de melhoria",
  type: "table" as const,
  repeatable: true,
  minRows: 1,
  itemLabel: "Recomendação",
  addButtonLabel: "+ Adicionar recomendação",
  helpText:
    "As recomendações devem ter relação clara com os fatores contribuintes identificados e estar direcionadas à redução das fragilidades do processo ou do sistema encontradas na investigação. Após o registro das recomendações, o próximo passo é a elaboração do Plano de Ação. Quando houver mais de uma recomendação, a equipe deve considerar sua priorização, definindo quais medidas exigem implementação imediata e quais poderão ser executadas em prazos maiores.",
  helpTextInline: true,
  // Uma linha por recomendação: "Recomendação N" + campo + lixeira (ver layout "lista" na
  // TableField). Opcional, mas cada recomendação adicionada precisa ser preenchida (até 300).
  layout: "lista" as const,
  requireCompleteRows: true,
  columns: [
    {
      id: "recomendacao",
      label: "Recomendação",
      type: "textarea" as const,
      placeholder: "Descreva a recomendação de melhoria...",
      maxLength: 300,
    },
  ],
  pullsInto: "plano_de_acao.acoes",
};

// --------------------------------------------------------------------------
// Formulário de análise — único. Não existe escolha de metodologia: a análise é sempre este
// formulário, com todas as seções; o que não se aplica simplesmente fica sem valor.
// --------------------------------------------------------------------------

export const ANALISE_FORM: AnaliseFormSchema = {
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
      title: "Seção 3 — Cronologia do incidente",
      kind: "form",
      description:
        "**Construa a cronologia do incidente** em ordem, mostrando os fatos que antecederam o evento, o momento em que ele aconteceu e o que foi feito depois. Registre um fato por linha, sempre com a fonte.",
      howTo: {
        title: "Como preencher",
        items: [
          {
            label: "Um fato por linha:",
            text: "uma ação, um acontecimento ou uma mudança no estado do paciente.",
          },
          {
            label: "Descreva sem julgar:",
            text: 'identifique as pessoas pela função, não pelo nome, e evite palavras como "erro", "falha" ou "esqueceu".',
          },
          {
            label: "Cruze as fontes:",
            text: 'compare prontuário, documentos e entrevistas. Se não conferirem, registre cada versão em uma linha e marque "Em análise".',
          },
        ],
      },
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
          examples: {
            title: "Exemplo de registro da cronologia",
            rows: [
              {
                data: "14/04/2025",
                hora: "08:00",
                fato: "Médico plantonista prescreve ceftriaxona 1 g EV.",
                fonte: "Prontuário",
                status: "Confirmado",
              },
              {
                data: "14/04/2025",
                hora: "08:20",
                fato: "Técnica de enfermagem separa ampola de cefazolina 1 g para administração.",
                fonte: "Entrevista",
                status: "Em análise",
              },
              {
                data: "14/04/2025",
                hora: "08:30",
                fato: "Cefazolina 1 g EV é administrada ao paciente.",
                fonte: "Prontuário",
                status: "Confirmado",
              },
              {
                data: "14/04/2025",
                hora: "09:10",
                fato: "Durante conferência da prescrição, enfermeira identifica que o medicamento prescrito era ceftriaxona 1 g EV.",
                fonte: "Prontuário",
                status: "Confirmado",
              },
              {
                data: "14/04/2025",
                hora: "09:20",
                fato: "Médico assistente é comunicado e paciente permanece em observação.",
                fonte: "Prontuário",
                status: "Confirmado",
              },
            ],
          },
          reviewChecklist: {
            title: "Antes de seguir, confira",
            items: [
              "A sequência começa antes do incidente",
              "Inclui o momento em que ele foi percebido e o que foi feito depois",
              "Os fatos estão descritos sem julgamento",
              "As divergências entre fontes estão registradas",
            ],
          },
          rowAlert: {
            columnId: "status",
            equals: "Em análise",
            singular: "Há 1 fato em análise.",
            plural: "Há {n} fatos em análise.",
            text: "Confirme se a divergência foi registrada.",
          },
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
          id: "ppc",
          label: "Problemas na Prestação do Cuidado (PPC)",
          type: "table",
          repeatable: true,
          // Sempre visível e opcional nesta seção (pode não haver PPC), mas cada PPC adicionado
          // precisa estar completo. Exibido como tabela, um PPC por linha. A Seção 4 exige ao menos
          // 1 PPC (é lá que eles são analisados) e permite adicionar outros.
          requireCompleteRows: true,
          layout: "table",
          itemLabel: "PPC",
          addButtonLabel: "+ Adicionar PPC",
          helpTextInline: true,
          helpText:
            "Com base na cronologia acima, identifique se houve alguma ação, omissão, decisão ou **falha no processo de cuidado** que foi diferente do que deveria ter acontecido e que teve importância na sequência do incidente. Pode haver mais de um PPC no mesmo incidente.",
          guidePanels: {
            title: "Como identificar um PPC",
            steps: [
              'Reveja a cronologia e pergunte: "O que aconteceu no cuidado que foi diferente do que deveria ter acontecido?"',
              "Registre apenas a ação, omissão ou decisão específica.",
              "O PPC nem sempre é um erro de alguém. Também conta quando um equipamento, sistema ou processo falhou durante o cuidado. *Ex.: a bomba de infusão infundiu mais rápido do que o programado.*",
              "Não registre aqui as causas do problema; elas serão analisadas na etapa de fatores contribuintes.",
            ],
            columns: [
              {
                title: "Exemplos de PPC",
                tone: "positivo",
                items: [
                  "administração de medicamento diferente do prescrito;",
                  "não realizar avaliação ou monitorização prevista;",
                  "falha de comunicação durante o cuidado (ex.: informação clínica relevante não foi passada no plantão);",
                  "decisão clínica inadequada;",
                  "não seguir protocolo de segurança;",
                  "falha de equipamento durante o cuidado (ex.: bomba de infusão).",
                ],
              },
              {
                title: "Não são PPC (são fatores contribuintes, analisados depois)",
                tone: "negativo",
                items: [
                  "falta de pessoal;",
                  "sobrecarga de trabalho;",
                  "ausência de rotina de comunicação entre setores;",
                  "falta de treinamento;",
                  "condições de infraestrutura inadequadas;",
                  "problemas organizacionais.",
                ],
              },
            ],
          },
          columns: PPC_COLUMNS,
        },
      ],
    },
    {
      id: "secao4",
      title: "Seção 4 — Fatores contribuintes",
      kind: "form",
      // Uma linha por parágrafo (\n), como no protótipo da proponente.
      description:
        "**Nesta seção, vamos investigar por que cada Problema na Prestação do Cuidado (PPC) aconteceu.**\n" +
        "Para cada PPC identificado, procure entender quais condições estavam presentes e podem ter favorecido sua ocorrência. Essas condições são chamadas de fatores contribuintes e podem estar relacionadas ao paciente, aos profissionais, às tarefas, à equipe, ao ambiente de trabalho, à tecnologia, à organização ou ao contexto institucional.\n" +
        "**Analise um PPC por vez e registre apenas os fatores que realmente tiveram relação com ele.**\n" +
        "Clique em um problema abaixo para iniciar a análise.",
      fields: [
        {
          // Um cartão por PPC da Seção 3; "Identificar fatores contribuintes" abre a análise daquele
          // PPC na própria linha (ver FatoresPorPpcField). Todo PPC precisa de ao menos 1 fator.
          id: "fatores_por_ppc",
          label: "Problemas na Prestação do Cuidado (PPC) identificados neste incidente",
          type: "ppc_fatores",
          required: true,
          ppcSourceFieldId: "ppc",
          items: FATORES_CONTRIBUINTES_ITEMS,
          detailFields: FATORES_CONTRIBUINTES_DETAIL_FIELDS,
          enablePorques: true,
        },
      ],
    },
    {
      id: "secao6",
      title: "Seção 5 — Resultado (Ishikawa + Recomendações)",
      kind: "form",
      description:
        "O resultado da análise está apresentado no Diagrama de Ishikawa abaixo. O diagrama reúne os fatores contribuintes identificados na investigação e os organiza por categoria. Cada fator está vinculado ao respectivo problema na prestação do cuidado ao qual se relaciona. Quando um fator tiver sido aprofundado com os 5 Porquês, o diagrama também apresenta as causas identificadas nesse aprofundamento, preservando a relação entre o fator inicial e as causas subsequentes.",
      fields: [
        {
          id: "diagrama_ishikawa",
          label: "Diagrama de Ishikawa (espinha de peixe)",
          type: "computed",
          // A explicação do diagrama fica na caixa de informação da seção (description).
          ishikawaSource: {
            // Sem selectorFieldId: entram todos os PPCs (não há mais etapa de seleção).
            selectorSources: [{ fieldId: "ppc", itemLabel: "PPC", textColumnId: "problema" }],
            perItemSectionId: "fatores_por_ppc",
          },
        },
        RECOMENDACOES_FIELD,
      ],
      onSubmit: { action: "concluirInvestigacao", next: "fim" },
    },
  ],
};
