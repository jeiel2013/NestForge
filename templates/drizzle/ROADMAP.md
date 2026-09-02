# Roadmap

Este roadmap apresenta o estado atual do template NestForge com Drizzle ORM e os pontos que ainda podem evoluir.

Para mudanças grandes, abra uma issue antes do pull request para alinhar a implementação.

## CLI e geração

* [x] Geração de projetos com Drizzle ORM
* [x] TypeScript
* [x] JavaScript gerado a partir do template TypeScript
* [x] PostgreSQL
* [x] MySQL
* [x] SQLite
* [x] Remoção de recursos opcionais por marcadores
* [x] Remoção de dependências não utilizadas
* [x] Comandos finais adaptados ao Drizzle
* [x] Testes automatizados das combinações geradas

## Banco de dados

* [x] Drizzle ORM
* [x] Schema específico para PostgreSQL
* [x] Schema específico para MySQL
* [x] Schema específico para SQLite
* [x] Configuração dinâmica do Drizzle Kit
* [x] Geração de migrations
* [x] Aplicação de migrations
* [x] Seed com usuários para as roles padrão
* [x] Health check usando o driver selecionado
* [x] Transações adaptadas ao `better-sqlite3`
* [x] Limpeza isolada do banco nos testes E2E

## Autenticação

* [x] Estratégia JWT
* [x] Estratégia Session/Cookies
* [x] Estratégia OAuth-only
* [x] Projeto sem autenticação
* [x] Login
* [x] Cadastro
* [x] Logout
* [x] Access token
* [x] Refresh token
* [x] Revogação de refresh token
* [x] Recuperação de senha
* [x] Redefinição de senha
* [x] Verificação de e-mail
* [x] OAuth com Google
* [x] OAuth com GitHub
* [x] Sessões persistidas com `DrizzleSessionStore`
* [x] Proteção CSRF para Session/Cookies

## Usuários e autorização

* [x] CRUD de usuários
* [x] Paginação
* [x] Busca e filtros
* [x] Upload de avatar
* [x] Roles `ADMIN`, `MANAGER` e `USER`
* [x] Permissions granulares
* [x] Guards de roles e permissions
* [x] Remoção opcional de RBAC pela CLI

## Segurança

* [x] Helmet
* [x] CORS configurável
* [x] Rate limit
* [x] Validação com Zod e `nestjs-zod`
* [x] Serialização de respostas
* [x] Proteção CSRF para autenticação por sessão
* [x] Cookies `httpOnly`
* [x] Cookies seguros em produção
* [x] Validação das variáveis de ambiente

## Recursos opcionais

* [x] Docker e Docker Compose
* [x] Swagger/OpenAPI
* [x] Validação global
* [x] Redis
* [x] BullMQ
* [x] E-mail transacional
* [x] Mailpit para desenvolvimento
* [x] RBAC e Permissions
* [x] Geração opcional do arquivo `.env`

## Observabilidade

* [x] Logs estruturados com Pino
* [x] Health check da aplicação
* [x] Health check do Drizzle
* [x] Health check do Redis
* [x] Verificação de memória
* [x] Verificação de espaço em disco
* [x] Métricas no formato Prometheus
* [x] Métricas HTTP

## Testes

* [x] Testes unitários com Vitest
* [x] Testes E2E com Supertest
* [x] Testes de autenticação JWT
* [x] Testes de Session/Cookies
* [x] Testes de CSRF
* [x] Testes de usuários
* [x] Testes de RBAC
* [x] Testes do health check Drizzle
* [x] Banco separado para testes
* [x] Limpeza das tabelas entre testes
* [x] Smoke test com Drizzle, SQLite e JWT
* [x] Smoke test com Drizzle, SQLite e Session/Cookies

## CI e infraestrutura

* [x] GitHub Actions
* [x] Instalação reproduzível com `npm ci`
* [x] Geração e aplicação de migrations no CI
* [x] Lint
* [x] Build
* [x] Testes unitários
* [x] Testes E2E
* [x] Serviços PostgreSQL, MySQL e Redis conforme a geração
* [ ] Exemplo de deploy automatizado
* [ ] Exemplo de configuração para ambiente de staging

## Documentação

* [x] README do template
* [x] Guia de arquitetura
* [x] Guia para adicionar um módulo com Drizzle
* [x] Guia de marcadores de funcionalidades
* [x] Documentação de migrations
* [x] Documentação de testes
* [x] Documentação de autenticação
* [x] Documentação de observabilidade

## Fora do escopo deste template

MongoDB não faz parte do template Drizzle atual. O suporte a MongoDB pertence ao roadmap geral da CLI e exigirá uma estratégia de persistência própria.
