import fs from 'fs-extra';
import path from 'node:path';

/**
 * Removes the entire src/auth/ and src/users/ directories when authentication is "none".
 * Both modules remain for "jwt" and "oauth" because OAuth also lives in src/auth/.
 *
 * Directory removal is used instead of per-file markers because these two modules contain
 * about 23 files, some of which already depend on another feature marker (for example,
 * forgot-password.dto.ts requires "redis,auth:password"). Adding markers to every file
 * would multiply the number of combinations, while removing both directories for the
 * no-authentication case is easier to audit.
 */
export async function applyAuthStrategyRemoval(
    targetDir: string,
    enabledFeatures: Set<string>,
): Promise<void> {
    if (!enabledFeatures.has('auth:none')) return;

    await fs.remove(path.join(targetDir, 'src', 'auth'));
    await fs.remove(path.join(targetDir, 'src', 'users'));
}
