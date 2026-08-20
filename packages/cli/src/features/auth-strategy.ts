import fs from 'fs-extra';
import path from 'node:path';

/**
 * Remove src/auth/ e src/users/ inteiros quando a estratégia de autenticação é "none".
 *
 * Por que remoção de diretório em vez de marcador por arquivo: esses dois módulos têm
 * ~23 arquivos ao todo, e alguns já carregam um marcador de outra feature (ex:
 * forgot-password.dto.ts depende de "redis"). Um arquivo só pode ter UM marcador de
 * arquivo inteiro (é sempre a primeira linha) — então "esse arquivo precisa de redis E
 * de auth:jwt ao mesmo tempo" não dá pra expressar com o mecanismo atual. Remover a
 * pasta toda de uma vez evita esse conflito e é mais simples de auditar.
 */
export async function applyAuthStrategyRemoval(
    targetDir: string,
    enabledFeatures: Set<string>,
): Promise<void> {
    if (enabledFeatures.has('auth:jwt')) return;

    await fs.remove(path.join(targetDir, 'src', 'auth'));
    await fs.remove(path.join(targetDir, 'src', 'users'));
}