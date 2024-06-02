import { Parent } from "./parent";

export interface Grandchild {
    name: string
    ancestor?: Parent
};