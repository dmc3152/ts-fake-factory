import { withTuple } from "../../../spec/types/withTuple";
import { faker } from "@faker-js/faker";

export class withTupleMock {
	private static _id = "C:/code/ts-fake-factory/spec/types/withTuple.ts-withTuple";
	private static _maxDepth = 5;

	static hydrated = (overrides?: Partial<withTuple>, stack: string[] = []): withTuple => {
		const currentDepth = stack.filter(x => x === this._id).length;
		if (currentDepth === this._maxDepth - 1) return this.bare(overrides, stack);
		if (currentDepth >= this._maxDepth) {
			throw new Error('It looks like there is a circular dependency in the factory for withTuple. Please check your type definitions and remove the circular dependency.');
		}

		const mock: withTuple = {
			name: faker.string.alphanumeric(),
			tuple: [faker.number.int(), [faker.string.alphanumeric(), faker.datatype.boolean()]],
			...overrides
		};

		return mock;
	}

	static bare = (overrides?: Partial<withTuple>, stack: string[] = []): withTuple => {
		const currentDepth = stack.filter(x => x === this._id).length;
		if (currentDepth >= this._maxDepth) {
			throw new Error('It looks like there is a circular dependency in the factory for withTuple. Please check your type definitions and remove the circular dependency.');
		}

		const mock: withTuple = {
			name: faker.string.alphanumeric(),
			tuple: [faker.number.int(), [faker.string.alphanumeric(), faker.datatype.boolean()]],
			...overrides
		};

		return mock;
	}
}