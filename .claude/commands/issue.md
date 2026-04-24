Crie uma Issue no repositório seguindo os padrões do GCS do time.

## Passos

1. Leia o contexto que o usuário forneceu nos argumentos do comando (em `$ARGUMENTS`). Se não houver contexto suficiente, **pergunte antes de continuar**:
   - Qual o tipo? (feature, bug, refactor, docs, chore)
   - O que precisa ser feito e por quê?
   - Quais os critérios de aceitação?

2. Com base no contexto, monte o **título** da issue no formato GCS:
   - `<tipo>: <descrição curta em minúsculo>` (ex: `feat: implementar tela de cadastro de usuário`)
   - Máximo 72 caracteres
   - Use os tipos: `feat`, `fix`, `refactor`, `docs`, `chore`

3. Monte o **corpo** seguindo exatamente este template:

```
## 📋 Tipo
- [x] <tipo marcado conforme o contexto>

## 🎯 Descrição

<Descrição objetiva do que precisa ser feito e por quê. Baseie-se no contexto fornecido pelo usuário.>

## 📌 Critérios de Aceitação

- [ ] <Critério 1 — o que deve estar funcionando>
- [ ] <Critério 2>
- [ ] <Critério 3 — adicione quantos forem necessários>

## 🔗 Informações Adicionais

<Contexto técnico, referências ou links relevantes. Remova esta seção se não houver.>
```

4. Determine os **labels** adequados com base no tipo:
   - `feat` → `enhancement`
   - `fix` → `bug`
   - `refactor` → `refactor`
   - `docs` → `documentation`
   - `chore` → `chore`

5. Mostre ao usuário o título e o corpo montados e **peça confirmação** antes de criar.

6. Após confirmação, execute:
   ```
   gh issue create --title "<título>" --body "<corpo>" --label "<label>"
   ```
   > Se o label não existir no repositório, omita o `--label` e avise o usuário.

7. Extraia o número da issue a partir da URL retornada pelo `gh issue create` (ex: `.../issues/42` → `#42`).

8. Retorne a URL da issue criada e, logo abaixo, exiba a sugestão de branch no padrão GCS:
   ```
   Branch sugerida: <tipo>/<número-da-issue>/<descrição-com-hífens>
   ```
   - `<tipo>`: mesmo tipo do título (`feat`, `fix`, `refactor`, `docs`, `chore`)
   - `<número-da-issue>`: número extraído da URL
   - `<descrição-com-hífens>`: descrição do título em kebab-case, sem o prefixo do tipo
   - Exemplo: título `feat: adicionar tela de login` + issue `#42` → `feat/42/adicionar-tela-de-login`

## Regras do GCS a seguir
- Título segue o padrão Conventional Commits: `<tipo>: <assunto>`
- Descrição deve responder "o quê" e "por quê" — não "como"
- Critérios de aceitação devem ser verificáveis e objetivos
- Branch derivada desta issue deve seguir o padrão: `<tipo>/<número-da-issue>/<descrição-com-hífens>`
  - Exemplo: `feat/42/tela-cadastro-usuario`
