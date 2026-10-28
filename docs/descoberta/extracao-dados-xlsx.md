# Descoberta: extração de dados (relatório XLSX)

Rascunho da descoberta feita no protótipo. Quando a feature for finalizada, este conteúdo vira épico, histórias de usuário, critérios de aceite e regras de negócio na Especificação de Requisitos.

- **Situação:** em descoberta
- **Início:** 26/10/2026

## Objetivo

Permitir que quem acompanha os incidentes extraia, em uma planilha XLSX bem formatada, todos os incidentes a que tem acesso, com os dados de cada um.

## Atores e escopo

| Perfil              | O que entra no relatório                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Profissional do NSP | Todos os incidentes da instituição.                                                                                |
| Gestor da área      | Somente os incidentes do próprio setor encaminhados a ele (RN-26), sem a indicação de notificação anônima (RN-27). |

## Decisões validadas

| Data       | Decisão                                                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 26/10/2026 | O NSP extrai os incidentes da instituição inteira; o gestor da área extrai os do próprio setor.                                                                    |
| 26/10/2026 | O botão é azul, com ícone de download, texto "Extrair dados" e dica "Extrair xlsx" ao passar o mouse.                                                              |
| 26/10/2026 | O botão fica na barra de filtros, à direita do último filtro ("Ordenar por"), com a mesma altura dos campos. No celular, ocupa a linha inteira abaixo dos filtros. |
| 26/10/2026 | Nome e contato do notificante nunca são exportados em relatórios, para nenhum perfil.                                                                              |
| 26/10/2026 | Na aba Resumo, as tabelas de percentuais ficam lado a lado, e a planilha não tem título nem aviso sobre o notificante.                                             |
| 26/10/2026 | O arquivo é gerado no frontend; o foco é a formatação da planilha.                                                                                                 |

## Regras de negócio

- **Sigilo do notificante nos relatórios:** nome e contato (celular/e-mail) do notificante nunca são exportados em relatórios, para nenhum perfil, inclusive o NSP. Validada em 26/10/2026.

## Proposta implementada no protótipo (aguardando validação)

### Botão

- Aparece no título de todas as listas (Todos incidentes, Novos, Classificados, Encaminhados, Em análise, Em ação, Concluídos e Arquivados).
- Exporta sempre todos os incidentes do escopo do perfil, independentemente da aba aberta e dos filtros aplicados.
- Durante a geração, o botão mostra "Gerando..." e fica desabilitado; ao terminar, aparece o aviso "Relatório gerado com N incidentes." (ou de erro, se falhar).

### Arquivo

- Nome: `notificasaude-incidentes-<instituicao ou setor>-AAAA-MM-DD.xlsx`.
- Três abas:
  - **Resumo:** instituição, escopo, data e hora da geração, quem gerou e total de incidentes, sem título no topo. Abaixo, três tabelas lado a lado com quantidade e percentual de incidentes por status (os oito status do ciclo de vida), por setor e por grau do dano.
  - **Incidentes:** uma linha por incidente, do mais recente para o mais antigo: incidente (código, ex.: #1006), status, data, turno e horário do incidente, data do registro, instituição, setor, descrição, envolve paciente, faixa etária, sexo, papel do notificante, notificação anônima (só para o NSP), classificação, never event, tipos de incidente, envolvidos, grau do dano, data da classificação, prazo para análise, responsável, situação da análise, quem analisou (setor ou núcleo), incidente investigado, data de conclusão da análise, recomendações, quantidade de ações e de ações concluídas e última atualização.
  - **Plano de ação:** uma linha por ação: incidente, número, o que será feito, onde, responsáveis, previsões de início e conclusão, situação (ou "Preenchimento pendente"), início e conclusão reais, efetividade, como comprovar, resultado esperado e recomendação de origem.
- Formatação: cabeçalho azul (#183EFF) com texto branco, linhas alternadas, primeira linha e primeira coluna congeladas, filtros no cabeçalho, quebra de texto nas colunas longas, datas no formato dd/mm/aaaa, status e grau do dano coloridos com as mesmas cores do sistema, abas coloridas e impressão em paisagem com o cabeçalho repetido em cada página.

## Em aberto

- A coluna "Anônima" (se a notificação foi feita sem identificação) continua no relatório do NSP. Ela deve sair também?

- Exportar só a aba e os filtros que estão na tela, em vez de tudo?
- O Administrador do Sistema deve ver o botão? Pela Matriz RBAC atualizada, ele não acessa incidentes das instituições; no protótipo o botão aparece porque o login de demonstração é de Administrador.
- O gestor também deve receber os incidentes cuja análise foi feita pelo NSP e cujo resultado foi encaminhado ao setor depois (RN-18)? O protótipo ainda não registra esse encaminhamento pós-análise, então hoje eles não entram no relatório do gestor.
- Incluir o conteúdo detalhado da análise (equipe, cronologia, PPC, fatores contribuintes e 5 Porquês)?
- Registrar a extração no histórico ou em auditoria (quem extraiu e quando)?
- Como simular o perfil de gestor no protótipo, já que o login de demonstração é sempre de Administrador?
- No sistema real, gerar no frontend continua viável com muitos incidentes, ou o arquivo deve vir do backend?
