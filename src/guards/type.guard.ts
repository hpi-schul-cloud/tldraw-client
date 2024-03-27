export class TypeGuard {
	static checkKeyAndValueExists(json: Record<string, unknown>, key: string): void {
		if (!(key in json) && json[key]) {
			throw new Error(`The ${key} is missing`);
		}
	}

	static checkNumber(value: unknown): void {
		if (typeof value !== 'number') {
			throw new Error('Type is not a number');
		}
	}
	
	static checkArray(value: unknown): void {
		if (!Array.isArray(value)) {
			throw new Error('Type is not an array');
		}
	}

	static checkBoolean(value: unknown): void {
		if (typeof value !== 'boolean') {
			throw new Error('Type is not a boolean');
		}
	}
}
