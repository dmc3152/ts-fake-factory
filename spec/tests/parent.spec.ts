import { ParentMock } from "../../generated/spec/types/parent";
import { TypeParser } from "../../src/typeParser";

describe("Parent Interface", () => {
    const sut = new TypeParser();

    const parentMock = ParentMock.hydrated();
    console.log(parentMock);
    console.log(parentMock.child.grandchild.ancestor);

    it('should be true', () => {
        const expected = [
            {
                name: 'Parent',
                fields: [
                    {
                        name: 'id',
                        isNullable: false,
                        isReadOnly: false,
                        typeDetails: [
                            {
                                name: undefined,
                                text: 'number',
                                file: undefined,
                                kind: undefined
                            }
                        ]
                    },
                    {
                        name: 'name',
                        isNullable: false,
                        isReadOnly: false,
                        typeDetails: [
                            {
                                name: undefined,
                                text: 'string',
                                file: undefined,
                                kind: undefined
                            }
                        ]
                    },
                    {
                        name: 'child',
                        isNullable: false,
                        isReadOnly: false,
                        typeDetails: [
                            {
                                name: 'Child',
                                text: 'import("C:/Users/dmc31/.vscode/extensions/wallabyjs.wallaby-vscode-1.0.379/projects/8a21e1deec5c01f2/instrumented/spec/types/child").Child',
                                file: 'C:/Users/dmc31/.vscode/extensions/wallabyjs.wallaby-vscode-1.0.379/projects/8a21e1deec5c01f2/instrumented/spec/types/child.ts',
                                kind: 'InterfaceDeclaration'
                            }
                        ]
                    }
                ],
                isInterface: true,
                isExported: true,
                isClass: false
            },
            {
                name: 'Child',
                fields: [
                    {
                        name: 'location',
                        isNullable: false,
                        isReadOnly: false,
                        typeDetails: [
                            {
                                name: undefined,
                                text: 'string',
                                file: undefined,
                                kind: undefined
                            }
                        ]
                    },
                    {
                        name: 'isActive',
                        isNullable: false,
                        isReadOnly: false,
                        typeDetails: [
                            {
                                name: undefined,
                                text: 'boolean',
                                file: undefined,
                                kind: undefined
                            }
                        ]
                    },
                    {
                        name: 'grandchild',
                        isNullable: false,
                        isReadOnly: false,
                        typeDetails: [
                            {
                                name: 'Grandchild',
                                text: 'import("C:/Users/dmc31/.vscode/extensions/wallabyjs.wallaby-vscode-1.0.379/projects/8a21e1deec5c01f2/instrumented/spec/types/grandchild").Grandchild',
                                file: 'C:/Users/dmc31/.vscode/extensions/wallabyjs.wallaby-vscode-1.0.379/projects/8a21e1deec5c01f2/instrumented/spec/types/grandchild.ts',
                                kind: 'InterfaceDeclaration'
                            }
                        ]
                    }
                ],
                isInterface: true,
                isExported: true,
                isClass: false
            },
            {
                name: 'Grandchild',
                fields: [
                    {
                        name: 'name',
                        isNullable: false,
                        isReadOnly: false,
                        typeDetails: [
                            {
                                name: undefined,
                                text: 'string',
                                file: undefined,
                                kind: undefined
                            }
                        ]
                    }
                ],
                isInterface: true,
                isExported: true,
                isClass: false
            }
        ]

        const actual = sut.generateTypes("spec/types/parent.ts");

        let index = 0;
        actual.forEach((value) => {
            console.log(value);
            expect(value.name).toBe(expected[index].name);
            expect(value.isInterface).toBe(expected[index].isInterface);
            expect(value.isExported).toBe(expected[index].isExported);
            expect(value.isClass).toBe(expected[index].isClass);
            value.fields.forEach((field, i) => {
                expect(field.name).toBe(expected[index].fields[i].name);
                expect(field.isRequired).toBe(expected[index].fields[i].isNullable);
                expect(field.isReadOnly).toBe(expected[index].fields[i].isReadOnly);
                field.typeDetails.forEach((detail, j) => {
                    expect(detail.name).toBe(expected[index].fields[i].typeDetails[j].name);
                    expect(detail.text).toBe(expected[index].fields[i].typeDetails[j].text);
                    expect(detail.file).toBe(expected[index].fields[i].typeDetails[j].file);
                    expect(detail.kind).toBe(expected[index].fields[i].typeDetails[j].kind);
                });
            })
            index++;
        })
    })
})