export interface withEnum {
    name: string
    enum: TestEnum
}

export enum TestEnum {
    One = 1,
    Two = 2,
    Three = 3,
    Four = "four"
}