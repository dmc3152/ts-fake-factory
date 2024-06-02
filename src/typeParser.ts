import { InterfaceDeclaration, Project, PropertyDeclaration, PropertySignature, Type, ts, Node, SourceFile } from "ts-morph";

type PrimitiveType = "string" | "number" | "boolean" | "object" | "bigint" | "unknown" | "undefined" | "null" | "void" | "never" | "symbol" | "any";
type TypeText = PrimitiveType | string | number | ts.PseudoBigInt;

export class TypeParser {
    constructor() { }

    isPrimitiveType = (value: unknown): value is PrimitiveType => {
        if (typeof value === 'string') {
            const primitiveTypes = ["string", "number", "boolean", "object", "bigint", "unknown", "undefined", "null", "void", "never", "symbol", "any"];
            return primitiveTypes.includes(value);
        }
        return false;
    }

    determineTypeText = (fieldType: Type<ts.Type>): TypeText | TypeText[] | undefined => {
        let primitive: TypeText | TypeText[] | undefined = fieldType.getText();
        if (this.isPrimitiveType(primitive)) return primitive;
        // TODO: enum, tuple, literal
        if (fieldType.isBooleanLiteral()) return primitive;
        if (fieldType.isLiteral()) primitive = fieldType.getLiteralValue();
        if (fieldType.isArray() && primitive) primitive = [primitive];
        // console.log(fieldType.getText());
        // console.log(primitive);
        return primitive;
    }

    isNativeType = (fieldType: Type<ts.Type>): boolean => {
        return fieldType.isAny()
            || fieldType.isBoolean()
            || fieldType.isLiteral()
            || fieldType.isNever()
            || fieldType.isNull()
            || fieldType.isNumber()
            || fieldType.isString()
            || fieldType.isUndefined()
            || fieldType.isUnknown()
    }

    buildFieldFromProperty = (node: PropertyDeclaration | PropertySignature): TypeField => {
        const nodeSymbol = node.getType().getSymbol();
        let typeList: (Type<ts.Type> | Node<ts.Node>)[] = [];
        if (node.getType().isUnion()) {
            typeList = node.getType().getUnionTypes().reduce((declarations, union) => {
                const declarationType = union.getSymbol()?.getDeclarations().pop();
                if (declarationType) {
                    declarations.push(declarationType);
                }
                else {
                    declarations.push(union);
                }
                return declarations;
            }, [] as (Type<ts.Type> | Node<ts.Node>)[])
        }
        else if (nodeSymbol) {
            typeList = [nodeSymbol.getDeclarations()[0] || node.getType()];
        }
        else {
            typeList = [node.getType()];
        }

        let typeDetails = typeList.map(declarationType => {
            let details: TypeFieldDetails = {
                name: undefined,
                text: undefined,
                file: undefined,
                kind: undefined,
                isPrimitive: false,
                isLiteral: false,
                isInterface: false,
                isClass: false
            }
            if (declarationType instanceof Node) {
                const typeDef = declarationType.getType();
                const isNativeType = this.isNativeType(typeDef);
                details = {
                    name: typeDef.getSymbol()?.getName(),
                    text: this.determineTypeText(typeDef),
                    file: isNativeType ? undefined : declarationType.getSourceFile().getFilePath(),
                    kind: declarationType.getKindName(),
                    isClass: typeDef.isClass(),
                    isInterface: typeDef.isInterface(),
                    isPrimitive: this.isPrimitiveType(typeDef),
                    isLiteral: typeDef.isLiteral()
                }
            }
            else {
                details.text = this.determineTypeText(declarationType);
                details.isPrimitive = this.isPrimitiveType(declarationType);
                details.isLiteral = declarationType.isLiteral();
            }
            return details;
        });

        const booleanLiteralIndexes: { true: number[], false: number[] } = {
            true: [],
            false: []
        };
        typeDetails = typeDetails.reduce((details, item, index) => {
            if (item.text === 'false') booleanLiteralIndexes.false.push(index);
            else if (item.text === 'true') booleanLiteralIndexes.true.push(index);
            else details.push(item);
            return details;
        }, [] as typeof typeDetails);
        if (booleanLiteralIndexes.true.length && booleanLiteralIndexes.false.length) {
            typeDetails.push({
                text: 'boolean',
                name: undefined,
                file: undefined,
                kind: undefined,
                isClass: false,
                isInterface: false,
                isLiteral: false,
                isPrimitive: true
            });
        }
        else if (booleanLiteralIndexes.true.length) {
            typeDetails.push({
                text: 'true',
                name: undefined,
                file: undefined,
                kind: undefined,
                isClass: false,
                isInterface: false,
                isLiteral: true,
                isPrimitive: false
            })
        }
        else if (booleanLiteralIndexes.false.length) {
            typeDetails.push({
                text: 'false',
                name: undefined,
                file: undefined,
                kind: undefined,
                isClass: false,
                isInterface: false,
                isLiteral: true,
                isPrimitive: false
            })
        }

        if (node.getQuestionTokenNode() !== undefined && !typeDetails.some(x => x.text === 'undefined')) {
            typeDetails.push({
                text: 'undefined',
                name: undefined,
                file: undefined,
                kind: undefined,
                isClass: false,
                isInterface: false,
                isLiteral: true,
                isPrimitive: false
            })
        }

        // console.log(typeDetails)
        // node.getType().getSymbol()?.getDeclarations().forEach(x => {
        //     const sourceFile = x.getSourceFile();
        //     const name = x.getSymbol()?.getName();
        //     console.log(sourceFile.getFilePath());
        //     if (x.getKind() === SyntaxKind.InterfaceDeclaration && name) {
        //         console.log(sourceFile.getInterface(name)?.isExported());
        //     }
        //     if (x.getKind() === SyntaxKind.ClassDeclaration && name) {
        //         console.log(sourceFile.getClass(name)?.isExported());
        //     }
        //     if (x.getKind() === SyntaxKind.FunctionDeclaration && name) {
        //         console.log(sourceFile.getFunction(name)?.isExported());
        //     }
        //     if (x.getKind() === SyntaxKind.EnumDeclaration && name) {
        //         console.log(sourceFile.getEnum(name)?.isExported());
        //     }
        //     if (x.getKind() === SyntaxKind.ArrowFunction && name) {
        //         console.log(sourceFile.getFunction(name)?.isExported());
        //     }
        //     if (x.getKind() === SyntaxKind.TypeAliasDeclaration && name) {
        //         console.log(sourceFile.getTypeAlias(name)?.isExported());
        //     }
        // });
        // const sourceFile = node.getType().getSymbol()?.getValueDeclaration()?.getSourceFile();
        // console.log(sourceFile?.getFilePath())
        // const foundClass = sourceFile?.getClass(node.getType().getSymbol()?.getName() || '');
        // console.log(foundClass?.getName(), foundClass?.getKindName())
        return {
            name: node.getName(),
            typeDetails,
            // type: node.getType(),
            isRequired: node.getQuestionTokenNode() === undefined,
            isReadOnly: node.isReadonly()
        };
    }

    createProjectWithFiles = (file: string) => {
        const project = new Project();

        project.addSourceFilesAtPaths(file);

        return project;
    }

    createTypeOutlineFromInterface = (interfaceDeclaration: InterfaceDeclaration, sourceFile: SourceFile): TypesOutline => {
        const properties = interfaceDeclaration.getProperties();

        const outline: TypesOutline = {
            name: interfaceDeclaration.getName(),
            file: sourceFile.getFilePath(),
            fields: properties.map(property => this.buildFieldFromProperty(property)),
            isExported: interfaceDeclaration.isExported(),
            isInterface: true,
            isClass: false
        };

        return outline;
    }

    getTypeKeyIfNotInMaps = (outline: TypesOutline, typeMap: Map<string, TypesOutline>): string | undefined => {
        const key = `${outline.file}.${outline.name}`;
        return !typeMap.has(key) ? key : undefined;
    }

    setTypesWithFieldsFromSourceFile = (sourceFile: SourceFile, typeMap: Map<string, TypesOutline>): Map<string, TypesOutline> => {
        let typesWithoutFields = new Map<string, TypesOutline>();

        const interfaces = sourceFile.getInterfaces();

        interfaces.forEach(interfaceDeclaration => {
            const outline = this.createTypeOutlineFromInterface(interfaceDeclaration, sourceFile);
            const key = this.getTypeKeyIfNotInMaps(outline, typeMap);
            if (key) typeMap.set(key, outline);

            outline.fields.forEach(field => {
                typesWithoutFields = field.typeDetails.reduce((lookup, detail) => {
                    if (!detail.name || !detail.file) return lookup;

                    const newOutline: TypesOutline = {
                        name: detail.name,
                        file: detail.file,
                        fields: [],
                        isExported: false,
                        isInterface: detail.isInterface,
                        isClass: detail.isClass
                    };

                    const newTypeKey = this.getTypeKeyIfNotInMaps(newOutline, typeMap);
                    if (newTypeKey) lookup.set(newTypeKey, newOutline);

                    return lookup;
                }, typesWithoutFields);
            });
        });

        return typesWithoutFields;
    }

    setNewTypesRecursively = (outlinesMap: Map<string, TypesOutline>, project: Project, typeMap: Map<string, TypesOutline>) => {
        outlinesMap.forEach((outline) => {
            const sourceFile = project.addSourceFileAtPath(outline.file);
            const newTypesWithoutFields = this.setTypesWithFieldsFromSourceFile(sourceFile, typeMap);

            if (newTypesWithoutFields.size > 0) {
                this.setNewTypesRecursively(newTypesWithoutFields, project, typeMap);
            }
        });
    }

    generateTypes = (file: string) => {
        let typeMap = new Map<string, TypesOutline>();

        const project = this.createProjectWithFiles(file);
        const sourceFiles = project.getSourceFiles();

        sourceFiles.forEach(sourceFile => {
            const newTypesWithoutFields = this.setTypesWithFieldsFromSourceFile(sourceFile, typeMap);

            if (newTypesWithoutFields.size > 0) {
                this.setNewTypesRecursively(newTypesWithoutFields, project, typeMap);
            }
        })

        return typeMap;
    };
}

const printMap = (map: Map<string, TypesOutline>) => {
    [...map.entries()].forEach(entry => {
        console.log(entry[0]);
        console.log(entry[1], entry[1].fields);
    })
}

export type TypesOutline = {
    name: string
    file: string
    fields: TypeField[]
    isExported: boolean
    isInterface: boolean
    isClass: boolean
}

export type TypeField = {
    name: string
    typeDetails: TypeFieldDetails[]
    type?: Type<ts.Type>
    isRequired: boolean
    isReadOnly: boolean
}

export type TypeFieldDetails = {
    name?: string
    text?: TypeText | TypeText[]
    file?: string
    kind?: string
    isPrimitive: boolean
    isLiteral: boolean
    isInterface: boolean
    isClass: boolean
}