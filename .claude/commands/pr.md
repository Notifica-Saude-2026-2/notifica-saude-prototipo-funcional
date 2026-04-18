Crie um Pull Request para a branch atual seguindo os padrões do GCS do time (GitHub Flow).

## Passos

1. Execute os comandos abaixo para coletar informações:
   ```
   git branch --show-current
   git log main..HEAD --oneline
   git diff main...HEAD --stat
   ```

2. A partir do nome da branch (formato `<tipo>/<número-da-issue>/<descrição>`), extraia:
   - O número da issue (ex: branch `feature/24/integrar-back-autenticacao` → issue #24)
   - O tipo (`feature`, `fix`, etc.)
   - A descrição em palavras legíveis (substitua hífens por espaços)

3. Monte o título do PR igual à mensagem do commit principal da branch (o commit mais representativo, geralmente o último ou o que resume tudo). O formato deve seguir o padrão do GCS: `<tipo>: <assunto>` em minúsculo (ex: `feat: implementa fluxo de autenticação`).

4. Monte o corpo do PR seguindo **exatamente** este template em português:

```
## 🎯 Descrição

<Explique o objetivo desta mudança: qual problema resolve ou qual funcionalidade implementa. Base-se no nome da branch e nos commits.>

## 🛠️ Solução proposta

<Descreva brevemente a abordagem técnica adotada.>

- [x] <commit 1 resumido como ação realizada>
- [x] <commit 2 resumido como ação realizada>
- [x] <... demais commits>

## ✅ Critérios de Aceitação

- [ ] <Critério derivado dos commits/funcionalidade — o que deve funcionar>
- [ ] <Critério 2>
- [ ] <Critério 3>

## 🔗 Informações Adicionais

Closes #<número da issue>
```

5. Mostre ao usuário o título e o corpo que você montou e **peça confirmação** antes de criar o PR.

6. Após confirmação, execute:
   ```
   gh pr create --base main --title "<título>" --body "<corpo>"
   ```

7. Retorne a URL do PR criado.

## Regras do GCS a seguir
- O título deve ser igual ao commit principal da branch
- Commits seguem o formato `<tipo>: <assunto>` (feat, fix, refactor, docs, etc.)
- O PR só pode ser mergeado após aprovação de ao menos 1 membro da equipe
- A issue é fechada automaticamente via `Closes #N` no corpo
