import { Enum, withEnum } from "../../../spec/types/withEnum";
import { faker } from "@faker-js/faker";

export class withEnumMock {
	private static _id = "C:/code/ts-fake-factory/spec/types/withEnum.ts-withEnum";
	private static _maxDepth = 5;

	static hydrated = (overrides?: Partial<withEnum>, stack: string[] = []): withEnum => {
		const currentDepth = stack.filter(x => x === this._id).length;
		if (currentDepth === this._maxDepth - 1) return this.bare(overrides, stack);
		if (currentDepth >= this._maxDepth) {
			throw new Error('It looks like there is a circular dependency in the factory for withEnum. Please check your type definitions and remove the circular dependency.');
		}

		const mock: withEnum = {
			name: 'string',
			enum: faker.helpers.arrayElement([1, 2, 3, Enum.Four]),
			...overrides
		};

		return mock;
	}

	static bare = (overrides?: Partial<withEnum>, stack: string[] = []): withEnum => {
		const currentDepth = stack.filter(x => x === this._id).length;
		if (currentDepth >= this._maxDepth) {
			throw new Error('It looks like there is a circular dependency in the factory for withEnum. Please check your type definitions and remove the circular dependency.');
		}

		const mock: withEnum = {
			name: 'string',
			enum: faker.helpers.arrayElement([1, 2, 3, 'four']),
			...overrides
		};

		return mock;
	}
}