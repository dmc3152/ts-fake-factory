import { withArray } from "../../../spec/types/withArray";
import { faker } from "@faker-js/faker";

export class withArrayMock {
	private static _id = "C:/code/ts-fake-factory/spec/types/withArray.ts-withArray";
	private static _maxDepth = 5;

	static hydrated = (overrides?: Partial<withArray>, stack: string[] = []): withArray => {
		const currentDepth = stack.filter(x => x === this._id).length;
		if (currentDepth === this._maxDepth - 1) return this.bare(overrides, stack);
		if (currentDepth >= this._maxDepth) {
			throw new Error('It looks like there is a circular dependency in the factory for withArray. Please check your type definitions and remove the circular dependency.');
		}

		const mock: withArray = {
			name: faker.string.alphanumeric(),
			array: Array.from({ length: 3 }, () => faker.number.int()),
			...overrides
		};

		return mock;
	}

	static bare = (overrides?: Partial<withArray>, stack: string[] = []): withArray => {
		const currentDepth = stack.filter(x => x === this._id).length;
		if (currentDepth >= this._maxDepth) {
			throw new Error('It looks like there is a circular dependency in the factory for withArray. Please check your type definitions and remove the circular dependency.');
		}

		const mock: withArray = {
			name: faker.string.alphanumeric(),
			array: Array.from({ length: 3 }, () => faker.number.int()),
			...overrides
		};

		return mock;
	}
}