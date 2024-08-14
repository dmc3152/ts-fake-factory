import { InterfaceDeclaration, Project, PropertyDeclaration, PropertySignature, Type, ts, Node, SourceFile, SyntaxKind } from "ts-morph";

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

    determineTypeText = (fieldType: Type<ts.Type>): { text: TypeText | TypeText[] | undefined, typeDetails?: TypeFieldDetails[] } => {
        let primitive: TypeText | TypeText[] | undefined = fieldType.getText();
        if (this.isPrimitiveType(primitive)) return { text: primitive };
        // TODO: investigate literals support
        if (fieldType.isEnumLiteral()) {
            const enumName = fieldType.getBaseTypeOfLiteralType().getSymbol()?.getName()!;
            const enumKey = fieldType.getSymbol()?.getName();
            const enumValue = `${enumName}.${enumKey}`;
            return { text: enumValue };
        }
        if (fieldType.isBooleanLiteral()) return { text: primitive };
        if (fieldType.isLiteral()) primitive = fieldType.getLiteralValue();
        if (fieldType.isArray()) return { text: primitive, typeDetails: fieldType.getArrayElementType() ? [this.mapTypeDetails(fieldType.getArrayElementType()!)] : undefined};
        if (fieldType.isTuple()) return { text: primitive, typeDetails: fieldType.getTupleElements().map(x => this.mapTypeDetails(x)) };
        if (fieldType.isObject()) return {
            text: primitive, typeDetails: fieldType.getProperties().reduce((declarations, property) => {
                const declarationType = property.getDeclarations().pop();
                if (declarationType) {
                    declarations.push(this.mapTypeDetails(declarationType));
                }
                return declarations;
            }, [] as TypeFieldDetails[])};
        // console.log(fieldType.getText());
        // console.log(primitive);
        return { text: primitive };
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

    extractListOfTypesFromPropertyNode = (node: PropertyDeclaration | PropertySignature): (Type<ts.Type> | Node<ts.Node>)[] => {
        // console.log('method called');
        const nodeSymbol = node.getType().getSymbol();
        if (node.getType().isObject()) {
            return node.getType().getProperties().reduce((declarations, property) => {
                const declarationType = property.getDeclarations().pop();
                if (declarationType) {
                    declarations.push(declarationType);
                }
                return declarations;
            }, [] as (Type<ts.Type> | Node<ts.Node>)[])
        }
        else if (node.getType().isArray()) {
            const arrayElementType = node.getType().getArrayElementType();
            if (arrayElementType) {
                return [arrayElementType];
            }
            else {
                return [];
            }
        }
        else if (node.getType().isUnion()) {
            return node.getType().getUnionTypes().reduce((declarations, union) => {
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
        else if (node.getType().isTuple()) {
            return node.getType().getTupleElements().reduce((declarations, tuple) => {
                const declarationType = tuple.getSymbol()?.getDeclarations().pop();
                if (declarationType) {
                    declarations.push(declarationType);
                }
                else {
                    declarations.push(tuple);
                }
                return declarations;
            }, [] as (Type<ts.Type> | Node<ts.Node>)[])
        }
        else if (nodeSymbol) {
            return [nodeSymbol.getDeclarations()[0] || node.getType()];
        }
        else {
            return [node.getType()];
        }
    }

    combineBooleanTypeDetails = (typeDetails: TypeFieldDetails[]): TypeFieldDetails[] => {
        const booleanLiteralIndexes: { true: number[], false: number[] } = {
            true: [],
            false: []
        };

        const combinedTypeDetails = typeDetails.reduce((details, item, index) => {
            if (item.text === 'false') booleanLiteralIndexes.false.push(index);
            else if (item.text === 'true') booleanLiteralIndexes.true.push(index);
            else details.push(item);
            return details;
        }, [] as TypeFieldDetails[]);
        
        if (booleanLiteralIndexes.true.length && booleanLiteralIndexes.false.length) {
            combinedTypeDetails.push({
                text: 'boolean',
                name: undefined,
                file: undefined,
                kind: undefined,
                isClass: false,
                isInterface: false,
                isLiteral: false,
                isEnumLiteral: false,
                isPrimitive: true,
                isTuple: false,
                isArray: false,
                isObject: false,
            });
        }
        else if (booleanLiteralIndexes.true.length) {
            combinedTypeDetails.push({
                text: 'true',
                name: undefined,
                file: undefined,
                kind: undefined,
                isClass: false,
                isInterface: false,
                isLiteral: true,
                isEnumLiteral: false,
                isPrimitive: false,
                isTuple: false,
                isArray: false,
                isObject: false,
            })
        }
        else if (booleanLiteralIndexes.false.length) {
            combinedTypeDetails.push({
                text: 'false',
                name: undefined,
                file: undefined,
                kind: undefined,
                isClass: false,
                isInterface: false,
                isLiteral: true,
                isEnumLiteral: false,
                isPrimitive: false,
                isTuple: false,
                isArray: false,
                isObject: false,
            })
        }

        return combinedTypeDetails;
    }

    mapTypeDetails = (declarationType: Type<ts.Type> | Node<ts.Node>): TypeFieldDetails => {
        let details: TypeFieldDetails = {
            name: declarationType.getSymbol()?.getName(),
            text: undefined,
            file: undefined,
            kind: undefined,
            isPrimitive: false,
            isLiteral: false,
            isEnumLiteral: false,
            isInterface: false,
            isClass: false,
            isTuple: false,
            isArray: false,
            isObject: false,
        }
        if (declarationType instanceof Node) {
            const typeDef = declarationType.getType();
            const isNativeType = this.isNativeType(typeDef);
            const { text, typeDetails } = this.determineTypeText(typeDef);
            let enumDefinition: string | undefined;
            let name = declarationType.getSymbol()?.getName();
            let enumFile: string | undefined;
            if (typeDef.isEnumLiteral()) {
                const enumName = typeDef.getBaseTypeOfLiteralType().getSymbol()?.getName()!;
                const enumDeclaration = typeDef.getSymbol()?.getValueDeclaration()?.getSourceFile().getEnum(enumName)!;
                const isExported = enumDeclaration?.isExported();
                const filePath = enumDeclaration?.getSourceFile().getFilePath();
                const enumText = enumDeclaration?.getText();
                enumDefinition = isExported ? undefined : enumText;
                enumFile = isExported ? filePath : undefined;
                name = enumName;
                // console.log(fileString);
            }
            details = {
                name,
                text,
                nestedTypeDetails: typeDetails,
                file: isNativeType || typeDef.isObject() ? undefined : declarationType.getSourceFile().getFilePath(),
                enumFile,
                kind: declarationType.getKindName(),
                enumDefinition,
                isClass: typeDef.isClass(),
                isInterface: typeDef.isInterface(),
                isPrimitive: this.isPrimitiveType(typeDef),
                isLiteral: typeDef.isLiteral(),
                isEnumLiteral: typeDef.isEnumLiteral(),
                isTuple: typeDef.isTuple(),
                isArray: typeDef.isArray(),
                isObject: typeDef.isObject(),
            }
        }
        else {
            const { text, typeDetails } = this.determineTypeText(declarationType);
            details.text = text;
            details.nestedTypeDetails = typeDetails;
            details.isPrimitive = this.isPrimitiveType(declarationType);
            details.isLiteral = declarationType.isLiteral();
            details.isEnumLiteral = declarationType.isEnumLiteral();
            details.isTuple = declarationType.isTuple();
            details.isArray = declarationType.isArray();
            details.isObject = declarationType.isObject();
        }
        // console.log(details);
        return details;
    }

    handleOptionalTypeDetails = (node: PropertyDeclaration | PropertySignature, typeDetails: TypeFieldDetails[]): TypeFieldDetails[] => {
        if (node.getQuestionTokenNode() === undefined || typeDetails.some(x => x.text === 'undefined')) return [...typeDetails];
        
        return [
            ...typeDetails,
            {
                text: 'undefined',
                name: undefined,
                file: undefined,
                kind: undefined,
                isClass: false,
                isInterface: false,
                isLiteral: true,
                isEnumLiteral: false,
                isPrimitive: false,
                isTuple: false,
                isArray: false,
                isObject: false,
            }
        ];
    }

    buildFieldFromProperty = (node: PropertyDeclaration | PropertySignature): TypeField => {
        const typeList = this.extractListOfTypesFromPropertyNode(node);
        const typeDetails = typeList.map(declarationType => this.mapTypeDetails(declarationType));
        // console.log(typeDetails)
        const booleanHandledTypeDetails = this.combineBooleanTypeDetails(typeDetails);
        const optionalHandledTypeDetails = this.handleOptionalTypeDetails(node, booleanHandledTypeDetails);
        
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
            typeDetails: optionalHandledTypeDetails,
            // type: node.getType(),
            isRequired: node.getQuestionTokenNode() === undefined,
            isReadOnly: node.isReadonly(),
            isTuple: node.getType().isTuple(),
            isArray: node.getType().isArray(),
            isObject: node.getType().isObject(),
            isEnum: node.getType().isEnum(),
        };
    }

    createProjectFromFiles = (file: string) => {
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

        const project = this.createProjectFromFiles(file);
        const sourceFiles = project.getSourceFiles();

        sourceFiles.forEach(sourceFile => {
            const newTypesWithoutFields = this.setTypesWithFieldsFromSourceFile(sourceFile, typeMap);

            if (newTypesWithoutFields.size > 0) {
                this.setNewTypesRecursively(newTypesWithoutFields, project, typeMap);
            }
        })

        // printMap(typeMap);
        return typeMap;
    };
}

const printMap = (map: Map<string, TypesOutline>) => {
    [...map.entries()].forEach(entry => {
        // console.log(entry[0]);
        console.log(entry[1], entry[1].fields);
        entry[1].fields.forEach(field => {
            console.log(field.typeDetails);
        })
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
    isTuple: boolean
    isArray: boolean
    isObject: boolean
    isEnum: boolean
}

export type TypeFieldDetails = {
    name?: string
    text?: TypeText | TypeText[]
    nestedTypeDetails?: TypeFieldDetails[]
    file?: string
    enumFile?: string
    kind?: string
    enumDefinition?: string
    isPrimitive: boolean
    isEnumLiteral: boolean
    isLiteral: boolean
    isInterface: boolean
    isClass: boolean
    isArray: boolean
    isTuple: boolean
    isObject: boolean
}