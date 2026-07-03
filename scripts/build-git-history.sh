#!/bin/bash
# Monta o histórico de commits do NestForge em ordem lógica de desenvolvimento.
# Rode este script UMA VEZ, dentro do repositório já com `git init` feito.
set -e

commit() {
  git add "${@:2}"
  git commit -m "$1" -q
  echo "✔ $1"
}

commit "chore: configuração inicial do projeto (package.json, tsconfig, nest-cli)" \
  package.json tsconfig.json tsconfig.build.json nest-cli.json .gitignore

commit "docs: adiciona README inicial do projeto" \
  README.md

commit "docs: adiciona guia de contribuição" \
  CONTRIBUTING.md

commit "docs: adiciona código de conduta" \
  CODE_OF_CONDUCT.md

commit "chore: adiciona licença MIT" \
  LICENSE

commit "docs: adiciona roadmap detalhado do projeto" \
  ROADMAP.md

commit "feat: adiciona validação de variáveis de ambiente com Zod" \
  src/config/env.validation.ts .env.example

commit "feat: adiciona schema do Prisma (User, RefreshToken, OAuthAccount)" \
  prisma/schema.prisma

commit "feat: adiciona seed inicial do banco de dados" \
  prisma/seed.ts

commit "feat: configura PrismaService e PrismaModule" \
  src/database/prisma.service.ts src/database/prisma.module.ts

commit "feat: adiciona bootstrap da aplicação com Swagger, Helmet e ValidationPipe" \
  src/main.ts

commit "feat: adiciona módulo raiz da aplicação (AppModule)" \
  src/app.module.ts

commit "feat: adiciona filtro global de exceções HTTP" \
  src/common/filters/http-exception.filter.ts

commit "feat: adiciona decorators de autenticação e RBAC (Roles, Public, CurrentUser)" \
  src/common/decorators/roles.decorator.ts \
  src/common/decorators/public.decorator.ts \
  src/common/decorators/current-user.decorator.ts

commit "feat: adiciona guard de RBAC (RolesGuard)" \
  src/common/guards/roles.guard.ts

commit "feat: adiciona interceptor de logging e utilitário de hash" \
  src/common/interceptors/logging.interceptor.ts src/common/utils/hash.util.ts

commit "feat: adiciona DTOs de autenticação (login, registro, refresh token)" \
  src/auth/dto/login.dto.ts src/auth/dto/register.dto.ts src/auth/dto/refresh-token.dto.ts

commit "feat: adiciona estratégia e guard JWT" \
  src/auth/strategies/jwt.strategy.ts src/auth/guards/jwt-auth.guard.ts

commit "feat: implementa AuthService com login, registro, refresh e logout" \
  src/auth/auth.service.ts

commit "feat: adiciona AuthController e AuthModule" \
  src/auth/auth.controller.ts src/auth/auth.module.ts

commit "test: adiciona testes unitários do AuthService" \
  src/auth/auth.service.spec.ts vitest.config.ts

commit "feat: adiciona DTOs de usuários (create, update)" \
  src/users/dto/create-user.dto.ts src/users/dto/update-user.dto.ts

commit "feat: implementa UsersService com CRUD completo" \
  src/users/users.service.ts

commit "feat: adiciona UsersController protegido por RBAC" \
  src/users/users.controller.ts

commit "feat: adiciona UsersModule" \
  src/users/users.module.ts

commit "feat: adiciona Dockerfile multi-stage (dev, build, produção)" \
  Dockerfile

commit "feat: adiciona docker-compose com API, Postgres, Redis e Mailpit" \
  docker-compose.yml

commit "ci: adiciona pipeline do GitHub Actions (build, lint, test)" \
  .github/workflows/ci.yml

echo ""
echo "Histórico criado com sucesso. Rode 'git log --oneline' para conferir."
