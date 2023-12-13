export const isString = (value: any): value is string =>
	typeof value === 'string';

export const castToString = (value: any): string | null =>
	isString(value) ? value : null;
