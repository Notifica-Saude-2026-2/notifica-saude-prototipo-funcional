# Regras de negócio — Classificação → Análise → Plano de ação

> Documento vivo. Registra as regras do fluxo **a partir da classificação** do incidente, como estão
> no protótipo funcional (`notifica-saude-prototipo-funcional`) e conforme as decisões da equipe.
> Serve de base para a futura especificação de requisitos.
>
> **Legenda de situação de cada regra**
>
> - ✅ **Implementada** — já funciona assim no protótipo.
> - 🆕 **Nova / alterada** — decidida pela equipe, ainda não implementada no protótipo.
> - ❓ **Em aberto** — há decisão pendente (ver seção 7).

---

## 0. Decisões novas (a implementar no protótipo)

| Regra             | Resumo                                                                                                                                                                                          |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RN-PA-10          | Modal "Todas as ações desse incidente já foram concluídas…" ao salvar uma ação como Concluído                                                                                                   |
| RN-PA-11          | Ação **Cancelada** conta como finalizada para essa verificação                                                                                                                                  |
| RN-PA-12          | Confirmação de ação irreversível antes de concluir o incidente pelo modal                                                                                                                       |
| RN-GER-06         | Conclusão manual pelo menu (⋮) continua existindo                                                                                                                                               |
| RN-CL-10          | Prazo de validade da análise calculado pelo grau do dano (CA05)                                                                                                                                 |
| RN-AN-05          | Não existe escolha de metodologia — remover toda menção a essa abstração                                                                                                                        |
| RN-AN-12          | "Informe o incidente em investigação" com no máximo 100 caracteres (toast + bloqueio) — ✅ já implementada                                                                                      |
| RN-AN-13/14/15/16 | Condutor 100% obrigatório e membros opcionais porém completos; "Outro" com texto livre nos menus da equipe; orientações em caixa visível; placeholders em todos os campos — ✅ já implementadas |
| RNF-UI-01 a 04    | Sistema sempre informa o status das ações ("Salvando...", confirmação, erro, atenção) com toasts padronizados — toasts ✅ prontos; aplicar em todas as telas 🆕                                 |

---

## 1. Visão geral — status e transições

| Código (backend)    | Rótulo na tela | Significado                                                                          |
| ------------------- | -------------- | ------------------------------------------------------------------------------------ |
| `NOVA`              | Novo           | Notificação registrada, ainda sem classificação                                      |
| `CLASSIFICADA`      | Classificado   | Classificação concluída; aguarda escolha de quem analisa                             |
| `ENCAMINHADA_SETOR` | Encaminhado    | Encaminhada ao setor para que o setor faça a análise                                 |
| `EM_ANALISE`        | Em análise     | Formulário de análise em preenchimento (ou aguardando decisão pós-análise do núcleo) |
| `ANALISADA`         | Analisado      | Análise concluída; aguardando plano de ação                                          |
| `EM_ACAO`           | Em ação        | Ao menos um plano de ação registrado                                                 |
| `CONCLUIDA`         | Concluído      | Incidente encerrado após o tratamento — **status final** do fluxo; somente leitura   |
| `ARQUIVADA`         | Arquivado      | Encerrado sem seguir o fluxo — somente leitura                                       |

```
NOVA ──classificar──▶ CLASSIFICADA ─┬─ encaminhar ao setor ──▶ ENCAMINHADA_SETOR ──iniciar análise──▶ EM_ANALISE ──concluir──▶ ANALISADA
                                    │
                                    └─ núcleo analisa direto ──▶ EM_ANALISE ──concluir──▶ (aguarda decisão) ──encaminhar/justificar──▶ ANALISADA

ANALISADA ──registrar 1º plano de ação──▶ EM_ACAO ──concluir incidente (menu ⋮ ou modal RN-PA-10)──▶ CONCLUIDA
Qualquer status exceto CONCLUIDA/ARQUIVADA ──arquivar──▶ ARQUIVADA
```

---

## 2. Regras gerais do fluxo

- **RN-GER-01** ✅ Somente perfis **NSP** e **Administrador** podem classificar, encaminhar, analisar,
  registrar plano de ação, concluir e arquivar.
  _(No protótipo o login é fictício e sempre entra como Administrador.)_
- **RN-GER-02** ✅ O **responsável pelo incidente** é sempre o profissional que registrou a
  classificação. Não existe atribuição manual de responsável.
- **RN-GER-03** ✅ Toda ação relevante gera um registro no **Histórico** da notificação (data/hora,
  usuário e descrição): classificação, encaminhamento, conclusão da análise, decisão pós-análise,
  plano de ação registrado/atualizado/excluído, arquivamento (com motivo, se informado) e conclusão.
- **RN-GER-04** ✅ Incidentes **Concluídos** e **Arquivados** são somente leitura: nada pode ser
  editado, adicionado ou excluído.
- **RN-GER-05** ✅ **Arquivar** é possível em qualquer status, exceto Concluído e Arquivado, e exige
  confirmação ("Essa decisão não poderá ser alterada").
- **RN-GER-06** ✅🆕 **Concluir incidente** existe por dois caminhos, ambos levando ao status
  **Concluído**:
  1. **Manual**, pelo menu de três pontinhos (⋮) ao lado do status — disponível com o incidente
     **Analisado** ou **Em ação** — **se mantém**;
  2. **Sugerido pelo sistema**, pelo modal da RN-PA-10, quando todas as ações forem finalizadas.

  Nos dois caminhos, antes de concluir, o sistema **sempre** exibe a confirmação de ação
  irreversível (RN-PA-12).

---

## 3. Classificação

- **RN-CL-01** ✅ A classificação só pode ser criada ou editada com o incidente em **Novo** ou
  **Classificado**. A partir do encaminhamento/início da análise ela fica bloqueada, com um aviso
  do motivo ("Notificação encaminhada ao setor", "Análise em andamento", "Análise já concluída",
  "Incidente concluído", "Notificação arquivada").
- **RN-CL-02** ✅ **Classificação** (escolha única, obrigatória):
  Circunstância notificável · Near Miss · Incidente sem dano · Evento adverso.
- **RN-CL-03** ✅ **Grau do dano** — aparece e é obrigatório **apenas para Evento adverso**:
  Leve · Moderado · Grave · Óbito · Never Event. Trocar a classificação limpa o grau do dano.
- **RN-CL-04** ✅ **Tipo específico (Never Event)** — aparece e é obrigatório **apenas quando o
  grau do dano é Never Event** (lista fechada de never events).
- **RN-CL-05** ✅ **Tipo de incidente** (múltipla escolha, ao menos um) — obrigatório para toda
  classificação que **não** seja Never Event. Opção "Outro" exige especificação em texto.
- **RN-CL-06** ✅ **Envolve** (múltipla escolha, ao menos um) — sempre obrigatório. Opção "Outro"
  exige especificação em texto.
- **RN-CL-07** ✅ **Observações do NSP** — opcional, máximo de 400 caracteres.
- **RN-CL-08** ✅ É possível **salvar rascunho** da classificação sem cumprir as obrigatoriedades
  (fica marcado como "Classificação em andamento"). Só a classificação finalizada muda o status
  para **Classificado**.
- **RN-CL-09** ✅ Quando o Never Event vem sem tipo de incidente, o sistema o exibe como
  "Evento adverso" (Never Event é sempre um evento adverso).
- **RN-CL-10** 🆕 **Prazo de validade da análise (CA05)**

  > **CA05 — Atribuição de prazo de validade com base na classificação.** Dado que o profissional
  > do NSP classificou um incidente, quando a classificação for salva, então o sistema deve exibir
  > na tela e definir automaticamente a data de validade com base no grau de dano:
  > **Sem dano ou dano leve — 10 dias; Dano moderado — 7 dias; Dano grave — 4 dias.**
  > A validade conta a partir da **data de registro do incidente**.
  >
  > \*Complemento (decisão da equipe): **Óbito e Never Event — 2 dias.\***

  | Classificação / grau do dano                                          | Prazo   |
  | --------------------------------------------------------------------- | ------- |
  | Circunstância notificável, Near Miss, Incidente sem dano ("sem dano") | 10 dias |
  | Evento adverso — Leve                                                 | 10 dias |
  | Evento adverso — Moderado                                             | 7 dias  |
  | Evento adverso — Grave                                                | 4 dias  |
  | Evento adverso — Óbito                                                | 2 dias  |
  | Evento adverso — Never Event                                          | 2 dias  |
  - Data de validade = **data de registro da notificação + prazo**.
  - O prazo é calculado quando a classificação é **finalizada** (rascunho não tem prazo) e é
    **recalculado** se a classificação for editada mudando o grau do dano.
  - A data é exibida no detalhe ("Prazo para análise") e na listagem ("Vence em X dias",
    "Vence hoje", "Vencido há X dias"), enquanto o incidente estiver Classificado, Encaminhado ou
    Em análise.
  - _Hoje o protótipo não calcula esse prazo — só a notificação de exemplo tem um prazo fixo._

---

## 4. Análise

### 4.1 Quem analisa (decisão após a classificação)

- **RN-AN-01** ✅ Com o incidente **Classificado**, o núcleo escolhe entre:
  - **Registrar análise** (o próprio NSP analisa), ou
  - **Encaminhar para o setor analisar** → status **Encaminhado**.
- **RN-AN-02** ✅ O profissional do setor só pode registrar a análise se o incidente tiver sido
  **encaminhado**. Sem encaminhamento, a análise é do NSP.
- **RN-AN-03** ✅ **Encaminhamento ao setor**: destino é o setor da notificação; mensagem opcional
  (máx. 400 caracteres); exige classificação **finalizada** (não rascunho).

### 4.2 Preenchimento

- **RN-AN-04** ✅ Ao salvar o primeiro rascunho da análise, o status vai de Classificado/Encaminhado
  para **Em análise**. O rascunho é salvo automaticamente a cada avanço de seção e pode ser
  retomado ("Continuar análise").
- **RN-AN-05** 🆕 **Não existe escolha de metodologia.** O usuário não escolhe entre
  metodologias — ele apenas **registra a análise**, e o **sistema vai decidindo o caminho**
  (quais seções aparecem) conforme as respostas.
  - O **fluxo atual da análise está correto e não muda**.
  - O que muda é a forma de tratar: a análise **não é mais apresentada nem documentada** como
    "ACR", "Protocolo de Londres rápido/completo" ou qualquer outra metodologia — o sistema já
    desmembrou essa abstração nas próprias seções. Nos requisitos, descrever a análise pelas suas
    seções e regras, sem esses rótulos.
  - Remover da tela e dos dados as menções a "metodologia" como algo escolhido/registrado
    (ex.: título "Registro de ACR — Análise de Causa Raiz" no topo do formulário, texto
    "análise concluída (Registro de ACR…)" no histórico, campo `metodologia_analise`).
- **RN-AN-06** ✅ **Seções do formulário de análise** (caminho atual):
  1. **Informações da notificação** — resumo somente leitura da notificação e da classificação +
     "Informe o incidente em investigação" (**obrigatório**, **máx. 100 caracteres** — ver
     RN-AN-12). A partir da Seção 2, o topo de cada seção mostra **apenas** esse texto
     ("Incidente em investigação: …"), sem repetir os dados da notificação.
  2. **Informações da análise** — condutor da análise, demais membros (formação/função/setor com
     listas pré-definidas + "Outro"), fontes consultadas, "Alguém precisa ser ouvido?" (se Sim,
     exibe tabela de entrevistas).
  3. **Cronologia do incidente** — tabela de eventos (data, hora, fato, status
     Confirmado/Provável/Em análise, fonte) + "Foi identificado algum PPC?" (se Sim, exibe tabela
     de Problemas na Prestação do Cuidado).
  4. **Análise dos fatores contribuintes** — escolha de quais eventos da cronologia e PPCs serão
     aprofundados (não é preciso marcar todos).
     4A. **Fatores contribuintes por item selecionado** — uma tela por item marcado, com 8
     categorias fixas de fatores contribuintes + "Outro", achado e fonte; em cada categoria é
     possível aprofundar com **5 Porquês** (opcional).
  5. **Resultado** — Diagrama de Ishikawa gerado automaticamente a partir dos fatores + tabela de
     **Recomendações** (ao menos uma linha).
- **RN-AN-07** ✅ Princípio de **cultura justa**: a análise não busca punir profissionais
  individualmente (aviso fixo no topo do formulário).
- **RN-AN-12** ✅ **Limite do "Informe o incidente em investigação": 100 caracteres.**
  - Um contador abaixo do campo mostra os caracteres usados (ex.: "37/100"), que fica vermelho
    ao ultrapassar o limite.
  - Ao ultrapassar 100 caracteres, o sistema exibe um **aviso (toast)**:
    _"Informe o incidente em investigação" deve ter no máximo 100 caracteres (atual: N)._
  - Enquanto o texto tiver mais de 100 caracteres, o sistema **bloqueia o avanço** para a
    próxima seção: ao clicar em "Próximo", o aviso aparece de novo e a pessoa continua na Seção 1.
  - O texto digitado **não é cortado** automaticamente — a pessoa decide o que remover.
- **RN-AN-13** ✅ **Seção 2 — Condutor da análise: todos os campos são obrigatórios.** Nome,
  Formação, Função e Setor precisam estar preenchidos para avançar (o botão "Próximo" fica
  desabilitado). Se a opção "Outro" for escolhida, o texto especificado também é obrigatório.
  - **Demais membros participantes** são opcionais — é possível avançar sem adicionar nenhum.
    Porém, **cada membro adicionado precisa ter todos os campos preenchidos** (Nome, Formação,
    Função e Setor, incluindo o texto de "Outro"); caso contrário o avanço fica bloqueado. Um
    membro adicionado por engano pode ser removido.
  - **Nome: máximo de 50 caracteres** (condutor, demais membros e entrevistados). Mesmo
    comportamento do limite da RN-AN-12: contador "N/50" abaixo do campo, aviso (toast) ao
    ultrapassar e bloqueio do avanço até corrigir.
  - **"Fontes consultadas" é obrigatório:** marcar ao menos uma opção (é possível marcar várias).
    Se "Outro" for marcado, o texto especificado também é obrigatório.
  - **"Alguém precisa ser ouvido?" é obrigatório** (Sim ou Não). Se a resposta for **Sim**, é
    obrigatório registrar **ao menos uma entrevista**, e cada entrevista registrada precisa ter
    todos os campos preenchidos (Data, Nome, Função, Relato e Problemas percebidos). A tabela já
    abre com uma linha em branco ao marcar "Sim". Com **Não**, a tabela não aparece e não é
    exigida.
  - **Relato / fatos relevantes** e **Problemas ou condições percebidos**: máximo de
    **500 caracteres** cada, com contador, aviso (toast) ao ultrapassar e bloqueio do avanço
    (mesmo comportamento da RN-AN-12). O nome do entrevistado segue o limite de 50 caracteres.
- **RN-AN-17** ✅ **Seção 3 — Cronologia obrigatória:** ao menos **1 evento**, com todos os
  campos preenchidos (Data, Hora, Fato, Status e Fonte — incluindo o texto de "Outro" na Fonte).
  A tabela já abre com um evento em branco; se a pessoa remover todos, o sistema avisa
  "Adicione pelo menos 1 evento." ao tentar avançar.
  - **Exibição em formato de tabela (linha do tempo):** um evento por linha, com todos os campos
    lado a lado na ordem **Data · Hora · Fato · Fonte · Status** — com rolagem horizontal se não
    couber na tela — para facilitar a leitura da sequência dos acontecimentos.
  - **Fato: máximo de 500 caracteres**, com contador, aviso e bloqueio do avanço (mesmo
    comportamento da RN-AN-12).
- **RN-AN-18** ✅ **Seção 3 — PPC.** "Foi identificado algum Problema na Prestação do Cuidado
  (PPC)?" é obrigatório (Sim ou Não). Com **Sim**, é obrigatório registrar **ao menos 1 PPC**, com
  todos os campos preenchidos (O que ocorreu, O esperado e Fonte / evidência); a tabela já
  abre com uma linha. Os PPCs são exibidos em **formato de tabela**, um por linha, como a
  cronologia. Com **Não**, a tabela não aparece e não é exigida.
  - **PPC nº é automático:** o sistema numera os PPCs em ordem crescente começando em 1, pela
    posição da linha (não é editável; ao remover um PPC, os seguintes são renumerados).
  - **O que ocorreu** e **O esperado**: máximo de **500 caracteres** cada (contador, aviso e
    bloqueio do avanço, como na RN-AN-12).
  - **Fonte / evidência** é um menu de seleção: Prontuário · Inspeção no local · Entrevista ·
    Outro (texto livre, máx. 30 caracteres — RNF-UI-05).
- **RN-AN-19** ✅ **Seção 4A — 5 Porquês.** Ao abrir o 5 Porquês de uma categoria, o sistema mostra
  logo abaixo do título uma explicação breve do método (perguntar "por quê?" repetidamente, em
  geral até ~5 vezes, para ir além do sintoma e chegar à falha de processo/sistema — a causa raiz —
  que é onde as ações de melhoria evitam a recorrência). Os níveis são exibidos em **formato de
  tabela**, um por linha: **Nível** (numerado automaticamente) · **Por que aconteceu?** ·
  **Resposta**. **Por que aconteceu?** e **Resposta** aceitam no máximo **100 caracteres** cada,
  com contador (N/100); ao ultrapassar, o sistema avisa na hora (toast) e bloqueia o avanço de
  seção até o texto ser reduzido.
  O bloco do 5 Porquês fica **alinhado aos campos da categoria** ("O que foi identificado" /
  "Fonte"). O botão **"Remover 5 Porquês"** apaga os níveis daquela categoria e fecha o bloco
  (volta o botão "Por que isso aconteceu?"). Se algo já foi preenchido, o sistema pede
  **confirmação** antes ("Tudo o que foi preenchido nele será apagado" — Cancelar / Remover); se
  estiver vazio, remove direto.
- **RN-AN-20** ✅ **Seção 4A — obrigatoriedade dos fatores contribuintes (por item em análise).**
  - Em cada item em análise (ex.: "Evento 1", "PPC 2"), é obrigatório marcar **ao menos uma
    categoria** de fator contribuinte. Se nenhuma for marcada, o bloco inteiro fica destacado com
    "Marque ao menos um fator contribuinte.".
  - Ao marcar uma categoria, os campos dela ficam obrigatórios: **O que foi identificado /
    achado** e **Fonte / evidência** (e, na categoria "Outro / não mapeado", também a descrição,
    até 30 caracteres).
  - O **5 Porquês é opcional**. Mas, se a pessoa abrir o 5 Porquês e houver uma linha (nível),
    **todas as colunas daquela linha são obrigatórias** (Por que aconteceu? e Resposta). Para não
    usar, basta clicar em "Remover 5 Porquês" (RN-AN-19).
  - Se o 5 Porquês for aberto, ele deve ter **no mínimo 1 e no máximo 15 níveis**. O último
    nível restante não tem o botão "Remover" (para descartar tudo, usa-se "Remover 5 Porquês").
    Ao lado do botão "+ Adicionar porquê" aparece o contador (ex.: 3/15); ao chegar em 15, o
    botão é desabilitado e aparece o aviso "Limite de 15 porquês atingido.". O texto explicativo
    do 5 Porquês também informa o máximo de 15 níveis.
  - Campos obrigatórios exibem asterisco (\*). A validação segue a regra geral: só destaca ao
    clicar em "Próximo", apontando exatamente os campos pendentes de cada item.
- **RN-AN-23** ✅ **Seção 4A — itens em análise colapsáveis.** Cada item em análise (ex.: "Evento 1",
  "PPC 1") é um card que abre e fecha clicando no cabeçalho (seta ▸/▾). O cabeçalho mostra o nome
  do item, o texto do fato/PPC (em uma linha) e um resumo: "N fatores marcados" ou "Nenhum fator
  marcado". Por padrão, só o **primeiro item vem aberto**. Com mais de um item, aparecem os atalhos
  **"Expandir todos"** e **"Recolher todos"**. Ao clicar em "Próximo" com pendências, os itens com
  algo a corrigir **abrem automaticamente** e o resumo vira **"Pendências"** (em vermelho).
- **RN-AN-21** ✅ **Diagrama de Ishikawa (espinha de peixe) — conteúdo e visual.**
  - Cada osso é uma categoria de fator contribuinte e mostra, por item em análise que a
    marcou: o **achado** ("O que foi identificado") e, logo abaixo dele, os níveis do **5 Porquês**
    ("Por que …? — resposta") em **fonte menor e cor mais suave** que o achado.
  - A **Fonte / evidência não aparece no diagrama** (continua registrada na Seção 4A).
  - Quando há mais de um item em análise, cada achado vem prefixado com o nome do item (ex.:
    "Evento 1: …") para manter a rastreabilidade.
  - Visual (simples, no estilo clássico do Ishikawa, para não quebrar com textos longos ou muitas
    categorias): eixo central horizontal com **cauda** em meia-lua preenchida à esquerda e
    **cabeça** preenchida à direita com o incidente investigado em branco (a cabeça cresce na
    vertical conforme o texto, até 100 caracteres). As categorias são **só texto, sem caixa**
    (título em negrito + marcadores), **alternando acima e abaixo** do eixo: cada par (uma acima,
    uma abaixo) tem os ossos — linhas diagonais finas — se encontrando no mesmo ponto do eixo.
    Fontes enxutas: título da categoria 12px, achado 11px, 5 Porquês 9,5px (cinza).
  - Abaixo do título do diagrama há um texto explicativo: o que é o Ishikawa (os fatores da Seção
    4A agrupados por categoria convergindo para o incidente, montado automaticamente) e por que
    ele é útil (ver o quadro completo, quais áreas mais contribuíram, onde concentrar a melhoria,
    apresentar o resultado à equipe/gestão e embasar as recomendações).
- **RN-AN-22** ✅ **Recomendações.**
  - Abaixo do título há um texto explicativo: registrar o que precisa ser feito para tratar as
    causas e evitar que o incidente se repita, uma recomendação por vez; ao concluir a análise,
    **cada recomendação pode virar uma ação no Plano de ação** da notificação (já com o "O quê"
    preenchido), onde ganha responsável, prazo e acompanhamento.
  - Sem repetição de rótulos: cada card se chama "Recomendação #N" e mostra direto o campo de
    texto (o rótulo "Recomendação" do campo foi removido por ser redundante). Botão:
    "+ Adicionar recomendação".
  - As recomendações são opcionais, mas **toda recomendação adicionada precisa ser preenchida**
    (asterisco no título do card) e tem **no máximo 300 caracteres** (contador N/300; ao
    ultrapassar, aviso na hora e bloqueio). A análise já começa com 1 card de recomendação: se não
    for usar, basta clicar em "Remover".
- **RN-AN-14** ✅ **Menus de seleção da equipe sempre têm a opção "Outro".** Em Formação, Função e
  Setor (condutor, demais membros e Função nas entrevistas), escolher **"Outro"** abre um campo de
  texto para a pessoa especificar — mesmo comportamento da coluna "Fonte" da cronologia.
  Opções de cada menu (além de "Outro"):

  | Menu                                      | Opções                                                                                                                                                                                |
  | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | **Formação**                              | Enfermagem · Medicina · Farmácia · Fisioterapia · Nutrição · Odontologia · Psicologia · Serviço Social · Administração                                                                |
  | **Função**                                | Enfermeiro(a) · Técnico(a) de Enfermagem · Médico(a) · Farmacêutico(a) · Fisioterapeuta · Nutricionista · Coordenador(a) · Gestor(a) de Qualidade e Segurança · Analista de Qualidade |
  | **Setor**                                 | Qualidade e Segurança do Paciente · Clínica Médica · Farmácia Hospitalar · Centro Cirúrgico · UTI · Pronto-Socorro · Enfermagem · Administrativo                                      |
  | **Fontes consultadas** (múltipla escolha) | Prontuário · Protocolo/POP · Relato da equipe · Paciente/família                                                                                                                      |
  | **Fonte** (cronologia, Seção 3)           | Prontuário · Inspeção no local · Entrevista                                                                                                                                           |
  | **Fonte / evidência** (PPC, Seção 3)      | Prontuário · Inspeção no local · Entrevista                                                                                                                                           |

- **RN-AN-16** ✅ **Todo campo de preenchimento livre tem texto de exemplo (placeholder).** O
  formulário de análise deve ser o mais intuitivo e autoexplicativo possível: campos vazios de
  texto mostram um exemplo ou instrução do que preencher (ex.: "Nome completo do profissional",
  "Descreva o que aconteceu neste momento (sem suposições)", "Ex.: Por que o paciente caiu?"). Na
  falta de um texto específico, o campo mostra "Digite aqui...". Menus de seleção começam com
  "Selecione..." e o campo de "Outro" mostra "Especifique a opção".
- **RN-AN-15** ✅ **Orientações visíveis, não escondidas.** A explicação de cada seção e as
  orientações dos campos da Seção 2 (Condutor da análise, Fontes consultadas, Alguém precisa ser
  ouvido?), da Seção 3 (Cronologia e "Foi identificado algum PPC?", incluindo a lista de exemplos
  de PPC) e da Seção 4A (como marcar os fatores e usar os 5 Porquês) aparecem numa caixa azul-clara com ícone de informação logo abaixo do título, em vez de
  ficarem escondidas num ícone "i" com tooltip.

### 4.3 Conclusão da análise

- **RN-AN-08** ✅ Ao concluir a análise, **cada recomendação** registrada vira automaticamente um
  **plano de ação pré-criado** (campo "O que será feito" já preenchido com o texto da
  recomendação e vínculo com a recomendação de origem).
- **RN-AN-09** ✅ **Análise feita pelo setor (via encaminhamento)**: ao concluir, o status vai
  direto para **Analisado**.
- **RN-AN-10** ✅ **Análise feita pelo NSP (sem encaminhamento)**: ao concluir, o status continua
  **Em análise** até o núcleo decidir:
  - **Encaminhar o resultado ao setor** (mensagem opcional) — apenas comunica; não muda quem
    analisou; ou
  - **Não encaminhar**, com **justificativa obrigatória**.
    Em ambos os casos o status vai para **Analisado**.
    Junto dos botões, uma caixa de informação (azul, ícone ⓘ) explica a consequência: **as
    informações da análise só poderão ser acessadas pelo setor conforme essa decisão**. Ao
    **encaminhar**, o setor responsável recebe o resultado e passa a ter acesso ao incidente; ao
    **não encaminhar**, o setor **não terá acesso** ao incidente nem às informações da análise
    (ficam restritos ao núcleo) e é preciso registrar uma justificativa.
- **RN-AN-11** ✅ Após concluída, a análise fica visível em modo somente leitura na seção
  "Análise" do detalhe, organizada pelas mesmas seções do formulário.

---

## 5. Plano de ação

### 5.1 Registro

- **RN-PA-01** ✅ O plano de ação só pode ser registrado com o incidente **Analisado** ou
  **Em ação**. O primeiro plano registrado muda o status para **Em ação**.
- **RN-PA-02** ✅ Cada ação segue o modelo SMART. Campos **obrigatórios** e limites:
  1. **O que será feito?** — texto longo, até **500** caracteres.
  2. **Onde será feito?** — menu com os **setores** + opção **"Outro"**, que abre um campo de texto
     de até **50** caracteres.
  3. **Quem será o(s) responsável(eis)?** — **tabela** (ocupa a largura toda; Nome com mais espaço) com 1 ou mais responsáveis (botão "+ Adicionar
     responsável"); cada linha tem **Nome** (até 50 caracteres), **Função** e **Setor** (menus com
     "Outro", texto até 30) — mesma lógica e obrigatoriedade do condutor da análise: todos os
     campos da linha são obrigatórios. A primeira linha não pode ser removida.
  4. **Previsão de início** e 5. **Previsão de conclusão** — datas; **a previsão de início não pode
     ser posterior à previsão de conclusão** (o calendário já limita as datas e, se ficar
     inválido, os dois campos ficam em vermelho com o aviso e o salvamento é bloqueado).
  5. Como vamos comprovar que foi feito? · 9. Qual resultado esperamos? · 10. Como vamos saber se
     funcionou? — texto longo, até **500** caracteres.
  6. Quando verificar o resultado? — texto curto, até **100** caracteres.
  - As tabelas do plano (responsáveis e recursos) ocupam **100% da largura**; a coluna "Remover"
    só aparece quando há linha que pode ser removida. No **celular**, cada linha vira um bloco
    empilhado (rótulo acima de cada campo) em vez de rolar na horizontal.
  - Todo campo com limite mostra contador (N/máx); passou do limite, o campo fica vermelho e não
    salva. Os campos de texto longo têm altura máxima (não crescem infinitamente; a partir daí
    rolam).
  - Ao tentar salvar com pendências, os campos vazios ficam em vermelho e o aviso lista quais
    campos faltam, quais passaram do limite e se as datas estão inválidas.
  - **Textos explicativos** (caixa azul clara com ícone ⓘ, mesmo padrão da análise) logo abaixo
    de cada pergunta, explicando o sentido do preenchimento com exemplos: O que será feito (ação
    concreta, não só o objetivo) · Onde (setor/local da execução) · Responsável (quem garante que
    a ação aconteça) · Previsões (acompanhar andamento e atrasos) · Recurso (gasto necessário,
    item + custo estimado, para a gestão prever o orçamento) · Aprovação da Alta Gestão · Como
    comprovar (evidência) · Resultado esperado (base da avaliação de eficácia) · Como saber se
    funcionou (medição) · Quando verificar (dar tempo para surtir efeito) · Indicador.
- **RN-PA-03** ✅ Campos condicionais:
  - 6. **Precisa de recurso?** O texto explicativo fica logo abaixo da pergunta (visível antes de
       responder). Se Sim → abre a tabela **"Qual e quanto irá custar?"** já com a 1ª linha. Ao menos
       1 item; **todo item adicionado** precisa
       de **Pedido/item** (até 100 caracteres) e **Preço** preenchidos. Botão "+ Adicionar recurso".
  - 7. **Depende de aprovação da Alta Gestão?** Se Sim → informar qual (até 100 caracteres).
  - 12. **Vai gerar indicador de acompanhamento?** Se Sim → informar qual (até 100 caracteres).
- **RN-PA-04** ✅ Ao criar uma nova ação, o formulário é pré-preenchido com a **próxima
  recomendação da análise que ainda não tem plano** vinculado. (Na prática, desde a RN-PA-14 as recomendações já
  chegam como ações pré-criadas, então isso só ocorre se alguma ação pré-criada for excluída.)
- **RN-PA-05** ✅ É possível registrar **várias ações** ("Adicionar outra ação") e **excluir** uma
  ação (com confirmação; não pode ser desfeito).
- **RN-PA-14** ✅ **Recomendações da análise viram ações "pendentes de preenchimento".** A análise
  exige só o texto da recomendação (RN-AN-22) — o plano de ação **não** é cadastrado dentro da
  análise. Ao concluir a análise, cada recomendação vira uma ação no Plano de ação com apenas o
  **"O que será feito?"** preenchido. Enquanto faltar qualquer campo obrigatório (RN-PA-02/03):
  - o card **não mostra selo de status** (o aviso abaixo já explica a situação), mostra a borda
    laranja, a indicação "Veio de uma recomendação da análise" e o aviso "Faltam N campos obrigatórios para essa ação
    poder ser acompanhada", com o botão **"Completar preenchimento"**;
  - a ação **não pode ter o andamento atualizado** (o botão "Atualizar andamento" só aparece
    depois que ela estiver completa).
    Ao completar e salvar, a ação passa a exibir o status normal (Em andamento) e, se o incidente
    estava **Analisado**, ele passa para **Em ação** (equivale a registrar o 1º plano — RN-PA-01).
- **RN-PA-15** ✅ **Editar ação.** Todo card de ação tem o botão **Editar** (lápis), que abre o
  formulário do plano com os dados atuais (título "Editar plano de ação", ou "Completar plano de
  ação" quando a ação ainda está pendente). Na edição, todos os campos obrigatórios continuam
  exigidos; se faltar algo, o aviso lista **quais campos faltam**. A **situação** da ação não é
  alterada por aqui — só pelo "Atualizar andamento" (ícone ↻), que pede os dados de cada status.
  Edição (e o "Completar preenchimento") disponível **assim que a análise é concluída** — inclusive
  antes da decisão de encaminhamento pós-análise, já que as ações pré-criadas existem desde a
  conclusão da análise — e enquanto o incidente não estiver concluído. (Registrar uma ação _nova_
  continua exigindo o incidente Analisado ou Em ação — RN-PA-01.)

### 5.2 Acompanhamento (atualizar andamento)

- **RN-PA-06** ✅ Toda ação nasce com status **Em andamento**. Status possíveis:
  Em andamento · Parcialmente concluído · Concluído · Atrasada · Cancelada.
- **RN-PA-07** ✅ Na atualização é obrigatório responder **"A ação produziu o efeito esperado?"**
  (Sim / Parcialmente / Não). Se Parcialmente ou Não → justificativa obrigatória.
- **RN-PA-08** ✅ Obrigatoriedades por status:
  - **Concluído** → data real de conclusão + "O que foi realizado?".
  - **Atrasada** → motivo do atraso + nova previsão de finalização.
  - **Cancelada** → motivo do cancelamento.
- **RN-PA-09** ✅ Se o efeito esperado for **"Sim"**, a ação é marcada automaticamente como
  **Concluído**, independentemente do status selecionado.
- **RN-PA-13** ✅ É possível anexar arquivos de evidência e informar onde a evidência está
  armazenada. Os anexos aceitam **somente PDF, DOCX, PNG e JPG/JPEG** — a janela de seleção já
  filtra esses formatos e, se algum outro arquivo for escolhido, ele não é anexado e aparece o
  aviso "O arquivo "X" não foi anexado: só são aceitos PDF, DOCX, PNG e JPG/JPEG.". Os anexos
  aparecem em lista e cada um pode ser removido antes de salvar.
- **RN-PA-17** ✅ **Atualizar andamento — campos e textos explicativos.** "Ação selecionada" aparece
  **travada** (fundo cinza, cadeado, não editável). "Situação da ação" e "Data real de início"
  ficam lado a lado. Caixas de informação (azul, ⓘ) em: Situação (o que cada status exige) ·
  Resultado observado (mostra o **resultado esperado** registrado no plano, para comparar) ·
  Efeito esperado ("Sim" conclui a ação automaticamente; Parcialmente/Não exigem justificativa) ·
  Onde está a evidência (mostra a **comprovação** definida no plano) · Anexos (o que anexar e
  formatos aceitos). Espaçamento entre perguntas padronizado, igual ao do plano de ação.
  Ao tentar salvar com pendências, **cada campo obrigatório vazio fica em vermelho** com
  "Campo obrigatório." logo abaixo, o aviso final lista quais campos faltam e a tela rola até o
  primeiro campo pendente (o destaque some conforme a pessoa preenche).

### 5.3 Encerramento do incidente a partir das ações

- **RN-PA-16** ✅ **Aviso de ações em andamento ao concluir o incidente.** Concluir o incidente
  (menu ⋮) **não é bloqueado** por ações pendentes. Mas, se houver ao menos uma ação com status
  **"Em andamento"** (o que inclui as ações pendentes de preenchimento — RN-PA-14), a confirmação
  avisa: "Ainda há N ação(ões) em andamento neste incidente. Tem certeza que deseja concluí-lo
  mesmo assim? Essa decisão não poderá ser alterada." (Sim / Não). Sem ações em andamento, a
  confirmação é a padrão. Apenas o status "Em andamento" dispara o aviso.

- **RN-PA-10** 🆕 **Sugestão de conclusão do incidente.**
  - **Gatilho:** o usuário **salva a atualização de uma ação com status "Concluído"** (inclusive
    quando o status vira Concluído automaticamente pela RN-PA-09) **e**, após esse salvamento,
    **todas** as ações do incidente estão finalizadas (ver RN-PA-11).
  - O modal **não** aparece ao abrir o detalhe do incidente nem em nenhum outro momento — só no
    salvamento acima.
  - Se a **última ação pendente for salva como Cancelada** (com as demais já concluídas), o modal
    **não** aparece — o gatilho é exclusivamente salvar uma ação como **Concluído**. Nesse caso o
    incidente pode ser concluído pelo menu ⋮ (RN-GER-06).
  - Mensagem:
    > **"Todas as ações desse incidente já foram concluídas. Deseja concluir o incidente?"**
  - Botões:
    - **"Sim, concluir incidente"** → abre a confirmação de ação irreversível (RN-PA-12); ao
      confirmar, o incidente vai para **Concluído**.
    - **"Não, criar outro plano de ação"** → fecha o modal e abre o formulário de novo plano de
      ação (RN-PA-02). O incidente continua **Em ação**.
- **RN-PA-11** 🆕 **Ação cancelada conta como finalizada.** Para a verificação da RN-PA-10, uma
  ação é considerada finalizada se estiver **Concluído** ou **Cancelada** (se foi cancelada, não
  será feita). Ex.: 2 ações concluídas + 1 cancelada → ao salvar a última como Concluído, o
  modal aparece.
- **RN-PA-12** 🆕 **Confirmação de ação irreversível.** Antes de concluir o incidente — seja pelo
  modal da RN-PA-10, seja pelo menu ⋮ (RN-GER-06) — o sistema **sempre** exibe um segundo modal
  de confirmação:
  > **"Tem certeza que deseja concluir esse incidente? Essa decisão não poderá ser alterada."**
  > [Não] [Sim]
  - **Sim** → status **Concluído**, registro no histórico e incidente passa a ser somente leitura
    (RN-GER-04).
  - **Não** → nada muda; o incidente continua **Em ação**.

---

## 6. Requisitos transversais de interface (feedback e usabilidade)

> Valem para **todo o sistema**, não só para este fluxo.

- **RNF-UI-01** 🆕 **O sistema deve sempre informar o status do que está acontecendo.** Toda ação
  do usuário (salvar, enviar, encaminhar, concluir, excluir etc.) precisa de um retorno visível:
  enquanto processa, ao terminar com sucesso, ao falhar e quando algo precisa ser corrigido. O
  usuário nunca deve ficar sem saber se a ação funcionou.
  - _Hoje o protótipo cobre isso só em parte: o formulário de análise e a classificação já usam
    os toasts, mas, por exemplo, erros ao registrar/excluir plano de ação ainda aparecem num
    alerta padrão do navegador e salvar um plano de ação não mostra confirmação._
- **RNF-UI-02** ✅ **Feedback de salvamento.** Ao salvar, o sistema mostra que está salvando
  (ex.: botão com o texto "Salvando..." e desabilitado para evitar clique duplo) e, ao concluir,
  exibe a confirmação (ex.: toast "Rascunho salvo"). Isso inclui o salvamento automático do
  rascunho da análise a cada avanço de seção.
- **RNF-UI-03** ✅ **Avisos flutuantes (toasts) padronizados em três tipos**, cada um com ícone e
  cor fixos, com texto e ícone brancos:

  | Tipo    | Ícone | Cor de fundo       | Quando usar                                                                      |
  | ------- | ----- | ------------------ | -------------------------------------------------------------------------------- |
  | Sucesso | ✓     | Verde `#15803d`    | Ação concluída (ex.: "Rascunho salvo")                                           |
  | Erro    | ✕     | Vermelho `#b91c1c` | Algo falhou (ex.: erro ao salvar)                                                |
  | Atenção | ⚠     | Laranja `#c2410c`  | Algo precisa ser corrigido pelo usuário (ex.: limite de caracteres ultrapassado) |

  As cores foram escolhidas para garantir contraste mínimo de acessibilidade (WCAG AA) com o
  texto branco.

- **RNF-UI-04** ✅ **Interface autoexplicativa.** Campos vazios mostram texto de exemplo
  (placeholder), orientações ficam visíveis na tela em vez de escondidas em ícones de ajuda, e
  campos obrigatórios são marcados com asterisco (ver RN-AN-15 e RN-AN-16).

- **RNF-UI-05** ✅ **Texto de "Outro" com no máximo 30 caracteres.** Em **todos os menus de
  seleção** do sistema, o campo de texto que aparece ao escolher "Outro" aceita até
  **30 caracteres**, com contador "N/30".
  - No formulário de análise: ao ultrapassar, aparece o aviso de atenção (toast) e o avanço de
    seção fica bloqueado até corrigir (mesmo comportamento da RN-AN-12). Vale para os menus da
    equipe/entrevistas/cronologia, "Fontes consultadas" e "Outro / não mapeado" nos fatores
    contribuintes.
  - Na classificação e no formulário público de notificação: o campo não deixa digitar além de
    30 caracteres.

- **RNF-UI-07** ✅ **Caixas de texto longo com altura limitada.** A pessoa pode aumentar a altura
  arrastando o canto, mas só até um limite (menor dentro de tabelas); depois disso o texto rola
  dentro da própria caixa, sem deformar a tela.
- **RNF-UI-06** ✅ **O sistema diz exatamente o que impede de avançar.** O botão de avançar
  ("Próximo") fica sempre clicável. Ao clicar com algo pendente, o sistema **não avança** e:
  1. destaca em vermelho cada campo com problema (em tabelas, só as células que faltam);
  2. mostra, logo abaixo de cada campo, uma mensagem específica do que falta — ex.:
     "Preencha Formação, Função e Setor.", "Selecione ao menos uma opção.",
     "Especifique a opção "Outro".", "Máximo de 100 caracteres (atual: 112).";
  3. exibe um aviso de atenção (toast): com uma pendência só, diz qual é
     (ex.: "Informe o incidente em investigação: Preencha este campo."); com várias,
     "Corrija os N itens destacados para continuar.";
  4. rola a tela até o primeiro campo pendente.

  Os destaques aparecem **só ao clicar em avançar** e valem para o que estava pendente **naquele
  clique**: somem à medida que cada campo é corrigido, e o que for criado depois (ex.: uma linha
  nova na cronologia) **não** aparece em vermelho enquanto a pessoa preenche — só se ainda estiver
  incompleto na próxima tentativa de avançar.

---

## 7. Perguntas

### Respondidas

| #   | Pergunta                                          | Decisão                                                                                           | Regra               |
| --- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------- |
| Q1  | Status final ao aceitar o modal                   | **Concluído**                                                                                     | RN-PA-10            |
| Q2  | Quando o modal aparece                            | Só ao **salvar uma ação com status Concluído** e todas estarem finalizadas                        | RN-PA-10            |
| Q3  | Ação cancelada conta como finalizada?             | **Sim** — se foi cancelada, não será feita                                                        | RN-PA-11            |
| Q4  | Regra do prazo da análise                         | CA05: sem dano/leve 10 dias, moderado 7, grave 4, a partir da data de registro                    | RN-CL-10            |
| Q5  | Como escolher a metodologia                       | **Não existe escolha**; o sistema decide o caminho. Remover a abstração de metodologia            | RN-AN-05            |
| Q6  | Conclusão manual continua?                        | **Sim**, no menu ⋮, além do modal; sempre com confirmação de irreversibilidade                    | RN-GER-06, RN-PA-12 |
| Q7  | Prazo para Óbito e Never Event                    | **2 dias**                                                                                        | RN-CL-10            |
| Q8  | Caminhos de "Londres" continuam?                  | O **fluxo atual não muda**; só deixa de ser tratado/rotulado como metodologia (ACR, Londres etc.) | RN-AN-05            |
| Q9  | Última ação salva como Cancelada dispara o modal? | **Não** — só ao salvar como Concluído                                                             | RN-PA-10            |

### Em aberto

Nenhuma no momento.
