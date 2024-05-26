import { hash } from "crypto";
import { GetAccessorDeclaration, ImportDeclaration, ImportSpecifier, InterfaceDeclaration, MethodDeclaration, Project, PropertyDeclaration, PropertySignature, SyntaxKind, Type, ts, Node } from "ts-morph";

// enum PossibleTypes {
//     ANY = 'ANY',
//     UNDEFINED = 'UNDEFINED',
//     LITERAL = 'LITERAL',
//     STRING = 'STRING',
//     NUMBER = 'NUMBER',
//     BOOLEAN = 'BOOLEAN',
//     ENUM = 'ENUM',
//     NEVER = 'NEVER',
//     NULL = 'NULL',
//     ARRAY = 'ARRAY',
//     OBJECT = 'OBJECT',
//     TUPLE = 'TUPLE',
//     UNKNOWN = 'UNKNOWN',
//     VOID = 'VOID'
// }

// enum PossibleKinds {
//     STRING_KEYWORD = 'StringKeyword',
//     TYPE_REFERENCE = 'TypeReference',
//     IDENTIFIER = 'Identifier',
//     PROPERTY_SIGNATURE = 'PropertySignature',
//     INTERFACE_DECLARATION = 'InterfaceDeclaration',
//     IMPORT_SPECIFIER = 'ImportSpecifier',
//     PROPERTY_DECLARATION = 'PropertyDeclaration',
//     GET_ACCESSOR = 'GetAccessor',
//     METHOD_DECLARATION = 'MethodDeclaration',
// }

// const determineType = (fieldType: Type<ts.Type>): PossibleTypes[] => {
//     const types: PossibleTypes[] = [];
//     if (fieldType.isAny()) types.push(PossibleTypes.ANY);
//     if (fieldType.isArray()) types.push(PossibleTypes.ARRAY);
//     if (fieldType.isBoolean()) types.push(PossibleTypes.BOOLEAN);
//     if (fieldType.isEnum()) types.push(PossibleTypes.ENUM);
//     if (fieldType.isNever()) types.push(PossibleTypes.NEVER);
//     if (fieldType.isNull()) types.push(PossibleTypes.NULL);
//     if (fieldType.isNumber()) types.push(PossibleTypes.NUMBER);
//     if (fieldType.isLiteral()) types.push(PossibleTypes.LITERAL);
//     if ((fieldType.isObject() || fieldType.isClassOrInterface()) && !fieldType.isUnion() && !fieldType.isArray()) types.push(PossibleTypes.OBJECT);
//     if (fieldType.isString()) types.push(PossibleTypes.STRING);
//     if (fieldType.isTuple()) types.push(PossibleTypes.TUPLE);
//     if (fieldType.isUndefined()) types.push(PossibleTypes.UNDEFINED);
//     if (fieldType.isUnknown()) types.push(PossibleTypes.UNKNOWN);
//     if (fieldType.isVoid()) types.push(PossibleTypes.VOID);
//     return types;
// }

type PrimitiveType = "string" | "number" | "boolean" | "object" | "bigint" | "unknown" | "undefined" | "null" | "void" | "never" | "symbol" | "any";
type TypeText = PrimitiveType | string | number | ts.PseudoBigInt;

const isPrimitiveType = (value: unknown): value is PrimitiveType => {
    if (typeof value === 'string') {
        const primitiveTypes = ["string", "number", "boolean", "object", "bigint", "unknown", "undefined", "null", "void", "never", "symbol", "any"];
        return primitiveTypes.includes(value);
    }
    return false;
}

const determineTypeText = (fieldType: Type<ts.Type>): TypeText | TypeText[] | undefined => {
    if (isPrimitiveType(fieldType.getText())) return fieldType.getText();
    // TODO: enum, tuple, literal
    let primitive: TypeText | TypeText[] | undefined = undefined;
    if (fieldType.isLiteral()) primitive = fieldType.getLiteralValue();
    if (fieldType.isBooleanLiteral()) primitive = fieldType.getText();
    if (fieldType.isArray() && primitive) primitive = [primitive];
    console.log(fieldType.getText())
    console.log(primitive);
    return primitive;
}

const isNativeType = (fieldType: Type<ts.Type>): boolean => {
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

const buildFieldFromProperty = (node: PropertyDeclaration | PropertySignature): TypeField => {
    // console.log(node.getName(), node.getType().getApparentType().getSymbol()?.getName(), node.getType().getSymbol()?.getName());
    // node.getType().getUnionTypes().forEach(union => {
    //     console.log(union.isString())
    //     console.log(union.getSymbol()?.getDeclarations())
    // })
    const nodeSymbol = node.getType().getSymbol();
    let typeList: (Type<ts.Type> | Node<ts.Node>)[] = [];
    if (node.getType().isUnion()) {
        typeList = node.getType().getUnionTypes().reduce((declarations, union) => {
            // console.log(union);
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
        let name, file, kind, text;
        if (declarationType instanceof Node) {
            name = declarationType.getType().getSymbol()?.getName();
            text = determineTypeText(declarationType.getType());
            file = isNativeType(declarationType.getType()) ? undefined : declarationType.getSourceFile().getFilePath();
            kind = declarationType.getKindName();
            // console.log(declarationType.getSymbol()?.getName(), isNativeType(declarationType.getType()))
        }
        else {
            // Change this logic to use a function to determine the type
            // name = declarationType.getApparentType().getSymbol()?.getName();
            // console.log(declarationType.getApparentType().getSymbol()?.getName());
            text = determineTypeText(declarationType);
            // console.log(declarationType.getApparentType().getSymbol()?.getName(), isNativeType(declarationType), declarationType.isInterface())
        }
        return {
            name: name,
            text: text,
            file: file,
            kind: kind
        };
    });

    const booleanLiteralIndexes: {true: number[], false: number[]} = {
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
            kind: undefined
        });
    }
    else if (booleanLiteralIndexes.true.length) {
        typeDetails.push({
            text: 'true',
            name: undefined,
            file: undefined,
            kind: undefined
        })
    }
    else if (booleanLiteralIndexes.false.length) {
        typeDetails.push({
            text: 'false',
            name: undefined,
            file: undefined,
            kind: undefined
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
        isNullable: node.getType().isNullable(),
        isReadOnly: node.isReadonly()
    };
}

// const getFieldsFromType = (parentType: Type<ts.Type>) => {
//     return parentType.getProperties().reduce((fields, property) => {
//         const valueDeclaration = property.getValueDeclaration();
//         if (!valueDeclaration) return fields;

//         // console.log('PROP KIND:', valueDeclaration.getKindName());
//         const node = valueDeclaration.asKind(valueDeclaration.getKind());
//         if (node instanceof MethodDeclaration) {
//             // console.log(node.getName());
//             // if (!node.getParameters().length) console.log("NO PARAMETERS");
//             // node.getParameters().forEach(param => {
//             //     console.log('PARAM NAME:', param.getName());
//             //     console.log('PARAM TYPE:', determineType(param.getType()));
//             // })
//             // console.log('RETURN TYPE:', determineType(node.getReturnType()))
//             const field = {
//                 name: node.getName(),
//                 typeDetails: [{
//                     name: node.getType().getSymbol()?.getName(),
//                     text: determineTypeText(node.getType()),
//                     file: node.getSourceFile().getFilePath(),
//                     kind: node.getKindName()
//                 }],
//                 type: node.getType(),
//                 isNullable: node.getType().isNullable(),
//                 isReadOnly: false
//             };
//             fields.push(field);
//         }
//         else if (node instanceof PropertyDeclaration || node instanceof PropertySignature) {
//             const field = buildFieldFromProperty(node);
//             fields.push(field);
//         }
//         else if (node instanceof GetAccessorDeclaration) {
//             const field = {
//                 name: node.getName(),
//                 typeDetails: [{
//                     name: node.getType().getSymbol()?.getName(),
//                     text: determineTypeText(node.getType()),
//                     file: node.getSourceFile().getFilePath(),
//                     kind: node.getKindName()
//                 }],
//                 type: node.getType(),
//                 isNullable: node.getType().isNullable(),
//                 isReadOnly: false
//             };
//             fields.push(field);
//         }

//         return fields;
//     }, [] as TypeField[]);
// }

export const generateTypes = (file: string) => {
    const project = new Project();
    const typeMap = new Map<string, TypesOutline>();
    project.addSourceFilesAtPaths(file);

    const sourceFiles = project.getSourceFiles();
    sourceFiles.forEach(sourceFile => {
        const interfaces = sourceFile.getInterfaces();
        interfaces.forEach(x => {
            // console.log(x.getName()); // returns "Person"
            // const fullyQualifiedName = x.getNameNode().getSymbol()?.getFullyQualifiedName() || 'NO NAME';
            const key = `${sourceFile.getFilePath()}.${x.getName()}`;
            // const key = hash("sha1", `"${sourceFile.getFilePath().replace('.ts', '')}".${x.getName()}`);
            const outline: TypesOutline = {
                name: x.getName(),
                file: sourceFile.getFilePath(),
                fields: [],
                isExported: x.isExported(),
                isInterface: true,
                isClass: false
            }

            if (!typeMap.has(key)) {
                typeMap.set(key, outline)
            }
            const properties = x.getProperties();
            properties.forEach(property => {
                const field = buildFieldFromProperty(property);
                // console.log(field);
                typeMap.get(key)?.fields.push(field);
                field.typeDetails.forEach(fieldType => {
                    if (fieldType.name && fieldType.file) {
                        const newOutline: TypesOutline = {
                            name: fieldType.name,
                            file: fieldType.file,
                            fields: [],
                            isExported: false,
                            isInterface: property.getType().isInterface(),
                            isClass: property.getType().isClass()
                        }
                        // add logic to iterate over the generated fields and create new typemap entries as needed
                        const newTypeKey = `${fieldType.file}.${fieldType.name}`;
                        if (!typeMap.has(newTypeKey)) {
                            typeMap.set(newTypeKey, newOutline);
                        }
                    }
                })
            })
        })

        // person interface
        // const personInterface = sourceFile.getInterface("Person")!;
        // personInterface.isDefaultExport(); // returns true
        // personInterface.getName(); // returns "Person"
        // personInterface.getProperties(); // returns the properties
    })

    return typeMap;
}

const printMap = (map: Map<string, TypesOutline>) => {
    [...map.entries()].forEach(entry => {
        console.log(entry[0]);
        console.log(entry[1], entry[1].fields);
    })
}

// const generatedTypes = generateTypes("src/*.ts");
const generatedTypes = generateTypes("spec/types/primitivesInterface.ts");
generatedTypes.forEach(value => {
    console.log(value.fields);
});

// printMap(typeMap);


/*
- I need to identify types by files so that I can differentiate between multiple types with the same name
- Use a Map to store the types that are already created so that they are only created once
- I need to determine a strategy for circular dependencies




*/

type TypesOutline = {
    name: string
    file: string
    fields: TypeField[]
    isExported: boolean
    isInterface: boolean
    isClass: boolean
}

type TypeField = {
    name: string
    typeDetails: {
        name?: string
        text?: TypeText | TypeText[]
        file?: string
        kind?: string
    }[]
    type?: Type<ts.Type>
    isNullable: boolean
    isReadOnly: boolean
}