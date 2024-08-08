export interface withEnum {
    name: string
    enum: Enum
}

export enum Enum {
    One = 1,
    Two = 2,
    Three = 3,
    Four = "four"
}