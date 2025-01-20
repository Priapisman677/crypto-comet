import { defineConfig } from 'vitest/config';
console.log("Vitest configuration  loaded! 12345");
export default defineConfig({
    test: {
        coverage: {
            reporter: ['html', 'text'],
        },
        globals: true,
        fileParallelism: false,
        //! I will disable this setup file to test math:----------
        setupFiles: ['./tests/testsetup.ts'],
        //!-----------------------------------------------------
        sequence: {
            shuffle: false,
            concurrent: false,
        },
        include: ['tests/routes.test.ts',], // Run only task.test.js
    },
});
