import { Child } from "../../../spec/types/child"
import { GrandchildMock } from "./grandchild"

export class ChildMock {
	private static _id = "C:/code/ts-fake-factory/spec/types/child.ts-Child";
	private static _maxDepth = 5;

	static hydrated = (overrides?: Partial<Child>, stack: string[] = []): Child => {
		const currentDepth = stack.filter(x => x === this._id).length;
		if (currentDepth === this._maxDepth - 1) return this.bare(overrides, stack);
		if (currentDepth >= this._maxDepth) {
			throw new Error('It looks like there is a circular dependency in the factory for Child. Please check your type definitions and remove the circular dependency.');
		}

		const mock: Child = {
			location: 'string',
			isActive: true,
			grandchild: GrandchildMock.hydrated({}, [...stack, this._id]),
			...overrides
		};

		return mock;
	}

	static bare = (overrides?: Partial<Child>, stack: string[] = []): Child => {
		const currentDepth = stack.filter(x => x === this._id).length;
		if (currentDepth >= this._maxDepth) {
			throw new Error('It looks like there is a circular dependency in the factory for Child. Please check your type definitions and remove the circular dependency.');
		}

		const mock: Child = {
			location: 'string',
			isActive: true,
			grandchild: GrandchildMock.bare({}, [...stack, this._id]),
			...overrides
		};

		return mock;
	}
}