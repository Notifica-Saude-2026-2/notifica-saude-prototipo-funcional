import type { AnaliseFlowSchema, ChecklistItemDef, DetailFieldDef } from "../types/analise";

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
  { id: "achado", label: "O que foi identificado / achado", type: "textarea" },
  { id: "fonte", label: "Fonte / evidência", type: "text" },
];

const EQUIPE_RESPONSAVEL_COLUMNS = [
  { id: "nome", label: "Nome do profissional", type: "text" as const },
  { id: "formacao", label: "Formação", type: "text" as const },
  { id: "funcao", label: "Função", type: "text" as const },
  { id: "setor", label: "Setor", type: "text" as const },
];

const FONTES_CONSULTADAS_OPTIONS = [
  "Prontuário",
  "Prescrição",
  "Protocolo/POP",
  "Relato da equipe",
  "Paciente/família",
  "Log do sistema",
  "Equipamento/material",
  "Auditoria",
];

const RECOMENDACOES_FIELD = {
  id: "recomendacoes",
  label: "Recomendações",
  type: "table" as const,
  repeatable: true,
  minRows: 1,
  itemLabel: "Recomendação",
  helpText: "Uma recomendação concreta por linha, ligada ao problema e aos fatores identificados.",
  columns: [{ id: "recomendacao", label: "Recomendação", type: "textarea" as const }],
  pullsInto: "plano_de_acao.acoes",
};

const PLANO_DE_ACAO_SECTION = {
  id: "plano_de_acao",
  title: "Plano de Ação",
  kind: "form" as const,
  description:
    "Preencha o plano de ação e conclua a investigação. Os itens de 'Recomendações' da seção anterior já foram pré-carregados no Plano de Ação da notificação (seção 'Plano de ação', mais abaixo na tela).",
  fields: [
    {
      id: "acoes_resumo",
      label: "Ações do plano (edite os detalhes completos no Plano de Ação da notificação)",
      type: "table" as const,
      repeatable: true,
      itemLabel: "Ação",
      prefilledFrom: "recomendacoes",
      columns: [
        { id: "acao", label: "Ação corretiva/preventiva", type: "textarea" as const },
        { id: "responsavel", label: "Responsável pela execução", type: "text" as const },
        { id: "prazo", label: "Prazo previsto", type: "date" as const },
      ],
    },
  ],
  onSubmit: { action: "concluirInvestigacao", next: "fim" },
};

// --------------------------------------------------------------------------
// ACR — Análise de Causa Raiz
// --------------------------------------------------------------------------

export const acrFlow: AnaliseFlowSchema = {
  flowId: "acr",
  flowName: "ACR — Análise de Causa Raiz",
  globalNote:
    "Cultura justa, não punitiva: a investigação retrospectiva nunca deve buscar punir individualmente profissionais da ponta assistencial. Foco em vulnerabilidades latentes e barreiras do sistema.",
  sections: [
    {
      id: "secao1",
      title: "Seção 1 — Resumo do Incidente",
      kind: "form",
      fields: [
        {
          id: "resumo_notificacao",
          label: "Resumo do Incidente",
          type: "readonly",
          source:
            "Dados da notificação (Épico 1) e da classificação (US 2.3) já registrados no incidente.",
        },
      ],
    },
    {
      id: "secao2",
      title: "Seção 2 — Equipe responsável pela análise",
      kind: "form",
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
      title: "Seção 3 — Cronologia e classificação dos elementos",
      kind: "form",
      fields: [
        {
          id: "cronologia",
          label: "Cronologia",
          type: "table",
          repeatable: true,
          itemLabel: "Evento",
          helpText: "Nunca registrar fatos baseados em suposições — sempre indicar a fonte.",
          columns: [
            { id: "data", label: "Data", type: "date" },
            { id: "hora", label: "Hora", type: "time" },
            { id: "fato", label: "Fato", type: "textarea" },
            {
              id: "classificacao",
              label: "Classificação",
              type: "choice",
              options: ["Evento", "Condição", "Fator causal", "Item de nota"],
              helpText:
                "Evento: ação/fato pontual com hora registrada. Condição: situação preexistente no cenário. Fator causal: falha que, se corrigida, evitaria o incidente ou reduziria o dano. Item de nota: problema percebido mas sem relação direta com este incidente.",
            },
            {
              id: "status",
              label: "Status",
              type: "choice",
              options: ["Confirmado", "Provável", "Divergente", "NA"],
              helpText:
                "Confirmado = fonte documental direta. Provável = relato/entrevista sem confirmação documental. Divergente = duas fontes descrevem o mesmo momento de forma diferente (registrar as duas versões, uma por linha).",
            },
            { id: "fonte", label: "Fonte", type: "text" },
          ],
        },
      ],
    },
    {
      id: "secao4",
      title: "Seção 4 — Fatores contribuintes (Ishikawa)",
      kind: "form",
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
          helpText:
            "Confira ao final: o diagrama resultante representa adequadamente o caso? Sinalize hipóteses ainda não confirmadas no campo de evidência.",
        },
        {
          id: "diagrama_ishikawa",
          label: "Diagrama de Ishikawa (espinha de peixe)",
          type: "computed",
          generatedFrom: "fatores_contribuintes",
        },
      ],
    },
    {
      id: "secao5",
      title: "Seção 5 — Aprofundamento guiado (opcional)",
      kind: "form",
      description:
        "Use uma ferramenta de apoio apenas quando necessário. Não é obrigatório nem esperado usar as três ferramentas: cada aprofundamento cobre UM fator com UMA ferramenta, e pode haver 0, 1 ou vários aprofundamentos. O resultado fica sempre vinculado ao fator que o originou; uma hipótese não vira causa confirmada automaticamente.",
      fields: [
        {
          id: "precisa_aprofundar",
          label: "Algum fator precisa ser compreendido?",
          type: "choice",
          options: ["Não", "Sim"],
        },
        {
          id: "aprofundamentos",
          label: "Aprofundamentos registrados (0 ou mais)",
          type: "repeatable_choice_group",
          visibleIf: { field: "precisa_aprofundar", equals: "Sim" },
          helpText:
            "Cada item = 1 fator + 1 ferramenta escolhida para esse fator. Para aprofundar outro fator, adicione um novo item (pode repetir a mesma ferramenta ou usar outra).",
          itemCommonFields: [
            {
              id: "fator_investigacao",
              label: "Fator em investigação (copiado da Seção 3/4)",
              type: "text",
            },
          ],
          itemChoiceField: {
            id: "ferramenta",
            label: "Ferramenta escolhida para este fator",
            type: "choice",
            multiple: false,
            options: [
              {
                value: "5_porques",
                label: "5 Porquês",
                when: "O fator já está claro, mas falta chegar à causa mais profunda por trás dele.",
              },
              {
                value: "analise_barreiras",
                label: "Análise de Barreiras",
                when: "Existia (ou deveria existir) uma proteção (checagem, alarme, protocolo) e ela não impediu o incidente.",
              },
              {
                value: "analise_mudancas",
                label: "Análise de Mudanças",
                when: "O processo normalmente funciona bem e algo foi diferente desta vez.",
              },
            ],
          },
          itemSchemas: {
            "5_porques": {
              fields: [
                {
                  id: "niveis",
                  label: "Níveis de 'Por quê?'",
                  type: "table",
                  repeatable: true,
                  itemLabel: "Porquê",
                  helpText:
                    "Não é obrigatório chegar exatamente a 5 níveis — pare quando a resposta apontar para algo sistêmico e acionável.",
                  columns: [
                    { id: "nivel", label: "Nível", type: "text" },
                    { id: "pergunta", label: "Por que aconteceu?", type: "textarea" },
                    { id: "resposta", label: "Resposta", type: "textarea" },
                    { id: "evidencia", label: "Evidência / fonte", type: "text" },
                  ],
                },
                { id: "causa_raiz", label: "Causa raiz identificada", type: "textarea" },
              ],
            },
            analise_barreiras: {
              fields: [
                { id: "barreira_existia", label: "A barreira existia?", type: "textarea" },
                { id: "barreira_usada", label: "Foi usada?", type: "textarea" },
                { id: "barreira_funcionou", label: "Funcionou como esperado?", type: "textarea" },
                {
                  id: "explicacao_falha",
                  label: "O que explica a falha (ou ausência) da barreira?",
                  type: "textarea",
                },
                {
                  id: "necessidade",
                  label: "O que precisa ser criado / fortalecido / redesenhado",
                  type: "textarea",
                },
              ],
            },
            analise_mudancas: {
              fields: [
                {
                  id: "dimensoes",
                  label: "Comparação por dimensão",
                  type: "table",
                  repeatable: false,
                  fixedRows: [
                    "Pessoas / equipe",
                    "Processo / etapas seguidas",
                    "Equipamentos / materiais",
                    "Ambiente / carga de trabalho",
                    "Comunicação",
                  ],
                  columns: [
                    { id: "quando_funciona", label: "Quando funciona", type: "textarea" },
                    { id: "neste_incidente", label: "Neste incidente", type: "textarea" },
                    {
                      id: "diferenca_contribuiu",
                      label: "Diferença contribuiu?",
                      type: "choice",
                      options: ["Sim", "Não", "Talvez"],
                    },
                  ],
                },
                { id: "diferenca_relevante", label: "Diferença mais relevante", type: "textarea" },
              ],
            },
          },
        },
      ],
    },
    {
      id: "secao6",
      title: "Seção 6 — Recomendações",
      kind: "form",
      description:
        "Se a Seção 5 foi usada, parta das conclusões já registradas lá (causa raiz / necessidade / diferença relevante) em vez de propor recomendação nova sem relação com o apurado.",
      fields: [RECOMENDACOES_FIELD],
    },
    PLANO_DE_ACAO_SECTION,
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
      title: "Seção 1 — Resumo do Incidente",
      kind: "form",
      fields: [
        {
          id: "resumo_notificacao",
          label: "Resumo do Incidente",
          type: "readonly",
          source:
            "Dados da notificação (Épico 1) e da classificação (US 2.3) já registrados no incidente.",
        },
      ],
    },
    {
      id: "secao2",
      title: "Seção 2 — Equipe responsável pela análise",
      kind: "form",
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
      description: "Registre fatos curtos, na ordem dos acontecimentos. Não explique causas ainda.",
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
            { id: "fato", label: "Fato", type: "textarea" },
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
        "Descreva o desvio observável comparando com o esperado. Evite explicações como 'desatenção' ou 'erro humano'.",
      fields: [
        {
          id: "problemas_cuidado",
          label: "Problemas no cuidado",
          type: "table",
          repeatable: true,
          itemLabel: "PPC",
          columns: [
            { id: "esperado", label: "O esperado", type: "textarea" },
            { id: "ocorrido", label: "O que ocorreu (desvio observável)", type: "textarea" },
          ],
        },
      ],
    },
    {
      id: "secao6",
      title: "Seção 6 — Fatores contribuintes",
      kind: "form",
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
      fields: [RECOMENDACOES_FIELD],
    },
    {
      id: "secao8",
      title: "Seção 8 — Checagem de suficiência",
      kind: "decision",
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
        { if: { field: "analise_suficiente", equals: "sim" }, next: { goto: "secao9" } },
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
    {
      id: "secao9",
      title: "Seção 9 — Plano de Ação",
      kind: "form",
      fields: PLANO_DE_ACAO_SECTION.fields,
      onSubmit: { action: "concluirInvestigacao", next: "fim" },
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
      title: "Seção 1 — Resumo do Incidente",
      kind: "form",
      fields: [
        {
          id: "resumo_notificacao",
          label: "Resumo do Incidente",
          type: "readonly",
          source:
            "Dados da notificação (Épico 1) e da classificação (US 2.3) já registrados no incidente.",
        },
      ],
    },
    {
      id: "secao2",
      title: "Seção 2 — Equipe responsável pela análise",
      kind: "form",
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
      description:
        "Selecione quem pode esclarecer fatos, decisões ou condições do cuidado. Preserve versões divergentes, não force consenso.",
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
            { id: "nome", label: "Nome", type: "text" },
            { id: "funcao", label: "Função", type: "text" },
            { id: "relato", label: "Relato / fatos relevantes", type: "textarea" },
            {
              id: "problemas_percebidos",
              label: "Problemas ou condições percebidos",
              type: "textarea",
            },
          ],
        },
      ],
    },
    {
      id: "secao5",
      title: "Seção 5 — Cronologia ampliada",
      kind: "form",
      description:
        "Inclua fatos, fontes e divergências até a sequência ficar compreensível. Nunca registre fatos baseados em suposições.",
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
            { id: "fato", label: "Fato", type: "textarea" },
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
      description:
        "PPC é o termo neutro do Protocolo de Londres para os desvios observáveis na assistência. Compare o esperado com o ocorrido; não presuma a causa nesta etapa.",
      fields: [
        {
          id: "ppc",
          label: "Problemas na prestação do cuidado",
          type: "table",
          repeatable: true,
          itemLabel: "PPC",
          columns: [
            { id: "numero", label: "PPC nº", type: "text" },
            { id: "esperado", label: "O esperado", type: "textarea" },
            { id: "ocorrido", label: "O que ocorreu (desvio observável)", type: "textarea" },
            { id: "fonte", label: "Fonte / evidência", type: "text" },
          ],
        },
      ],
    },
    {
      id: "secao7",
      title: "Seção 7 — Fatores contribuintes por problema",
      kind: "form",
      description:
        "Este bloco se repete para cada PPC identificado na Seção 6. Todo fator deve ficar vinculado a pelo menos um PPC — não é permitido registrar um fator solto.",
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
      fields: [RECOMENDACOES_FIELD],
    },
    PLANO_DE_ACAO_SECTION,
  ],
};

export const ANALISE_FLOWS: Record<string, AnaliseFlowSchema> = {
  acr: acrFlow,
  londres_rapido: londresRapidoFlow,
  londres_completo: londresCompletoFlow,
};
