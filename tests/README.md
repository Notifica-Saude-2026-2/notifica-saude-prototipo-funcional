# Testes E2E — Notifica Saúde

Testes automatizados de ponta a ponta com **Playwright**, cobrindo os casos funcionais do épico 1 (Registro de Notificação de Incidentes).

---

## Pré-requisitos

- Node.js instalado
- Dependências do projeto instaladas: `npm install`
- Browsers do Playwright instalados: `npx playwright install chromium`

> O frontend sobe automaticamente antes dos testes. Não precisa rodar `npm run dev` manualmente.

---

## Comandos

| Comando | O que faz |
|---|---|
| `npm run test:e2e` | Roda todos os testes (headless) |
| `npm run test:e2e:ui` | Abre o Playwright UI — modo visual, bom para depurar |
| `npm run test:e2e:report` | Abre o relatório HTML do último run |

### Rodar um CT específico

```bash
npx playwright test --grep "CT-FUN-001"
npx playwright test --grep "CT-FUN-004"
```

### Rodar em um browser específico

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

---

## Estrutura

```
tests/
  e2e/
    ct-fun.spec.ts          # Casos de teste funcionais CT-FUN-001 a CT-FUN-004
  fixtures/
    campos-formulario.ts    # Mock da API de campos do formulário + helpers de data
```

---

## O que está sendo testado

Todos os casos cobrem a **US-1.1** — Registro de Notificação de Incidentes.

### CT-FUN-001 — Acesso ao formulário *(Caminho feliz)*
- Clicar em "Registrar incidente" na Home navega para `/notificacao`
- Formulário exibe o passo 1 corretamente

### CT-FUN-002 — Obrigatoriedade de campos *(Partição por equivalência)*
- Botão "Próximo" fica desabilitado com campos vazios
- Botão habilita somente após todos os campos obrigatórios preenchidos
- Validação acontece em cada tela do formulário (Tela 1, Tela 3...)

### CT-FUN-003 — Data futura inválida *(Análise de valor limite)*
- Data posterior a hoje exibe "Data inválida!" e bloqueia avanço
- Data igual a hoje é aceita
- Data anterior a hoje é aceita

### CT-FUN-004 — Campo "Outro" dinâmico *(Partição por equivalência)*
- Selecionar "Outro" exibe campo "Especifique"
- Campo "Especifique" é obrigatório enquanto "Outro" estiver selecionado
- Trocar para outra opção oculta o campo "Especifique"
- Comportamento ocorre tanto na Tela 2 (Sexo) quanto na Tela 3 (Setor)

---

## Como funciona o mock da API

Os testes **não dependem do backend rodando**. As chamadas à API de campos do formulário são interceptadas pelo Playwright e substituídas por dados controlados definidos em `tests/fixtures/campos-formulario.ts`.

Isso garante que os testes sejam **determinísticos** — mesmos dados, mesmos resultados, toda execução.

---

## Rastreabilidade

| Caso de Teste | História | Critério | Técnica |
|---|---|---|---|
| CT-FUN-001 | US-1.1 | CA01 | Caminho feliz |
| CT-FUN-002 | US-1.1 | CA02 | Partição por equivalência |
| CT-FUN-003 | US-1.1 | CA02 | Análise de valor limite |
| CT-FUN-004 | US-1.1 | CA02 | Partição por equivalência |
