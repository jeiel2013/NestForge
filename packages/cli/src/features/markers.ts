import fs from 'fs-extra';
import path from 'node:path';

const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage']);

// primeira linha não-vazia do arquivo: se bater, o arquivo inteiro pertence a uma feature
// aceita "//" (TS/JS) e "#" (YAML/.env) como prefixo de comentário
const FILE_MARKER = /^(?:\/\/|#) nestforge:feature-file:(\S+)\s*$/;

// marca o início/fim de um bloco dentro de um arquivo (várias linhas ou só uma)
const BLOCK_START = /^(\s*)(?:\/\/|#) nestforge:feature:(\S+)\s*$/;
const BLOCK_END = /^(\s*)(?:\/\/|#) nestforge:feature:(\S+):end\s*$/;

/**
 * Aplica os marcadores de features em todos os arquivos de texto do projeto gerado.
 * Recursos habilitados: mantém o conteúdo, remove só as linhas de marcador.
 * Recursos desabilitados: remove o bloco inteiro (ou o arquivo inteiro, no caso do marcador de arquivo).
 */
export async function applyFeatureMarkers(
    targetDir: string,
    enabledFeatures: Set<string>,
): Promise<void> {
    const files = await collectFiles(targetDir);

    for (const filePath of files) {
        await processFile(filePath, enabledFeatures);
    }

    await removeEmptyDirs(targetDir);
}

async function collectFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        if (IGNORED_DIRS.has(entry.name)) continue;

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            files.push(...(await collectFiles(fullPath)));
        } else {
            files.push(fullPath);
        }
    }

    return files;
}

/**
 * O nome depois de "feature:" pode ser uma lista separada por vírgula
 * (ex: "redis,auth:password") — nesse caso, TODAS precisam estar habilitadas
 * pro conteúdo ser mantido. Uma feature só (o caso mais comum) continua
 * funcionando igual, já que é só uma lista de um item.
 */
function isRequirementMet(rawName: string, enabledFeatures: Set<string>): boolean {
    return rawName
        .split(',')
        .map((name) => name.trim())
        .every((name) => enabledFeatures.has(name));
}

async function processFile(filePath: string, enabledFeatures: Set<string>): Promise<void> {
    const original = await fs.readFile(filePath, 'utf-8');
    const lines = original.split('\n');

    const firstMeaningfulLine = lines.find((line) => line.trim().length > 0) ?? '';
    const fileMatch = firstMeaningfulLine.match(FILE_MARKER);

    if (fileMatch) {
        const featureName = fileMatch[1];

        if (!isRequirementMet(featureName, enabledFeatures)) {
            await fs.remove(filePath);
            return;
        }

        const withoutMarker = lines.filter((line) => !FILE_MARKER.test(line)).join('\n');
        if (withoutMarker !== original) {
            await fs.writeFile(filePath, withoutMarker, 'utf-8');
        }
        return;
    }

    const processedLines = stripBlockMarkers(lines, enabledFeatures);
    const processed = processedLines.join('\n');

    if (processed !== original) {
        await fs.writeFile(filePath, processed, 'utf-8');
    }
}

function stripBlockMarkers(lines: string[], enabledFeatures: Set<string>): string[] {
    const output: string[] = [];
    let skippingFeature: string | null = null;

    for (const line of lines) {
        if (skippingFeature) {
            const endMatch = line.match(BLOCK_END);
            if (endMatch && endMatch[2] === skippingFeature) {
                skippingFeature = null;
            }
            continue; // pula todo o conteúdo do bloco (e a linha de :end que o fecha)
        }

        const startMatch = line.match(BLOCK_START);
        if (startMatch) {
            const featureName = startMatch[2];
            if (!isRequirementMet(featureName, enabledFeatures)) {
                skippingFeature = featureName;
            }
            continue; // remove a linha do marcador em qualquer um dos dois casos
        }

        if (BLOCK_END.test(line)) {
            continue; // fecha um bloco de feature habilitada: remove só a linha do marcador
        }

        output.push(line);
    }

    return output;
}

async function removeEmptyDirs(dir: string): Promise<boolean> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    let isEmpty = true;

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            const childIsEmpty = await removeEmptyDirs(fullPath);
            if (childIsEmpty) {
                await fs.remove(fullPath);
            } else {
                isEmpty = false;
            }
        } else {
            isEmpty = false;
        }
    }

    return isEmpty;
}