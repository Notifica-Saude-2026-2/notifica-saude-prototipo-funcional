<p align="center">
  <img src="logotipo dark MS.png" height="120px" alt="NotificaSaúde Logo" />
</p>

<h1 align="center">NotificaSaúde — Frontend</h1>

<p align="center">
  Interface web responsiva para registro, análise e acompanhamento de incidentes relacionados à segurança do paciente em instituições de saúde.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite" alt="Vite" />
</p>

---

## Estrutura do documento

- [Descrição do projeto](#descrição-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Instalação e configuração](#instalação-e-configuração)
- [Primeiros passos](#primeiros-passos)
- [Estrutura de diretórios](#estrutura-de-diretórios)
- [Documentação](#documentação)
- [Contribuindo](#contribuindo)
- [Autores](#autores)
- [Licença](#licença)

---

## Descrição do projeto

O **NotificaSaúde** é um sistema voltado ao registro, análise e monitoramento de incidentes relacionados à segurança do paciente em serviços de saúde. O sistema permite que profissionais de saúde, pacientes e acompanhantes registrem notificações de incidentes de forma identificada ou anônima.

Este repositório contém o **frontend** da solução — uma SPA (Single Page Application) desenvolvida em **React com TypeScript**, responsável pela interface de usuário acessível por diferentes perfis: Notificante, Profissional do NSP, Gestor de Área e Administrador.

O backend da aplicação está disponível em [`notifica-saude-backend`](https://github.com/Notifica-Saude/notifica-saude-backend).

---

## Funcionalidades

### Épico 1 — Registro de notificações

- [x] Formulário de registro de incidente (identificado ou anônimo)
- [x] Exibição de confirmação de envio com identificador da notificação (RN-10)

### Épico 2 — Gestão e classificação

- [x] Painel de notificações registradas (NSP)
- [x] Visualização detalhada de uma notificação
- [x] Edição e complemento de informações da notificação (NSP)
- [x] Formulário de classificação de incidente por tipo e grau de dano (NSP)
- [x] Encaminhamento da notificação ao setor responsável (NSP)
- [x] Registro de investigação e causa raiz (Gestor de Área)
- [x] Registro de plano de ação e ações corretivas (Gestor de Área)

### Transversal

- [ ] Tela de autenticação (login)
- [ ] Controle de rotas por perfil de usuário (RBAC)
- [ ] Interface responsiva — smartphones, tablets e computadores (Req. 5.4.2)
- [ ] Compatibilidade com Chrome, Safari e Microsoft Edge (Req. 5.4.1)
- [ ] Geração e visualização de relatórios consolidados

---

## Arquitetura

Este repositório implementa o **frontend** da arquitetura cliente-servidor do NotificaSaúde, conforme definido nas ADRs do projeto.

```
notifica-saude-frontend  ←→  notifica-saude-backend  ←→  PostgreSQL
   React + TypeScript          Express + Prisma
```

A interface se comunica exclusivamente com o backend via **API REST (HTTPS/JSON)**. Nenhuma regra de negócio reside no frontend — ele é responsável apenas por apresentação, navegação e interação com o usuário.

A organização segue estrutura por módulo de domínio:

```
pages/         → telas da aplicação (uma por rota principal)
components/    → componentes reutilizáveis de UI
services/      → chamadas à API REST (axios/fetch)
hooks/         → hooks customizados (estado, formulários, autenticação)
contexts/      → contextos globais (autenticação, tenant)
routes/        → definição de rotas e proteção por perfil
```

---

## Instalação e configuração

### Dependências obrigatórias

| Ferramenta                     | Versão mínima | Observação                                           |
| ------------------------------ | ------------- | ---------------------------------------------------- |
| [Node.js](https://nodejs.org/) | 22.x          | Recomendado via [nvm](https://github.com/nvm-sh/nvm) |
| [npm](https://www.npmjs.com/)  | 10.x          | Incluso com Node.js                                  |

### Variáveis de ambiente

Copie o arquivo `.env.example` e preencha os valores:

```sh
cp .env.example .env
```

| Variável       | Descrição               | Exemplo                 |
| -------------- | ----------------------- | ----------------------- |
| `VITE_API_URL` | URL base da API backend | `http://localhost:3333` |

### Instalação

1. Clone o repositório:

```sh
git clone https://github.com/Notifica-Saude/notifica-saude-frontend.git
cd notifica-saude-frontend
```

2. Instale as dependências:

```sh
npm install
```

3. Configure as variáveis de ambiente conforme descrito acima.

---

## Primeiros passos

Inicie o servidor de desenvolvimento:

```sh
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

> O backend deve estar em execução para que a interface funcione corretamente. Consulte o [README do backend](https://github.com/Notifica-Saude/notifica-saude-backend) para instruções de instalação.

### Scripts disponíveis

| Comando             | Descrição                                                    |
| ------------------- | ------------------------------------------------------------ |
| `npm run dev`       | Inicia o servidor de desenvolvimento (Vite)                  |
| `npm run build`     | Verifica os tipos TypeScript (`tsc --noEmit`) e gera o build |
| `npm run preview`   | Pré-visualiza o build de produção localmente                 |
| `npm run lint`      | Executa o oxlint no código-fonte                             |
| `npm run lint:fix`  | Executa o oxlint corrigindo problemas automaticamente        |
| `npm run fmt`       | Formata o código-fonte com oxfmt                             |
| `npm run fmt:check` | Verifica a formatação do código sem alterar arquivos         |

---

## Estrutura de diretórios

```
notifica-saude-frontend/
├── public/                              # Arquivos estáticos públicos (favicon, icons)
├── src/
│   ├── assets/                          # Imagens e ícones SVG
│   ├── components/
│   │   ├── admin/                       # Componentes da área administrativa
│   │   │   ├── AdminDrawer/  AdminLayout/  FiltersBar/
│   │   │   └── IncidentCard/  IncidentList/
│   │   ├── common/
│   │   │   ├── layout/                  # Header, Footer, PublicLayout
│   │   │   └── ui/                      # Button, Input, Select, Textarea, FileInput, AccessibilityWidget
│   │   └── form/                        # FieldRenderer, StepForm, RadioGroup, CheckboxGroup, MultiSelect, DateInput
│   ├── constants/                       # Constantes da aplicação (ex.: notificacaoStatus)
│   ├── contexts/                        # AuthContext, AccessibilityContext
│   ├── hooks/                           # useAuth, useNotificacao, useIncidents, useCamposFormulario, ...
│   ├── pages/
│   │   ├── Home/  Login/  ForgotPassword/  ResetPassword/
│   │   ├── Notificacao/
│   │   └── Admin/NotificacaoDetalhe/
│   ├── routes/
│   │   ├── index.tsx                    # Definição de rotas
│   │   └── PrivateRoute.tsx             # Proteção de rotas por perfil (RBAC)
│   ├── services/                        # api.ts + serviços REST (auth, notificacao, incident, password, ...)
│   ├── templates/                       # Templates (ex.: e-mail)
│   ├── types/                           # Tipos e interfaces TypeScript
│   ├── utils/                           # Utilitários (cookies, formatDate, statusColors, passwordRules)
│   ├── App.tsx
│   └── main.tsx
├── .github/                             # Workflows de CI, Lighthouse e notificação Discord
├── Dockerfile  docker-compose.yml  nginx.conf  .dockerignore
├── lefthook.yml  lighthouserc.json
├── .oxlintrc.json  .oxfmtrc.json  eslint.config.js
├── .env.example  vite.config.ts  index.html
├── package.json
└── tsconfig.json  tsconfig.app.json  tsconfig.node.json
```

---

## Documentação

Os artefatos de documentação do projeto estão disponíveis em [`docs/`](docs/): — Inserir link do repositório de documentação

---

## Contribuindo

Este projeto adota o modelo de ramificação **GitHub Flow** e padrões definidos no [Documento de GCS](docs/Documento_GCS.pdf). Consulte o [INSTRUCOES.md](INSTRUCOES.md) para o guia completo de contribuição.

Resumo rápido:

1. Crie uma issue descrevendo a alteração
2. Crie uma branch seguindo o padrão `<tipo>/<número-da-issue>/<descrição>`
3. Implemente as alterações com commits no formato `<tipo>: <assunto>`
4. Abra um Pull Request com título igual ao commit principal
5. Aguarde a aprovação de pelo menos **dois membros** da equipe
6. Após aprovação, realize o merge na `main`

---

## Autores

Este sistema foi desenvolvido pela seguinte equipe como parte das disciplinas de **Prática em Desenvolvimento de Software I** do [Núcleo de Práticas em Engenharia de Software (NES)](https://nes.facom.ufms.br/) da UFMS:

Professora: Maria Istela Cagnin

Técnicos: Lucas Henrique Alves Borth

Proponentes:

- Viviane Euzebia
- Ercilene Ribeiro

| Nome              | E-mail                   |
| ----------------- | ------------------------ |
| Aline Hirokawa    | aline.hirokawa@ufms.br   |
| Fábio Ramos       | fabio.ramos@ufms.br      |
| Lucas G. Cordeiro | lucas.g.cordeiro@ufms.br |
| Luigi Almeida     | luigi.almeida@ufms.br    |
| Pedro Soledade    | pedro.soledade@ufms.br   |
| Sophya Ribeiro    | sophya.ribeiro@ufms.br   |

---

## Licença

Inserir
