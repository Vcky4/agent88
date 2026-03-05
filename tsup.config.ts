import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: true,        // Generate .d.ts files
    clean: true,      // Clean the dist folder before building
    sourcemap: true,
    bundle: true,
    minify: false,
});
