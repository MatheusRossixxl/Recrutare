# Recrutare — SaaS de Recrutamento e Seleção (MVP)

MVP de uma plataforma de R&S multi-tenant: empresas clientes, vagas, candidatos,
pipeline Kanban, dashboard com métricas e uma camada de IA para triagem
(rodando em modo simulado por padrão).

Este é o entregável da **Prioridade 1** do roadmap (mais um recorte da
Prioridade 2 — análise de IA em modo mock e a arquitetura de currículos):

- ✅ Autenticação (login / cadastro de conta)
- ✅ Dashboard com cards, gráficos e atividades recentes
- ✅ Empresas clientes (CRUD + página de detalhe)
- ✅ Vagas (CRUD + página de detalhe + mudança de status)
- ✅ Candidatos (CRUD + página de detalhe + busca)
- ✅ Pipeline Kanban com drag-and-drop e histórico de movimentação
- ✅ Análise de compatibilidade candidato × vaga com IA (mock funcional)
- ✅ Multi-tenant (isolamento de dados por organização)
- ✅ Seed com dados de demonstração (3 empresas, 8 vagas, 30 candidatos)
- 🔜 Upload/extração de currículo em PDF, agendamento de entrevistas e
  avaliações estruturadas (telas básicas já existem; falta o fluxo completo)
- 🔜 Área do cliente, notificações avançadas, relatórios, LGPD avançada, billing

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma ORM · SQLite
(MVP; troque para PostgreSQL em produção) · NextAuth (credenciais) · Recharts ·
@hello-pangea/dnd (Kanban)

## Como rodar localmente

### 1. Pré-requisitos
- Node.js 18 ou superior
- npm (ou pnpm/yarn, ajustando os comandos abaixo)

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
O arquivo `.env` já vem preenchido com valores padrão para desenvolvimento
local (SQLite, `NEXTAUTH_SECRET` de exemplo). Se quiser gerar um secret
próprio:
```bash
openssl rand -base64 32
```
e cole em `NEXTAUTH_SECRET` no `.env`.

Para ligar a IA real (Anthropic), preencha `ANTHROPIC_API_KEY` no `.env`.
Sem essa chave, o sistema usa automaticamente um **mock funcional** — o
restante do produto funciona normalmente, só a qualidade da análise é
simplificada.

### 4. Criar o banco de dados e rodar as migrations
```bash
npx prisma migrate dev --name init
```

### 5. Popular o banco com dados de demonstração
```bash
npm run db:seed
```

### 6. Rodar a aplicação
```bash
npm run dev
```
Acesse http://localhost:3000

### Login de demonstração
```
Email: ana@recrutare.com
Senha: senha123
```
(ou crie sua própria conta em `/register`)

## Comandos úteis
```bash
npm run db:studio   # abre o Prisma Studio (explorar o banco visualmente)
npm run lint        # roda o ESLint
npm run build        # build de produção
```

## Trocar para PostgreSQL em produção
1. Em `prisma/schema.prisma`, altere:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Atualize `DATABASE_URL` no `.env` para sua string de conexão Postgres.
3. Rode `npx prisma migrate dev` novamente.

## Arquitetura
```
src/
  app/
    (app)/            # rotas autenticadas (dashboard, companies, jobs, ...)
    api/               # route handlers (auth, registro, IA)
    login/ register/   # páginas públicas
  components/
    ui/                # componentes de design system (botão, card, etc.)
    layout/            # sidebar, topbar
    dashboard/          # gráficos do dashboard
    pipeline/           # kanban
    candidates/          # painel de análise de IA
  lib/
    actions.ts          # server actions (mutações, sempre com isolamento multi-tenant)
    auth.ts              # configuração do NextAuth + helpers de sessão
    db.ts                # cliente Prisma singleton
    constants.ts          # labels e cores de enums do domínio
  services/
    ai-service.ts        # camada de IA (mock + stub para integração real)
prisma/
  schema.prisma          # modelo de dados completo
  seed.ts                 # dados de demonstração
```

## Segurança e multi-tenant
Toda leitura e escrita do banco passa por `organizationId`, obtido da sessão
autenticada (`requireSession()`), garantindo que um usuário nunca acesse
dados de outra organização. Rotas do grupo `(app)` exigem sessão válida
(redirecionam para `/login` caso contrário).

## Próximos passos sugeridos
1. Implementar upload de currículo em PDF com extração real de texto e
   preenchimento assistido do formulário de candidato.
2. Conectar `ai-service.ts` à API da Anthropic (o stub já está isolado e
   pronto para receber a implementação).
3. Completar o módulo de Entrevistas (agendamento) e Avaliações
   (formulário estruturado pós-entrevista).
4. Área do cliente com login próprio e apresentação de finalistas.
