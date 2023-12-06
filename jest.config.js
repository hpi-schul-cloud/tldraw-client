module.exports = {
	testEnvironment: 'jsdom',
	testMatch: ['**/*.unit.{j,t}s?(x)'],
	setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				tsconfig: '<rootDir>/tsconfig.json',
			},
		],
	},
};
