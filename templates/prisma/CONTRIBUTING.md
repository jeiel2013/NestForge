# Contribuindo com o NestForge

Obrigado por considerar contribuir! 🎉

## Como começar

1. Faça um fork do repositório
2. Clone o seu fork: `git clone https://github.com/SEU_USUARIO/nestforge.git`
3. Crie uma branch: `git checkout -b feat/nome-da-feature`
4. Suba o ambiente: `docker compose up` (ou `npm install` + `npm run start:dev`)
5. Faça suas alterações
6. Rode os testes e o lint antes de commitar: `npm run test && npm run lint`
7. Commit seguindo o padrão abaixo
8. Abra um Pull Request descrevendo o que foi feito e por quê

## Padrão de commits

Usamos commits em português, seguindo [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona autenticação via Google OAuth
fix: corrige validação do refresh token
docs: atualiza guia de instalação
test: adiciona testes de integração para users
refactor: extrai lógica de hash para utils
chore: atualiza dependências
```

## Padrões de código

- TypeScript estrito (sem `any` sem justificativa)
- Validação de entrada sempre via Zod (DTOs)
- Nada de lógica de negócio no controller — controller só orquestra, service resolve
- Toda rota nova precisa de decorators de Swagger (`@ApiTags`, `@ApiOperation`, etc)
- Toda feature nova precisa de teste (unitário no mínimo)

## Reportando bugs

Abra uma issue com:
- Descrição do problema
- Passos para reproduzir
- Comportamento esperado vs. atual
- Versão do Node / ambiente (Docker ou local)

## Sugerindo features

Abra uma issue com a tag `enhancement` descrevendo o problema que a feature resolve antes de sair implementando — isso evita retrabalho caso a abordagem precise ser discutida.

## Código de conduta

Ao contribuir, você concorda em seguir o [Código de Conduta](CODE_OF_CONDUCT.md) do projeto.
