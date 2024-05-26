import { Child } from "./child"

export interface Parent {
    id: number
    name: string
    child: Child
}