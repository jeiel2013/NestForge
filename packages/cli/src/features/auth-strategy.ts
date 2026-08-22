import fs from 'fs-extra';
import path from 'node:path';

/**
 * Remove src/auth/ e src/users/ inteiros quando a estratégia de autenticação é "none".
 * Pra "jwt" e "oauth" os dois módulos continuam (o OAuth também mora dentro de src/auth/).
 *
 * Por que remoção de diretório em vez de marcador por arquivo: esses dois módulos têm
 * ~23 arquivos ao todo, e alguns já carregam um marcador de outra feature (ex:
 * forgot-password.dto.ts depende de "redis,auth:password"). Continuar tudo via
 * marcador por arquivo individual multiplicaria o número de combinações — remover a
 * pasta toda de uma vez pro caso "sem autenticação nenhuma" é mais simples de auditar.
 */
export async function applyAuthStrategyRemoval(
    targetDir: string,
    enabledFeatures: Set<string>,
): Promise<void> {
    if (!enabledFeatures.has('auth:none')) return;

    await fs.remove(path.join(targetDir, 'src', 'auth'));
    await fs.remove(path.join(targetDir, 'src', 'users'));
}