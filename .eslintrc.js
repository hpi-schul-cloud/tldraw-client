module.exports = {
	extends: ['react-app', 'react-app/jest', 'plugin:prettier/recommended'],
	rules: {
		eqeqeq: 'error',
		'no-useless-escape': 'error',
		'no-irregular-whitespace': 'error',
		'no-undef': 'warn',
		'no-prototype-builtins': 'error',
		'no-empty': 'error',
		'no-var': 'error',
		'prefer-const': 'error',
		'no-multiple-empty-lines': 'error',
		'no-shadow': 'error',
		'no-unused-vars': 'warn',
		'no-undef-init': 'error',
		'no-use-before-define': 'error',
		'arrow-parens': 'error',
		'prefer-destructuring': ['warn', { object: true, array: false }],
		'import/order': ['error', { 'newlines-between': 'always' }],
		'no-console': 'warn',
		'@typescript-eslint/no-empty-function': 'error',
		'@typescript-eslint/ban-ts-comment': 'error',
		'@typescript-eslint/no-inferrable-types': 'error',
		'@typescript-eslint/ban-types': 'error',
	},
	overrides: [
		{
			files: ['**/*.unit.{j,t}s?(x)'],
			env: {
				jest: true,
			},
			rules: {
				'@typescript-eslint/no-unused-expressions': 'off',
				'@typescript-eslint/unbound-method': 'off',
				'jest/unbound-method': 'error',
			},
		},
	],
};
