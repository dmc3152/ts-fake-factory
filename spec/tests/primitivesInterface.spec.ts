import { TypeParser } from "../../src/typeParser";

describe("Primitives Interface", () => {
    const sut = new TypeParser();

    it('should be true', () => {
        const expected = [
            {
                name: 'PrimitivesInterface',
                fields: [
                    {
                        name: 'number',
                        isRequired: true,
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
                        isRequired: true,
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
                        isRequired: true,
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
                        isRequired: true,
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
                        isRequired: true,
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
                        isRequired: true,
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
                        isRequired: true,
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
                        isRequired: true,
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
                        isRequired: true,
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
                        name: 'symbol',
                        isRequired: true,
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
                        isRequired: true,
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

        const actual = sut.generateTypes("spec/types/primitivesInterface.ts");

        let index = 0;
        actual.forEach((value) => {
            expect(value.name).toBe(expected[index].name);
            expect(value.isInterface).toBe(expected[index].isInterface);
            expect(value.isExported).toBe(expected[index].isExported);
            expect(value.isClass).toBe(expected[index].isClass);
            value.fields.forEach((field, i) => {
                expect(field.name).toBe(expected[index].fields[i].name);
                expect(field.isRequired).toBe(expected[index].fields[i].isRequired);
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