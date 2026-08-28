import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [
        swc.vite({
            module: { type: 'es6' },
        }),
    ],
    test: {
        globals: true,
        root: './',
        environment: 'node',
        include: ['test/**/*.e2e-spec.ts'],
        testTimeout: 30000,
        hookTimeout: 30000,
        fileParallelism: false,
    },
});