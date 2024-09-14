import { withObject } from "../../../spec/types/withObject";
import { faker } from "@faker-js/faker";

export class withObjectMock {
	private static _id = "C:/code/ts-fake-factory/spec/types/withObject.ts-withObject";
	private static _maxDepth = 5;

	static hydrated = (overrides?: Partial<withObject>, stack: string[] = []): withObject => {
		const currentDepth = stack.filter(x => x === this._id).length;
		if (currentDepth === this._maxDepth - 1) return this.bare(overrides, stack);
		if (currentDepth >= this._maxDepth) {
			throw new Error('It looks like there is a circular dependency in the factory for withObject. Please check your type definitions and remove the circular dependency.');
		}

		const mock: withObject = {
			name: faker.string.alphanumeric(),
			object: {id: faker.number.int(), label: faker.string.alphanumeric(), nestedObject: {isCool: faker.datatype.boolean()}},
			...overrides
		};

		return mock;
	}

	static bare = (overrides?: Partial<withObject>, stack: string[] = []): withObject => {
		const currentDepth = stack.filter(x => x === this._id).length;
		if (currentDepth >= this._maxDepth) {
			throw new Error('It looks like there is a circular dependency in the factory for withObject. Please check your type definitions and remove the circular dependency.');
		}

		const mock: withObject = {
			name: faker.string.alphanumeric(),
			object: {id: faker.number.int(), label: faker.string.alphanumeric(), nestedObject: {isCool: faker.datatype.boolean()}},
			...overrides
		};

		return mock;
	}
}