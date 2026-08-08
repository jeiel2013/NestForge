import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        root: './',
        environment: 'node',
        include: ['test/**/*.e2e-spec.ts'],
        testTimeout: 30000,
        hookTimeout: 30000,
        // os specs compartilham o mesmo banco de teste, então rodam em sequência
        fileParallelism: false,
    },
});