import { Grandchild } from "../../../spec/types/grandchild"
import { ParentMock } from "./parent"

export class GrandchildMock {
	private static _id = "C:/code/ts-fake-factory/spec/types/grandchild.ts-Grandchild";
	private static _maxDepth = 5;

	static hydrated = (overrides?: Partial<Grandchild>, stack: string[] = []): Grandchild => {
		const currentDepth = stack.filter(x => x === this._id).length;
		if (currentDepth === this._maxDepth - 1) return this.bare(overrides, stack);
		if (currentDepth >= this._maxDepth) {
			throw new Error('It looks like there is a circular dependency in the factory for Grandchild. Please check your type definitions and remove the circular dependency.');
		}

		const mock: Grandchild = {
			name: 'string',
			ancestor: ParentMock.hydrated({}, [...stack, this._id]),
			...overrides
		};

		return mock;
	}

	static bare = (overrides?: Partial<Grandchild>, stack: string[] = []): Grandchild => {
		const currentDepth = stack.filter(x => x === this._id).length;
		if (currentDepth >= this._maxDepth) {
			throw new Error('It looks like there is a circular dependency in the factory for Grandchild. Please check your type definitions and remove the circular dependency.');
		}

		const mock: Grandchild = {
			name: 'string',
			...overrides
		};

		return mock;
	}
}