import { generateTypes } from "../../index";

describe("Primitives Interface", () => {
    const sut = generateTypes;

    it('should be true', () => {
        const expected = [
            {
                name: 'PrimitivesInterface',
                fields: [
                    {
                        name: 'number',
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
                        name: 'string',
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
                        name: 'boolean',
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
                        name: 'object',
                        isNullable: false,
                        isReadOnly: false,
                        typeDetails: [
                            {
                                name: undefined,
                                text: 'object',
                                file: undefined,
                                kind: undefined
                            }
                        ]
                    },
                    {
                        name: 'bigint',
                        isNullable: false,
                        isReadOnly: false,
                        typeDetails: [
                            {
                                name: undefined,
                                text: 'bigint',
                                file: undefined,
                                kind: undefined
                            }
                        ]
                    },
                    {
                        name: 'unknown',
                        isNullable: false,
                        isReadOnly: false,
                        typeDetails: [
                            {
                                name: undefined,
                                text: 'unknown',
                                file: undefined,
                                kind: undefined
                            }
                        ]
                    },
                    {
                        name: 'undefined',
                        isNullable: false,
                        isReadOnly: false,
                        typeDetails: [
                            {
                                name: undefined,
                                text: 'undefined',
                                file: undefined,
                                kind: undefined
                            }
                        ]
                    },
                    {
                        name: 'null',
                        isNullable: false,
                        isReadOnly: false,
                        typeDetails: [
                            {
                                name: undefined,
                                text: 'null',
                                file: undefined,
                                kind: undefined
                            }
                        ]
                    },
                    {
                        name: 'void',
                        isNullable: false,
                        isReadOnly: false,
                        typeDetails: [
                            {
                                name: undefined,
                                text: 'void',
                                file: undefined,
                                kind: undefined
                            }
                        ]
                    },
                    {
                        name: 'never',
                        isNullable: false,
                        isReadOnly: false,
                        typeDetails: [
                            {
                                name: undefined,
                                text: 'never',
                                file: undefined,
                                kind: undefined
                            }
                        ]
                    },
                    {
                        name: 'symbol',
                        isNullable: false,
                        isReadOnly: false,
                        typeDetails: [
                            {
                                name: undefined,
                                text: 'symbol',
                                file: undefined,
                                kind: undefined
                            }
                        ]
                    },
                    {
                        name: 'any',
                        isNullable: false,
                        isReadOnly: false,
                        typeDetails: [
                            {
                                name: undefined,
                                text: 'any',
                                file: undefined,
                                kind: undefined
                            }
                        ]
                    },
                ],
                isInterface: true,
                isExported: true,
                isClass: false
            }
        ]

        const actual = sut("spec/types/primitivesInterface.ts");

        let index = 0;
        actual.forEach((value) => {
            expect(value.name).toBe(expected[index].name);
            expect(value.isInterface).toBe(expected[index].isInterface);
            expect(value.isExported).toBe(expected[index].isExported);
            expect(value.isClass).toBe(expected[index].isClass);
            value.fields.forEach((field, i) => {
                expect(field.name).toBe(expected[index].fields[i].name);
                expect(field.isNullable).toBe(expected[index].fields[i].isNullable);
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