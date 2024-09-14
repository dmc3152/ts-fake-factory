import { AsType } from "../../../spec/types/asType";
import { faker } from "@faker-js/faker";

export class AsTypeMock {
	private static _id = "C:/code/ts-fake-factory/spec/types/asType.ts-AsType";
	private static _maxDepth = 5;

	static hydrated = (overrides?: Partial<AsType>, stack: string[] = []): AsType => {
		const currentDepth = stack.filter(x => x === this._id).length;
		if (currentDepth === this._maxDepth - 1) return this.bare(overrides, stack);
		if (currentDepth >= this._maxDepth) {
			throw new Error('It looks like there is a circular dependency in the factory for AsType. Please check your type definitions and remove the circular dependency.');
		}

		const mock: AsType = {
			id: faker.number.int(),
			name: faker.string.alphanumeric(),
			other: {label: faker.string.alphanumeric()},
			...overrides
		};

		return mock;
	}

	static bare = (overrides?: Partial<AsType>, stack: string[] = []): AsType => {
		const currentDepth = stack.filter(x => x === this._id).length;
		if (currentDepth >= this._maxDepth) {
			throw new Error('It looks like there is a circular dependency in the factory for AsType. Please check your type definitions and remove the circular dependency.');
		}

		const mock: AsType = {
			id: faker.number.int(),
			name: faker.string.alphanumeric(),
			other: {label: faker.string.alphanumeric()},
			...overrides
		};

		return mock;
	}
}