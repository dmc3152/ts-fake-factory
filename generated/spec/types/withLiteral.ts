import { withLiteral } from "../../../spec/types/withLiteral";
import { faker } from "@faker-js/faker";

export class withLiteralMock {
	private static _id = "C:/code/ts-fake-factory/spec/types/withLiteral.ts-withLiteral";
	private static _maxDepth = 5;

	static hydrated = (overrides?: Partial<withLiteral>, stack: string[] = []): withLiteral => {
		const currentDepth = stack.filter(x => x === this._id).length;
		if (currentDepth === this._maxDepth - 1) return this.bare(overrides, stack);
		if (currentDepth >= this._maxDepth) {
			throw new Error('It looks like there is a circular dependency in the factory for withLiteral. Please check your type definitions and remove the circular dependency.');
		}

		const mock: withLiteral = {
			name: faker.string.alphanumeric(),
			literal: 'Specific Value',
			...overrides
		};

		return mock;
	}

	static bare = (overrides?: Partial<withLiteral>, stack: string[] = []): withLiteral => {
		const currentDepth = stack.filter(x => x === this._id).length;
		if (currentDepth >= this._maxDepth) {
			throw new Error('It looks like there is a circular dependency in the factory for withLiteral. Please check your type definitions and remove the circular dependency.');
		}

		const mock: withLiteral = {
			name: faker.string.alphanumeric(),
			literal: 'Specific Value',
			...overrides
		};

		return mock;
	}
}