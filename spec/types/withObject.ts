export interface withObject {
    name: string
    object: {
        id: number
        label: string
        nestedObject: {
            isCool: boolean
        }
    }
}