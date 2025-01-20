import { defineConfig } from 'vitest/config';

console.log("Vitest configuration  loaded! 12345");

export default defineConfig({
  test: {
    coverage: {
      reporter: ['html', 'text'],
    },
    globals: true,
    fileParallelism: false,
    //* Set any setup files:----------
    // setupFiles: ['./tests/testsetup.ts'], 
    //*-----------
    sequence: {
      shuffle: false,
      concurrent: false, 
      
    },
    include: ['tests/routes.test.ts',], // Run only task.test.js

  },
  
});