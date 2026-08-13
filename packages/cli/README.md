# Testando a CLI `nestforge` (v0.1.0)

Guia de ponta a ponta pra rodar a CLI localmente e conferir cada opção disponível no fluxo — do build até o projeto gerado rodando.

---

## 0. Pré-requisitos

- Node.js 20+
- npm 10+
- Docker (opcional, só se for testar o projeto gerado de verdade)

---

## 1. Preparar o monorepo

Na raiz do repositório (onde fica o `package.json` com `"workspaces": ["packages/*"]`):

```bash
npm install
```

---

## 2. Rodar a CLI em modo desenvolvimento (sem publicar/instalar)

```bash
cd packages/cli
npm run dev
```

Executa `tsx src/index.ts` direto — sem precisar buildar nem linkar. **Rode de dentro de uma pasta "de testes" separada** (ex: `~/scratch/`), porque a CLI cria a pasta do projeto novo em `process.cwd()`.

### Alternativa: testar como se fosse instalada de verdade

```bash
cd packages/cli
npm run build      # compila TS + copia templates/ pra dentro do pacote
npm link           # registra o comando `nestforge` globalmente
cd ~/algum-lugar-vazio
nestforge
```

Pra desfazer o link depois: `npm unlink -g nestforge`.

---

## 3. O fluxo completo, passo a passo (10 perguntas)

### Banner inicial

Antes da primeira pergunta aparece um banner com gradiente vermelho→laranja:

```
N E S T F O R G E
  Gere um projeto NestJS pronto pra produção em segundos

┌  🔥 nestforge
│
```

### Passo 1 — Nome do projeto

**Pergunta:** `📦 Qual o nome do seu projeto?`
**Tipo:** texto livre · **Padrão:** `my-nest-api`

| Situação | Resultado |
|---|---|
| Nome válido | Segue |
| Enter direto | Usa `my-nest-api` |
| `Ctrl+C` | Cancela, sai limpo, nenhuma pasta criada |

⚠️ Ainda não valida se o nome é um nome de pacote npm válido — vale testar um nome "esquisito" (com espaço, maiúscula) e ver o que quebra depois, no `npm install` do projeto gerado.

### Passo 2 — Linguagem

**Pergunta:** `🧠 TypeScript ou JavaScript?`
**Tipo:** seleção única

| Opção | Hint | Resultado |
|---|---|---|
| **TypeScript** | "Recomendado" | ✅ Único que gera de verdade |
| **JavaScript** | "em breve" | ❌ Erro amigável na hora de gerar, nenhuma pasta criada |

### Passo 3 — ORM / Query Builder

**Pergunta:** `🗄️  Escolha o ORM/Query Builder:`
**Tipo:** seleção única

| Opção | Hint | Resultado |
|---|---|---|
| **Prisma** | "Recomendado" | ✅ Único que gera de verdade |
| **TypeORM** | "em breve" | ❌ Erro amigável |
| **Drizzle ORM** | "em breve" | ❌ Erro amigável |
| **Nenhum** | — | ❌ Erro amigável |

### Passo 4 — Banco de dados

**Pergunta:** `🗃️  Qual banco de dados você quer usar?`
**Tipo:** seleção única

| Opção | Hint | Resultado |
|---|---|---|
| **PostgreSQL** | "Recomendado" | ✅ Único que gera de verdade |
| **MySQL** | "em breve" | ❌ Erro amigável |
| **SQLite** | "em breve" | ❌ Erro amigável |
| **MongoDB** | "em breve" | ❌ Erro amigável |

### Passo 5 — Docker

**Pergunta:** `🐳 Deseja adicionar Docker?`
**Tipo:** sim/não · **Padrão:** sim

✅ **Toggle real** — respondendo "não", o `Dockerfile` e o `docker-compose.yml` não vão pro projeto gerado.

### Passo 6 — Swagger / documentação de API

**Pergunta:** `📄 Deseja incluir documentação Swagger/OpenAPI?`
**Tipo:** sim/não · **Padrão:** sim

⚠️ Sempre incluído no projeto gerado, independente da resposta (toggle ainda não implementado).

### Passo 7 — Validação global

**Pergunta:** `✅ Deseja validação global (Zod) habilitada?`
**Tipo:** sim/não · **Padrão:** sim

⚠️ Sempre incluído, independente da resposta.

### Passo 8 — Redis

**Pergunta:** `🧵 Deseja incluir Redis (cache/filas + e-mail via BullMQ)?`
**Tipo:** sim/não · **Padrão:** sim

⚠️ Sempre incluído, independente da resposta.

### Passo 9 — Estratégia de autenticação

**Pergunta:** `🔐 Qual estratégia de autenticação você quer usar?`
**Tipo:** seleção única

| Opção | Hint | Resultado |
|---|---|---|
| **JWT** | "Recomendado — já inclui OAuth Google/GitHub" | ✅ Único que gera de verdade |
| **Session/Cookies** | "em breve" | ❌ Erro amigável |
| **OAuth (Google/GitHub) apenas** | "em breve" | ❌ Erro amigável |
| **Nenhuma** | — | ❌ Erro amigável |

### Passo 10 — Controle de acesso

**Pergunta:** `🛡️  Deseja incluir controle de acesso (RBAC + Permissions)?`
**Tipo:** sim/não · **Padrão:** sim
**Só aparece se** o Passo 9 não for "Nenhuma".

⚠️ A resposta é guardada mas ainda não desliga nada — RBAC/Permissions vem sempre junto do JWT.

### Passo 11 — Criação automática do `.env`

**Pergunta:** `📝 Deseja criar o arquivo .env automaticamente (a partir do .env.example)?`
**Tipo:** sim/não · **Padrão:** sim

✅ **Toggle real** — respondendo "sim", o projeto gerado já vem com `.env` (cópia do `.env.example`), sem precisar rodar `cp .env.example .env` manualmente.

### Tela final

```
◇  🚀 Prontinho! Gerando o projeto...
│
◆  Próximos passos
│  cd <nome-do-projeto>
│  npm install
│  docker compose up -d postgres redis
│  npx prisma migrate dev
│  npm run start:dev
│
└  ✅ Projeto "<nome-do-projeto>" criado com sucesso!
```

(a linha `cp .env.example .env` só aparece aqui se você respondeu "não" no Passo 11)

Se algum passo escolhido não for suportado (linguagem, ORM, banco ou auth "em breve"), em vez da tela final aparece uma mensagem de erro única — sem stacktrace — e a CLI sai com código `1`, sem criar nenhuma pasta.

---

## 4. Checklist de teste

- [ ] Rodar com nome padrão (Enter direto) → pasta `my-nest-api/` criada
- [ ] Rodar com nome customizado → `package.json` gerado com `"name"` igual ao digitado, e `README.md` com o título trocado
- [ ] TypeScript + Prisma + PostgreSQL + JWT → projeto completo gerado
- [ ] JavaScript, TypeORM, Drizzle, "Nenhum" ORM, MySQL, SQLite, MongoDB, Session/Cookies, OAuth isolado, "Nenhuma" auth → cada um deve dar erro amigável, sem criar pasta
- [ ] Apontar pra uma pasta que já existe → erro "a pasta já existe", nada sobrescrito
- [ ] **Docker "sim"** → `Dockerfile`/`docker-compose.yml` presentes
- [ ] **Docker "não"** → os dois arquivos ausentes
- [ ] **`.env` "sim"** → arquivo `.env` presente no projeto gerado, com o mesmo conteúdo do `.env.example`
- [ ] **`.env` "não"** → só o `.env.example` presente; a nota final inclui `cp .env.example .env`
- [ ] Responder "Nenhuma" na estratégia de auth → pergunta de controle de acesso (Passo 10) não aparece
- [ ] Swagger/Validação/Redis respondidos "não" → confirmar que (por enquanto) aparecem mesmo assim no projeto gerado — esperado, não é bug
- [ ] `Ctrl+C` em qualquer prompt → sai limpo, sem stacktrace, nenhuma pasta criada
- [ ] Testar com `npm link` → o comando `nestforge` (não mais `create-nestforge`) é reconhecido
- [ ] Dentro do projeto gerado: `npm install` → `docker compose up -d postgres redis` → `npx prisma migrate dev` → `npm run start:dev` → API sobe em `http://localhost:3000`, `/docs` mostra o Swagger, `/health` responde

---

## 5. O que ainda não existe (não é bug, é escopo da v1)

- Toggle real de Swagger/Validação/Redis/RBAC (hoje só documentam a intenção — desligar de verdade exige editar `app.module.ts`, `package.json` e remover pastas inteiras de módulo)
- Templates de TypeORM, Drizzle, "sem ORM", MySQL, SQLite, MongoDB
- Estratégias de auth Session/Cookies e OAuth isolado (hoje só existe JWT+OAuth combinados)
- Geração em JavaScript
- Validação do nome do projeto (formato de pacote npm)
- Publicação real no npm (próximo passo depois dos testes)

Ver `packages/cli/README.md` pra a versão resumida (a que fica no repo).