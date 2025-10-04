import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',            // c8 est la valeur par défaut, mais on l’indique explicitement
      all: true,                // inclure les fichiers non testés
      reporter: ['text', 'html', 'lcov'],
      include: ['src/services/**/*.ts'],  // tes fichiers source
      exclude: [
        'src/**/__tests__/**',
        'src/**/*.d.ts',
        'src/**/mocks/**'
      ],
    },
  },
});