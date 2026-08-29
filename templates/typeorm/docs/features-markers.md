# Marcadores de features (feature markers)

O `templates/prisma` é usado tanto como projeto standalone quanto como fonte pra CLI (`packages/cli`) gerar projetos. Quando um recurso é **opcional** na CLI (ex: Swagger, Redis, RBAC), o código dele precisa ficar marcado no template, pra CLI saber o que remover quando o usuário responde "não" naquela pergunta.

Se você está adicionando código ligado a um recurso que já existe como pergunta na CLI (ou propondo um recurso novo opcional), marque o trecho seguindo esta convenção.

## Marcador de bloco

Envolve um trecho de código (uma ou várias linhas) dentro de um arquivo que tem outras coisas não-opcionais também.

```ts
// nestforge:feature:swagger
@ApiTags('users')
// nestforge:feature:swagger:end
@Controller('users')
export class UsersController {
```

- Recurso **habilitado**: a CLI remove só as duas linhas de marcador, o `@ApiTags('users')` fica.
- Recurso **desabilitado**: a CLI remove o bloco inteiro (marcador + `@ApiTags('users')`).

O nome depois de `nestforge:feature:` tem que ser exatamente o mesmo nas duas linhas (abertura e `:end`), e bater com o nome usado no array `features` da CLI (`docker`, `swagger`, `validation`, `redis`, `rbac`).

Funciona em qualquer arquivo cuja linguagem use `//` para comentário (`.ts`, `.js`). **Não funciona em JSON** (`package.json`) — pra dependências, ver a seção final deste documento.

## Marcador de arquivo inteiro

Quando o arquivo **inteiro** só faz sentido se o recurso estiver ligado (ex: `src/mail/mail.service.ts`, que só existe por causa do Redis/BullMQ), marque a primeira linha do arquivo:

```ts
// nestforge:feature-file:redis
import { Injectable } from '@nestjs/common';
// ...resto do arquivo normalmente
```

- Recurso **habilitado**: a CLI remove só essa primeira linha, o resto do arquivo fica intacto.
- Recurso **desabilitado**: a CLI apaga o arquivo inteiro.

Se, depois de remover arquivos, uma pasta ficar vazia (ex: `src/mail/` inteira desapareceu), a CLI remove a pasta também — não precisa se preocupar em limpar pasta manualmente.

## Dependências no `package.json`

JSON não aceita comentário, então marcador não funciona ali. Em vez disso, o mapeamento fica direto no código da CLI: `packages/cli/src/features/dependencies.ts`, no objeto `FEATURE_DEPENDENCIES`. Se seu recurso opcional adiciona uma dependência nova ao `package.json` do template, adicione ela nesse mapa também.

## Checklist ao adicionar um recurso opcional novo

- [ ] Todo trecho de código exclusivo do recurso está marcado (bloco ou arquivo inteiro)
- [ ] O nome do marcador bate com o valor usado em `features` na CLI (`packages/cli/src/prompts.ts`)
- [ ] Dependências novas do `package.json` estão em `FEATURE_DEPENDENCIES` (`packages/cli/src/features/dependencies.ts`)
- [ ] Testado gerando o projeto com o recurso ligado **e** desligado — o projeto tem que compilar/rodar dos dois jeitos