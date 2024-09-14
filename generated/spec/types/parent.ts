import { Parent } from "../../../spec/types/parent";
import { ChildMock } from "./child";
import { faker } from "@faker-js/faker";

export class ParentMock {
	private static _id = "C:/code/ts-fake-factory/spec/types/parent.ts-Parent";
	private static _maxDepth = 5;

	static hydrated = (overrides?: Partial<Parent>, stack: string[] = []): Parent => {
		const currentDepth = stack.filter(x => x === this._id).length;
		if (currentDepth === this._maxDepth - 1) return this.bare(overrides, stack);
		if (currentDepth >= this._maxDepth) {
			throw new Error('It looks like there is a circular dependency in the factory for Parent. Please check your type definitions and remove the circular dependency.');
		}

		const mock: Parent = {
			id: faker.number.int(),
			name: faker.string.alphanumeric(),
			child: ChildMock.hydrated({}, [...stack, this._id]),
			...overrides
		};

		return mock;
	}

	static bare = (overrides?: Partial<Parent>, stack: string[] = []): Parent => {
		const currentDepth = stack.filter(x => x === this._id).length;
		if (currentDepth >= this._maxDepth) {
			throw new Error('It looks like there is a circular dependency in the factory for Parent. Please check your type definitions and remove the circular dependency.');
		}

		const mock: Parent = {
			id: faker.number.int(),
			name: faker.string.alphanumeric(),
			child: ChildMock.bare({}, [...stack, this._id]),
			...overrides
		};

		return mock;
	}
}