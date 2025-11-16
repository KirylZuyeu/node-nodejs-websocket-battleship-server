// eslint.config.js

import globals from "globals";
import prettier from "eslint-plugin-prettier/recommended";
import tseslint from "@typescript-eslint/eslint-plugin"

export default tseslint.config(
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
            parserOptions: {
                project: './tsconfig.json',
                sourceType: 'module',
            }
        },
        extends: [
            tseslint.configs.recommended,
        ],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
            "no-console": "off",
        }
    },
    prettier
);
