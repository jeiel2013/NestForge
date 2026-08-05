# Roadmap

Este roadmap existe para deixar claro o que já está pronto e onde dá pra contribuir. PRs para qualquer item em aberto são muito bem-vindos — abra uma issue antes se for algo grande, pra alinharmos a abordagem.

## Autenticação
- [x] Login
- [x] Cadastro
- [x] Logout
- [x] Refresh Token
- [x] Forgot Password
- [x] Reset Password
- [x] Email Verification
- [x] OAuth Google
- [x] OAuth GitHub

## Usuários
- [x] CRUD básico
- [x] Paginação e filtros avançados
- [x] Upload de avatar

## RBAC
- [x] Roles (Admin, Manager, User)
- [x] Permissions granulares (`user:create`, `report:read`, etc)
- [x] Guard combinando roles + permissions

## Segurança
- [x] Helmet
- [x] CORS
- [x] Rate Limit
- [x] Validação (Zod + nestjs-zod, integrado ao Swagger via `createZodDto`)
- [x] Serialização (interceptor de output)
- [x] CSRF (quando necessário)

## Banco de dados
- [x] Prisma
- [x] PostgreSQL
- [x] Migrations
- [x] Seed completo (roles, permissions, usuário admin)

## Infra
- [x] Docker / docker-compose (API, Postgres, Redis, Mailpit)
- [x] GitHub Actions CI (build, lint, test)
- [ ] Deploy automatizado (exemplo com Railway/Fly.io)

## Observabilidade
- [x] Logs estruturados com Pino
- [x] Health checks (`/health`)
- [x] Métricas (Prometheus opcional)

## Jobs & E-mail
- [ ] Fila com BullMQ
- [ ] Envio de e-mail transacional (Mailpit em dev)
- [ ] Templates de e-mail

## Testes
- [x] Estrutura de testes unitários (Vitest)
- [ ] Testes de integração (auth + users)
- [ ] Cobertura mínima de 80% no core

## Documentação
- [x] README inicial
- [ ] Swagger completo com exemplos de request/response
- [ ] Guia de arquitetura (ADR / decisões de design)
- [ ] Guia "como adicionar um novo módulo"
