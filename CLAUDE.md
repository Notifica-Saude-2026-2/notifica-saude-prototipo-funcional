# Notifica Saúde — Frontend

## Stack

- React 18 + TypeScript + Vite
- React Router v6
- CSS Modules

## Estrutura relevante

```
src/
  components/
    common/ui/     # Componentes base (Input, Button, Select, Textarea, FileInput)
    form/          # Componentes de formulário dinâmico (FieldRenderer, StepForm, RadioGroup, CheckboxGroup)
  pages/           # Home, Login, Notificacao
  types/           # formulario.ts — tipos do backend (CampoDinamico, OpcaoCampo)
  services/        # api.ts — chamadas HTTP com token
  hooks/           # useAuth
```

## Formulário dinâmico

`FieldRenderer` recebe um `CampoDinamico` do backend e renderiza o componente correto para cada `tipo`:
`TEXTO | EMAIL | TELEFONE | NUMERO | DATA | AREA | SELECT | MULTISELECT | RADIO | BOOLEAN | CHECKBOX | ARQUIVO`

## Convenção de `data-testid` (Playwright e2e)

Todos os elementos interativos devem ter `data-testid` para rastreabilidade nos testes e2e.

### Campos dinâmicos (via FieldRenderer)

| Tipo de campo | `data-testid` |
|---|---|
| TEXTO, EMAIL, TELEFONE, NUMERO, DATA | `field-{id}` |
| AREA | `field-{id}` |
| SELECT, MULTISELECT | `field-{id}` |
| RADIO, BOOLEAN — cada opção | `field-{id}-option-{valor}` |
| CHECKBOX — cada opção | `field-{id}-option-{id-da-opcao}` |
| Campo "Especifique" (outro) | `field-{id}-outro` |

> `{id}` = valor do campo `id` de `CampoDinamico` (vem do backend).
> `{valor}` em RADIO/BOOLEAN = o `id` da `OpcaoCampo` mapeado para `value` em `RadioOption`.
> Os testids gerados por RADIO e CHECKBOX são equivalentes: ambos usam o `id` da opção no backend.

### Páginas estáticas

| Elemento | `data-testid` |
|---|---|
| Login — input email | `login-email` |
| Login — input senha | `login-senha` |
| Login — botão submit | `login-submit` |
| Home — botão notificação | `home-btn-notificacao` |
| Home — botão área profissional | `home-btn-login` |

### StepForm

| Elemento | `data-testid` |
|---|---|
| Botão "Próximo" | `stepform-btn-next` |
| Botão "Voltar" | `stepform-btn-prev` |
| Botão "Enviar notificação" | `stepform-btn-submit` |

### Uso no Playwright

```ts
page.getByTestId('login-email')
page.getByTestId('field-42')
page.getByTestId('field-42-option-7')
page.getByTestId('stepform-btn-next')
```

### Regras

- Sempre kebab-case
- Nunca usar classes CSS ou posição DOM como seletor nos testes
- Novos componentes interativos devem receber `'data-testid'?: string` na prop type

## Comandos disponíveis

- `/pr` — cria PR para branch atual seguindo padrões GCS
- `/issue` — cria issue no GitHub com template padronizado

## Padrões GCS (Git)

- Branch: `<tipo>/<número-da-issue>/<descrição-com-hífens>`
- Commits: Conventional Commits — `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- PR requer aprovação de ao menos 1 membro antes do merge
- Issue fechada automaticamente via `Closes #N` no corpo do PR
