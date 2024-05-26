import { Project } from "ts-morph"
import { Address } from "./address"

export interface Person {
    id: number
    name: string
    address: Address
    test: Project
    other: Details
}

interface Details {
    color: string
    stuff: string | boolean | number
}