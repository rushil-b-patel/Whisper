import eslintPluginPrettier from 'eslint-plugin-prettier';
import prettierPlugin from 'eslint-config-prettier';

export default [
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
        },
        plugins: {
            prettier: eslintPluginPrettier,
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-console': 'off',
            'prettier/prettier': ['error'],
        },
    },
    prettierPlugin,
];
