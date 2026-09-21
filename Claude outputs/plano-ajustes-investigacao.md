# Plano — Ajustes no fluxo de Investigação/Análise (ACR)

> **Status**: Fases 0 a 7 implementadas e **verificadas ao vivo** no navegador, rodando no seu ambiente Windows — o fluxo ACR completo está de acordo com o mockup: da Seção 1 até "Concluir investigação", passando pela seleção de itens, fatores contribuintes por item com 5 Porquês embutido, e o diagrama de Ishikawa por item na seção de Resultado. Testei o fluxo inteiro de ponta a ponta, incluindo concluir a investigação de verdade e conferir o resumo somente-leitura depois de encaminhada ao setor. Não sobrou nenhuma fase em aberto do plano original.
>
> **Nota sobre a verificação**: o `tsc --noEmit` que eu vinha rodando pra checar erros de tipo estava, sem eu perceber, checando um projeto vazio (o `tsconfig.json` da raiz só referencia os outros dois, sem `--build`) — ou seja, meus "compilação limpa" anteriores não garantiam nada de verdade. Corrigido rodando contra `tsconfig.app.json` diretamente. Isso revelou um bug real que eu tinha introduzido (o tooltip de legenda do Status da Cronologia — Fase 0/1 — não aparecia de verdade na tela, porque o componente `ColumnLabel` recebia a prop mas não a usava) — já corrigido e reverificado no navegador (ícone de ajuda com a legenda completa confirmado). Também apareceram 2 problemas de tipo **pré-existentes**, sem relação com nada desta sessão: um campo `itemLabel` faltando no tipo `ItemSchemaFieldDef` (corrigido, era só o tipo desatualizado — nada de runtime) e imports não usados em `ActionPlanModal.tsx` (não mexi, fora do escopo). Ainda ficou pendente, também pré-existente: um `row[col.id]` em `TableField.tsx` com tipagem `any` implícita — não afeta nada do que foi pedido, registrado aqui só pra transparência.
>
> **Segundo bug real encontrado e corrigido nesta rodada (Fase 5)**: o botão embutido "Por que isso aconteceu?" perdia o foco do campo a cada letra digitada dentro do 5 Porquês — só a 1ª letra de "Resposta"/"Por que aconteceu?" chegava a ficar salva, o resto sumia. Causa: eu tinha definido esse bloco como uma função aninhada _dentro_ do componente do checklist, então a cada tecla o React tratava como um componente novo e desmontava/remontava o campo em foco. Corrigido movendo o bloco pra fora, como componente estável — reverificado ao vivo digitando uma frase inteira sem perder foco. Registro aqui porque só apareceu ao testar digitação de verdade, não no `tsc` nem numa checagem rápida — reforça por que testar ao vivo, campo por campo, continua sendo necessário mesmo com o tipo batendo certo.
>
> **Observação à parte, sem relação com o código**: em algum momento desta sessão, um ajuste que eu já tinha feito e verificado (o auto-preenchimento da pergunta do 5 Porquês) apareceu revertido no arquivo pouco depois — reapliquei e confirmei de novo. Não travou nada, mas o padrão é consistente com uma gravação concorrente (por exemplo, o VS Code aberto com o mesmo arquivo na sua máquina salvando por cima ao mesmo tempo que eu). Se notar algum ajuste "sumindo" sem explicação, vale fechar o arquivo no editor enquanto eu estiver mexendo nele, ou me avisar pra eu reconferir.

Comparativo entre o que está implementado hoje e o mockup de 8 telas enviado pela proponente (`Telas ajustadas Investigação.pdf`), mais um plano de implementação em fases. Nada aqui foi codado ainda — é a base pra você aprovar antes de eu mexer em código.

## Como ler este documento

Cada seção do fluxo (1 a 6) tem uma tabela: **o que já existe hoje** x **o que a proponente pede** x **veredito** (já atende / ajuste pequeno / mudança estrutural). Depois vem uma lista de descobertas importantes — mecanismos que já existem no código e que dá pra reaproveitar em vez de construir do zero — e por fim as perguntas que preciso que você (ou a proponente) responda antes de eu começar a implementar.

---

## 1. Comparativo seção a seção

### Seção 1 — Notificação

| Hoje                                                                                      | Mockup                                                                                                                              | Veredito                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bloco "Resumo do Incidente" **opaco** (`type: readonly`), sem campos individuais visíveis | Campos individualizados: Notificação, Unidade, Data, Horário, Classificação NSP, Tipo de incidente, **Conduta imediata**, Descrição | Ajuste pequeno pros campos que já existem (só exibir em campos em vez de bloco só-leitura); **mudança estrutural pro campo novo "Conduta imediata"**, que não existe em nenhum lugar do sistema hoje |
| Campo "Informe o incidente em investigação" (obrigatório, texto livre)                    | Igual, com a nota "o sistema transfere automaticamente esta informação para todas as telas seguintes"                               | Já atende — essa transferência automática já existe (ver descoberta #2)                                                                                                                              |

### Seção 2 — Informações da Análise

| Hoje                                                                                                                                           | Mockup                                                       | Veredito                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------- |
| Tabela do condutor + participantes, fontes consultadas (checklist), pergunta "alguém precisa ser ouvido" com tabela de entrevistas condicional | Estrutura idêntica, mesmos campos e mesma lógica condicional | **Já atende** — nenhuma mudança identificada aqui |

### Seção 3 — Cronologia + PPC

| Hoje                                                                                                             | Mockup                                                                                                           | Veredito                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Cronologia tem coluna extra **"Classificação"** (Evento/Condição/Fator causal/Item de nota) que o mockup não usa | Cronologia sem essa coluna                                                                                       | Ajuste pequeno — remover coluna                                                                                                |
| Status da cronologia: Confirmado / Provável / Divergente / NA (4 opções)                                         | Status: Confirmado / Provável / **Em análise** (3 opções)                                                        | Ajuste pequeno — trocar as opções e o texto de ajuda                                                                           |
| **Não existe** um bloco de PPC (Problema na Prestação do Cuidado) dentro do ACR                                  | Pergunta "Foi identificado algum PPC?" (Sim/Não) → tabela com PPC nº, O que ocorreu, O esperado, Fonte/evidência | Mudança estrutural, mas **o padrão já existe pronto** no fluxo Londres Completo (ver descoberta #3) — é replicar, não inventar |

### Seção 4 + 4A + 4B — Fatores Contribuintes

Esta é a parte que muda de verdade. Hoje:

- É **um único campo global** (`checklist_with_detail`) pra todo o incidente: marca as 8 categorias do Protocolo de Londres uma vez só, sem vínculo com fato específico da cronologia ou PPC.
- "5 Porquês" (e Análise de Barreiras / Análise de Mudanças) vivem numa seção totalmente **separada e desconectada** ("Seção 5 — Aprofundamento guiado"), onde o usuário digita manualmente qual fator está aprofundando (texto livre, "copiado da Seção 3/4") — não há vínculo estrutural real com o fator marcado lá atrás.

O mockup pede:

1. Uma **tela de seleção** (nova Seção 4): lista os fatos da cronologia + os PPCs identificados, cada linha com um toggle "Analisar fator contribuinte?" — só os itens marcados avançam.
2. Pra **cada item selecionado**, uma tela 4A própria ("Item em análise: PPC 1 — ...") com a mesma grade de 8 categorias de hoje, mas agora **por item**, e com um gatilho "Porque isso aconteceu?" em cada categoria marcada, que abre os 5 Porquês (4B) **já ligados àquele achado específico**.
3. Isso se repete pra cada item selecionado (o fluxograma mostra um loop: termina o item → "há outro item selecionado?" → volta pra 4A).

| Hoje                                                                                  | Mockup                                                              | Veredito                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 checklist global de fatores                                                         | Seleção de itens (cronologia + PPC) → 1 grade de fatores por item   | Mudança estrutural, mas o **mecanismo de repetir uma seção por item já existe e funciona** (ver descoberta #4) — falta é a tela de seleção em si e adaptar a fonte pra cronologia+PPC em vez de só PPC |
| 5 Porquês solto, digitado manualmente qual fator ele cobre                            | 5 Porquês embutido dentro da categoria, sem precisar redigitar nada | Mudança estrutural — precisa de um novo formato de dado (respostas dos 5 porquês aninhadas dentro do achado da categoria, dentro do item)                                                              |
| Análise de Barreiras / Análise de Mudanças como ferramentas alternativas ao 5 Porquês | Não aparecem no mockup                                              | **Pergunta em aberto** — ver seção de perguntas abaixo                                                                                                                                                 |

### 5 Porquês — comportamento

| Hoje                                                                               | Mockup                                                                                                                                                 | Veredito                                              |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| Nível preenche sozinho (1, 2, 3...) — isso a gente já ajustou numa rodada anterior | Igual                                                                                                                                                  | Já atende                                             |
| Pergunta e Resposta são digitadas livremente linha a linha                         | **Pergunta é derivada automaticamente** da Resposta da linha anterior ("Porque + resposta anterior + ?"); primeira pergunta vem do achado da categoria | Mudança pequena de lógica (campo computado), mas nova |
| Causa raiz é digitada manualmente                                                  | Causa raiz vem **pré-preenchida automaticamente** com a Resposta da última linha (pode ser antes da 5ª), mas continua editável                         | Mudança pequena de lógica, nova                       |

### Seção 5 — Resultado (Ishikawa + Recomendações)

| Hoje                                                                                                | Mockup                                                                                                              | Veredito                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Diagrama de Ishikawa mostra achado + fonte por categoria marcada (fonte: um único checklist global) | Mesma ideia, mas cada categoria que teve 5 Porquês mostra também **a lista dos 5 porquês embutida dentro da caixa** | Mudança pequena de renderização, mas depende da mudança estrutural da Seção 4 (o diagrama precisa saber de qual item+categoria+5-porquês puxar)                  |
| Um único botão final: "Concluir investigação"                                                       | **Dois botões**: "Concluir investigação" e "Iniciar plano de ação"                                                  | Ver descoberta #5 — **isso esbarra numa regra de negócio que já existe (RN-13/CA10)** e precisa de alinhamento antes de implementar, não é só adicionar um botão |

### Seção 6 — Plano de Ação

| Hoje                                                                                                                                                        | Mockup                                                                                                  | Veredito                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Existe, mas como uma seção separada gerenciada na tela de detalhe da notificação, pré-preenchida automaticamente com as recomendações ao concluir a análise | A própria proponente anotou **"o mesmo que já temos, o sistema puxa as recomendações automaticamente"** | **Já atende integralmente** — nenhuma mudança |

---

## 2. Descobertas importantes (o que já existe e dá pra reaproveitar)

1. **Layout em cards pra textarea** (`TableField.tsx`) — qualquer tabela com coluna de texto longo já vira cards verticais automaticamente, a menos que `layout: "table"` force o modo antigo. Isso a gente já usou na rodada passada.
2. **Lembrete fixo do incidente em investigação** — `AnaliseFlowPage.tsx` já fixa um resumo compacto ("Incidente em investigação: ...") acima do formulário em **toda seção a partir da 2ª**, automaticamente, sem precisar declarar isso no schema de cada seção. O que o mockup pede pras Seções 2 a 5 **já está pronto**.
3. **PPC já existe, só não no ACR** — o fluxo Londres Completo já tem uma Seção 6 "Problemas na prestação do cuidado" com exatamente as colunas do mockup (PPC nº, O esperado, O que ocorreu, Fonte/evidência). É replicar esse pedaço de schema pro ACR, não inventar um conceito novo.
4. **Repetir uma seção por item já funciona de verdade** — não é só schema, tem implementação: `AnaliseSectionForm.tsx` tem um componente `RepeatablePerItemSection` que, dado `repeatablePerItemOf: "secaoX.tabela"`, renderiza automaticamente um bloco por linha da tabela referenciada, com um campo (`ppc_referencia`) que já vem pré-preenchido com o número do item. Isso é usado hoje no Londres Completo (Fatores contribuintes por PPC) e é **estruturalmente muito próximo** do que a Seção 4A do mockup precisa. A diferença: hoje ele gera 1 bloco pra **cada linha da tabela automaticamente**; o mockup quer um passo de **seleção** antes (só os itens marcados geram bloco). Isso exige adaptar o mecanismo, não recriar do zero.
5. **Plano de ação já é auto-criado ao concluir a análise** (regra RN-13/CA10, comentário explícito no código) — ao clicar "Concluir investigação" hoje, o sistema já pega cada recomendação não-vazia e cria automaticamente um item no Plano de Ação. Isso foi uma decisão deliberada do produto: _"não existe mais uma seção própria de Plano de Ação no assistente, já que o plano é preenchido e gerenciado direto na tela de detalhe"_. O botão "Iniciar plano de ação" do mockup pode estar pedindo exatamente esse comportamento (achando que não existe) — ver pergunta em aberto #2.

---

## 3. Melhoria transversal: tooltip personalizado (não é só da Investigação)

Surgiu na revisão da Cronologia, mas o problema é geral: hoje **todo** ícone de "i" do sistema usa um único componente centralizado (`InfoTooltip`), que por sua vez usa o `Tooltip` padrão do MUI só com `title={texto}` — uma string única, sem quebra de linha, sem cor, sem estrutura. Funciona bem pra uma frase curta, mas quebra quando o conteúdo é uma legenda com vários itens (ex.: a legenda de status da Cronologia — Confirmado/Provável/Divergente/Em análise — vira um parágrafo só, ilegível, como no print que você mandou).

**Proposta**: em vez de criar um tooltip novo só pra esse caso, evoluir o `InfoTooltip` (que já é centralizado e usa MUI) pra aceitar também um formato estruturado — uma lista de itens `{ rótulo, descrição, cor }` — e renderizar cada item em **sua própria linha**, com um marcador ou badge colorido na frente. A string simples continua funcionando como está (não quebra nada que já existe) e é só um extra por cima. Como o componente é único e reaproveitado em todo o sistema, essa melhoria já beneficia automaticamente qualquer outro tooltip de legenda parecido (não só Cronologia) sem precisar tocar em cada lugar que usa `InfoTooltip`.

Não é preciso adicionar nenhuma biblioteca nova — o app já usa `@mui/material`, e dá pra customizar o conteúdo e a aparência do `Tooltip` (`componentsProps`/conteúdo em JSX) sem sair do MUI.

Pra cor de cada status, o sistema já tem um padrão pronto de "rótulo colorido" usado em outros lugares (ex.: `GrauDanoTag` na Análise, e as classes `actionStatus*` do Plano de Ação, cada status com sua cor de texto/fundo) — dá pra seguir a mesma lógica em vez de inventar uma paleta nova.

**Fica pra fase própria** (ver Fase 0 abaixo) — não depende de nenhuma das perguntas em aberto da Investigação e pode ser feita a qualquer momento, inclusive antes ou em paralelo com as fases do ACR.

---

## 4. Perguntas em aberto — respondidas ✅

1. **Análise de Barreiras / Análise de Mudanças** → **Remover.** Só 5 Porquês continua como ferramenta de aprofundamento por categoria/achado no ACR. As duas outras ferramentas saem do fluxo.
2. **"Iniciar plano de ação" x regra RN-13/CA10** → **Remover o botão.** A Seção de Plano de Ação continua existindo só pra _gerenciar_ os itens já criados automaticamente ao concluir a análise (RN-13/CA10 sem mudança nenhuma) — nada de etapa de "iniciar", porque já não existe essa necessidade. Na prática isso significa que a Seção de resultado do ACR mantém **um único botão** ("Concluir investigação"), igual hoje — o mockup pedia dois botões, mas a decisão foi não replicar isso.
3. **Seleção de itens na Seção 4** → **Lista com todos os itens** (cards com toggle, todos na mesma tela), reaproveitando o padrão que já funciona hoje no Londres Completo — não vai ser um sub-assistente sequencial.

---

## 5. Fases de implementação sugeridas

Ordem pensada pra minimizar risco e permitir testar incrementalmente. Cada fase pode virar um PR/commit separado.

**Fase 0 — Tooltip personalizado (transversal, sem dependências) — ✅ feita**

- `InfoTooltip` agora aceita `items` (lista com rótulo/descrição/bolinha colorida opcional), além do `text` de sempre — os dois podem aparecer juntos (texto de introdução + lista).
- Legenda de Status da Cronologia migrada pro novo formato, com cores (verde/âmbar/índigo) alinhadas às já usadas em outros lugares do sistema (Grau do Dano, Plano de Ação).
- Reaproveitada também na Fase 3 (lista de "Exemplos de PPC"), confirmando que o componente já serve pra outros tooltips, como planejado.

**Fase 1 — Ajustes de baixo risco, sem mudança de estrutura de dados — ✅ feita**

- Seção 3: coluna "Classificação" removida da cronologia; Status agora tem 3 opções (Confirmado/Provável/Em análise) com a legenda colorida da Fase 0.
- Seção 1: na verdade **já estava** com campos individuais (Descrição, Data, Turno, Paciente...) — não era um bloco opaco como eu tinha registrado antes; o único item pendente dela era mesmo o campo novo, que virou a Fase 2.

**Fase 2 — Campos novos "Conduta imediata" e "Horário" — ✅ feita (com uma decisão registrada abaixo)**

- Os dois viraram campos de verdade no formulário público (Tela 3 pro Horário, Tela 4 pra Conduta imediata), com `campo_id` **provisório** (não existe ainda no seed.ts do backend — está marcado com comentário `⚠️ PROVISÓRIO` em todos os arquivos que o usam, pra ser fácil de achar e trocar depois).
- "Conduta imediata" segue o mesmo padrão de "Descrição" (campo de texto livre, promovido a coluna própria na criação) — e, por isso, **não** ficou editável no modal de edição rápida da Admin, já que "Descrição" também não é editável lá. "Horário" segue o padrão de "Turno" (metadado editável), então esse eu deixei editável no modal.
- Aparecem em: formulário público, Informações Gerais (detalhe da notificação) e Resumo do Incidente (Seção 1 da Análise).

**Fase 3 — PPC no ACR — ✅ feita**

- Replicado o campo `ppc` (mesmo padrão do Londres Completo) dentro da Seção 3 do ACR, atrás da pergunta condicional "Foi identificado algum PPC?", com a lista de exemplos de PPC do mockup como tooltip (Fase 0).
- Colunas na mesma ordem do mockup: PPC nº, O que ocorreu, O esperado, Fonte/evidência.

**Ajustes extras (fora da numeração de fases, pedidos depois)** — ✅ feitos

- Tooltip (`InfoTooltip`): fundo mais escuro (`#20232e`), `box-shadow` e fonte trocada pra Poppins — vale pra todo tooltip do sistema, por ser componente único.
- 5 Porquês: ao clicar "+ Adicionar linha", a "Pergunta" do novo nível já vem sugerida com base na Resposta do nível anterior ("Por que \<resposta\>?"), continuando editável. Implementado como uma propriedade genérica de coluna (`deriveFromPreviousRow`) em `TableColumn`, não hardcoded só pro 5 Porquês — dá pra reaproveitar em outra tabela que precise do mesmo padrão de "puxar da linha de cima" no futuro. Não mexe na causa raiz (ainda digitada manualmente) nem na primeira pergunta do nível 1 (que segue sem uma resposta anterior pra puxar) — isso é o restante do comportamento descrito na seção "5 Porquês — comportamento" acima, que depende da reestruturação da Fase 4/5.

**Verificação ao vivo (Fases 0-3)** — feita direto no navegador, com o servidor rodando na sua máquina:

- Formulário público: Horário e Conduta imediata aparecem nas telas certas, Conduta imediata corretamente não-obrigatória, submissão funciona e a notificação some certinho na lista da Admin.
- Informações Gerais (detalhe da notificação): Conduta imediata e Horário exibidos, cabeçalhos das 5 seções com o novo fundo escuro (cinza-chumbo).
- Resumo do Incidente na Seção 1 do ACR: Conduta imediata e Horário aparecem no resumo.
- Seção 2: tabela "Registro de cada entrevista" virou cards verticais (era a reclamação original) — cada campo com tamanho fixo, sem mais espremer o textarea numa célula.
- Seção 3: renomeada pra "Cronologia do Incidente"; cronologia em cards, sem a coluna Classificação; Status com as 3 opções certas e a legenda colorida no tooltip (as 3 descrições completas, cores verde/âmbar/índigo); pergunta do PPC revela a tabela certa (PPC nº, O que ocorreu, O esperado, Fonte/evidência) só quando "Sim".

**Verificação ao vivo (Fases 4-5)** — também direto no navegador:

- Seção 4: marquei o toggle de um evento da Cronologia, avancei e ele apareceu corretamente na Seção 4A.
- Seção 4A: "Item em análise: Evento 1" com a grade das 8 categorias; marquei "Fatores das tarefas", preenchi o achado, e o botão "Por que isso aconteceu? (5 Porquês)" apareceu só ali, não nas outras categorias.
- 5 Porquês embutido: ao abrir, o Porquê #1 já veio com a pergunta semeada a partir do achado digitado ("Por que \<achado\>?"); adicionei um 2º nível e a pergunta dele também veio semeada a partir da resposta do 1º, confirmando que o auto-preenchimento entre níveis continua funcionando dentro do novo formato embutido.
- Digitação de frase inteira nos campos do 5 Porquês embutido, sem perder foco no meio (isso só passou a funcionar depois do 2º bug que corrigi — ver nota no topo do documento).
- Seção 5: renomeada corretamente, com o único botão "Concluir investigação".

**Verificação ao vivo (Fases 6-7, fluxo completo)** — também direto no navegador:

- Seção 5: o diagrama de Ishikawa apareceu com a caixa "Evento 1", a espinha "Fatores das tarefas" com o achado e a lista numerada dos 5 Porquês embutida (pergunta + resposta de cada nível).
- Preenchi uma recomendação, cliquei em "Concluir investigação" — voltou pra tela da notificação sem erro.
- Conferi o Plano de Ação: "Ação 1" foi criada automaticamente com o texto exato da recomendação (RN-13/CA10 funcionando sem mudança).
- Cliquei em "Encaminhar ao setor" pra destravar o resumo somente-leitura, e abri as Seções 4A e 5 nesse modo: mesmo conteúdo, campos desabilitados, diagrama de Ishikawa aparecendo igual — sem nenhum erro no console nem tela em branco.

**Fase 4 — Seleção de itens (nova Seção 4) — ✅ feita**

- Tela de seleção: união dos fatos da Cronologia (Seção 3) + PPCs identificados (Seção 3), cada linha com um card e um toggle. Guardado num novo tipo de campo genérico (`item_selector`), reaproveitável em outros fluxos se um dia precisar da mesma ideia.
- Isso substitui o checklist global único de antes — a escolha de fatores passa a ser por item, não mais "marca as 8 categorias uma vez pro incidente inteiro".

**Fase 5 — Seção 4A por item selecionado + 5 Porquês embutido — ✅ feita**

- Pra cada item marcado na Fase 4, uma seção 4A própria ("Item em análise: Evento 1", "Item em análise: PPC 1"...) com a grade das 8 categorias de sempre (Fatores do paciente, da equipe, etc.), agora por item — implementado como um novo mecanismo (`repeatablePerSelectedItemOf`), irmão do `RepeatablePerItemOf` que o Londres Completo já usa, mas com uma etapa de seleção antes e suportando duas tabelas de origem (Cronologia + PPC) em vez de só uma.
- Em cada categoria marcada, o gatilho "Por que isso aconteceu? (5 Porquês)" abre a mesma tabela de níveis de sempre — com o auto-preenchimento da pergunta que já tínhamos feito — só que agora embutida dentro da própria categoria/item, com a primeira pergunta já semeada a partir do achado digitado ali ("Por que \<achado\>?").
- Análise de Barreiras e Análise de Mudanças saíram do fluxo (decisão da pergunta #1) — 5 Porquês é a única ferramenta de aprofundamento agora.
- A antiga "Seção 5 — Aprofundamento guiado" não existe mais como seção separada; a Seção de Recomendações foi renomeada pra "Seção 5 — Recomendações" (só o número/título mudou, o conteúdo é o mesmo de sempre) pra manter a numeração 1, 2, 3, 4, 4A, 5 fazendo sentido enquanto a Fase 6 não chega.

**Fase 6 — Diagrama de Ishikawa com 5 Porquês embutido — ✅ feita**

- O diagrama voltou pra tela, agora dentro da "Seção 5 — Resultado (Ishikawa + Recomendações)" (era "Seção 6 — Recomendações"; o diagrama que existia antes na Seção 4 saiu de lá quando os fatores contribuintes passaram a ser por item, e voltou aqui reconstruído).
- Uma espinha por item selecionado (ex.: "Evento 1", "PPC 1"), e dentro dela um "osso" por categoria marcada naquele item — achado, fonte, e, quando a categoria foi aprofundada, a lista numerada dos 5 Porquês embutida na própria caixa (pergunta e resposta de cada nível).
- **Ajuste extra pedido depois**: o diagrama agora é desenhado de verdade em SVG, no estilo clássico de espinha de peixe — um eixo central com seta apontando pro nome do item (a "cabeça"), e um osso diagonal por categoria, alternando acima/abaixo do eixo. Antes era só uma lista de caixas com uma barrinha colorida na lateral; agora tem a "cara" de um diagrama de Ishikawa mesmo. Funciona com qualquer quantidade de categorias marcadas (rola horizontalmente se tiver muitas).
- **Terceiro bug real encontrado e corrigido nesta rodada**: essa 1ª versão em SVG saiu com a "cabeça" (a caixa com o nome do item, ex. "Evento 1") **flutuando solta**, sem encostar na ponta do eixo — dava pra ver um vão nítido entre a seta e a caixa, e por baixo disso a caixa também ficava desalinhada verticalmente sempre que o item tinha só ossos de um lado (só em cima ou só embaixo), porque o grid reservava o mesmo espaço fixo pros dois lados e a "cabeça" ficava centralizada no meio da área toda, não na altura do eixo. Reconstruí a cabeça como um polígono SVG (seta/bandeirola apontando pro eixo, com fundo azul clarinho e borda azul, igual ao mockup) e ancorei ela exatamente na linha do eixo (`gridRow` fixo na linha da espinha, não mais espalhada pelas 5 linhas do grid) — agora ela fica sempre grudada na ponta do eixo e na altura certa, com qualquer combinação de ossos em cima/embaixo. Também: adicionei uma "cauda" decorativa na ponta esquerda do eixo (like no mockup) e troquei o conteúdo de cada caixinha de osso (achado/fonte/5-porquês) de parágrafo solto pra uma lista com marcadores só, mais limpa. Reverifiquei ao vivo com 1 categoria (caso simples) e com 5 categorias marcadas ao mesmo tempo (pra confirmar a alternância em cima/embaixo com o eixo contínuo e a cabeça bem encaixada em ambos os casos) — sem erro de tipo novo no `tsc`.

**Fase 7 — Seção de resultado — ✅ feita (só confirmação, como esperado)**

- A seção de conclusão continua com um único botão ("Concluir investigação"), sem o segundo botão do mockup, como já estava decidido. Testei o fluxo até o fim: preenchi uma recomendação, cliquei em "Concluir investigação", conferi que o Plano de Ação foi criado automaticamente a partir dela (RN-13/CA10, sem mudança), encaminhei ao setor e abri o resumo somente-leitura da análise já concluída — todas as seções novas (4, 4A e 5 com o Ishikawa) aparecem certinho ali também, sem nenhum erro.

Fases 0 a 7 — o plano inteiro — estão feitas e verificadas ao vivo, incluindo o fluxo de ponta a ponta (preencher → concluir → plano de ação automático → resumo somente-leitura).
