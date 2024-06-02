import { PrimitivesInterface } from "../../../spec/types/primitivesInterface"

export class PrimitivesInterfaceMock {
	private static _id = "C:/code/ts-fake-factory/spec/types/primitivesInterface.ts-PrimitivesInterface";
	private static _maxDepth = 5;

	static hydrated = (overrides?: Partial<PrimitivesInterface>, stack: string[] = []): PrimitivesInterface => {
		const currentDepth = stack.filter(x => x === this._id).length;
		if (currentDepth === this._maxDepth - 1) return this.bare(overrides, stack);
		if (currentDepth >= this._maxDepth) {
			throw new Error('It looks like there is a circular dependency in the factory for PrimitivesInterface. Please check your type definitions and remove the circular dependency.');
		}

		const mock: PrimitivesInterface = {
			number: 5,
			string: 'string',
			boolean: true,
			object: {},
			bigint: BigInt(99999999999),
			unknown: {},
			undefined: undefined,
			null: null,
			void: undefined,
			symbol: Symbol(),
			any: {},
			...overrides
		};

		return mock;
	}

	static bare = (overrides?: Partial<PrimitivesInterface>, stack: string[] = []): PrimitivesInterface => {
		const currentDepth = stack.filter(x => x === this._id).length;
		if (currentDepth >= this._maxDepth) {
			throw new Error('It looks like there is a circular dependency in the factory for PrimitivesInterface. Please check your type definitions and remove the circular dependency.');
		}

		const mock: PrimitivesInterface = {
			number: 5,
			string: 'string',
			boolean: true,
			object: {},
			bigint: BigInt(99999999999),
			unknown: {},
			undefined: undefined,
			null: null,
			void: undefined,
			symbol: Symbol(),
			any: {},
			...overrides
		};

		return mock;
	}
}