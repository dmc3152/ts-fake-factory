import { Grandchild } from "./grandchild";

export interface Child {
	location: string
	isActive: boolean
	grandchild: Grandchild
};