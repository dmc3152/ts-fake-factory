import { writeFile } from "fs/promises";
import { TypeField, TypeFieldDetails, TypesOutline } from "./typeParser";
import { existsSync, mkdirSync } from "fs";
import path from "path";

export class FactoryWriter {
    constructor() { }

    writeTypeMapFactory = async (typeMap: Map<string, TypesOutline>, outputPath: string) => {
        const writePromises: Promise<void>[] = [];
        const typesByFile = Array.from(typeMap).reduce((files, [key, outline]) => {
            let outlines: TypesOutline[];
            if (files.has(outline.file)) {
                outlines = files.get(outline.file)!;
            }
            else {
                outlines = [];
            }
            outlines.push(outline);
            files.set(outline.file, outlines);
            return files;
        }, new Map<string, TypesOutline[]>());
        typesByFile.forEach((outlines) => {
            writePromises.push(this.writeTypeFactory(outlines, outputPath));
        });
        const result = await Promise.allSettled(writePromises);
        // result.forEach(x => console.log(x));
    }

    writeTypeFactory = async (typeOutlines: TypesOutline[], outputPath: string) => {
        const writeLocation = this.buildFileLocation(typeOutlines[0].file, outputPath);
        const directoryLocation = writeLocation.split('/').slice(0, -1).join('/');
        const content = this.generateContent(typeOutlines, outputPath, directoryLocation);

        if (!existsSync(directoryLocation)) {
            mkdirSync(directoryLocation, { recursive: true });
        }

        return writeFile(writeLocation, content);
    }

    buildFileLocation = (filePath: string, outputPath: string) => {
        const splitFile = filePath.split('/');
        const rootDirectoryIndex = splitFile.indexOf('ts-fake-factory') + 1;
        const splitDirectoryPath = [
            ...outputPath.split('/'),
            ...splitFile.slice(rootDirectoryIndex)
        ];
        return splitDirectoryPath.join('/');
    }

    generateContent = (outlines: TypesOutline[], outputPath: string, writeLocation: string) => {
        let importMap = new Map<string, Set<string>>();
        let enumMap = new Map<string, string>();

        const typeBodies = outlines.map(typeOutline => {
            let text = '';
            let bareText = '';
            let hydratedText = '';
            if (typeOutline.isInterface) {
                text += `export class ${typeOutline.name}Mock {\n`;
                text += `\tprivate static _id = "${typeOutline.file}-${typeOutline.name}";\n`;
                text += `\tprivate static _maxDepth = 5;\n\n`;

                bareText += `\tstatic bare = (overrides?: Partial<${typeOutline.name}>, stack: string[] = []): ${typeOutline.name} => {\n`;
                bareText += `\t\tconst currentDepth = stack.filter(x => x === this._id).length;\n`;
                bareText += `\t\tif (currentDepth >= this._maxDepth) {\n`;
                bareText += `\t\t\tthrow new Error('It looks like there is a circular dependency in the factory for ${typeOutline.name}. Please check your type definitions and remove the circular dependency.');\n`;
                bareText += `\t\t}\n\n`;
                bareText += `\t\tconst mock: ${typeOutline.name} = {\n`;

                hydratedText += `\tstatic hydrated = (overrides?: Partial<${typeOutline.name}>, stack: string[] = []): ${typeOutline.name} => {\n`;
                hydratedText += `\t\tconst currentDepth = stack.filter(x => x === this._id).length;\n`;
                hydratedText += `\t\tif (currentDepth === this._maxDepth - 1) return this.bare(overrides, stack);\n`;
                hydratedText += `\t\tif (currentDepth >= this._maxDepth) {\n`;
                hydratedText += `\t\t\tthrow new Error('It looks like there is a circular dependency in the factory for ${typeOutline.name}. Please check your type definitions and remove the circular dependency.');\n`;
                hydratedText += `\t\t}\n\n`;
                hydratedText += `\t\tconst mock: ${typeOutline.name} = {\n`;
                
                typeOutline.fields.forEach(field => {
                    const maps = this.generateImports(field, typeOutline, outputPath, writeLocation, importMap, enumMap);
                    importMap = maps.importMap;
                    enumMap = maps.enumMap;

                    const { typeDetails, hasUndefined, hasNull } = field.typeDetails.reduce((details, detail) => {
                        if (detail.text === 'undefined') {
                            details.hasUndefined = true;
                            if (field.isRequired) {
                                details.typeDetails.push(detail);
                            }
                        }
                        else if (detail.text === 'null') {
                            details.hasNull = true;
                            details.typeDetails.push(detail);
                        }
                        else {
                            details.typeDetails.push(detail);
                        }
                        return details;
                    }, {
                        typeDetails: [] as TypeFieldDetails[],
                        hasUndefined: false,
                        hasNull: false
                    });

                    if (typeDetails.length > 0) {
                        const hydratedValue = this.generateValue(typeDetails, true, field.isTuple, field.isArray, field.isObject);
                        hydratedText += `\t\t\t${field.name}: ${hydratedValue},\n`;
                        
                        if (hasUndefined && field.isRequired) {
                            bareText += `\t\t\t${field.name}: undefined,\n`;
                        }
                        if (hasNull) {
                            bareText += `\t\t\t${field.name}: null,\n`;
                        }
                        else if (!hasUndefined) {
                            const bareValue = this.generateValue(typeDetails, false, field.isTuple, field.isArray, field.isObject);
                            bareText += `\t\t\t${field.name}: ${bareValue},\n`;
                        }
                    }
                });
                bareText += '\t\t\t...overrides\n';
                bareText += '\t\t};\n\n';
                bareText += '\t\treturn mock;\n';
                bareText += '\t}';

                hydratedText += '\t\t\t...overrides\n';
                hydratedText += '\t\t};\n\n';
                hydratedText += '\t\treturn mock;\n';
                hydratedText += '\t}';

                text += `${hydratedText}\n\n`;
                text += `${bareText}\n`;
                text += `}`;
            }
            return text;
        });

        const imports = this.buildImportsFromMap(importMap);
        const enums = this.buildEnumsFromMap(enumMap);
        const body = typeBodies.join('\n\n');

        let output = '';
        if (imports.length > 0) {
            output += imports;
            output += '\n';
        }

        if (enums.length > 0) {
            output += enums;
            output += '\n';
        }

        output += body;

        return output;
    }

    writeTypeDetails = (typeDetails: TypeFieldDetails[], isHydrated: boolean, isObject: boolean): string => {
        return typeDetails.reduce((textArray, detail) => {
            if (detail.isInterface) textArray.push(`${detail.name}Mock.${isHydrated ? 'hydrated' : 'bare'}({}, [...stack, this._id])`);
            else if (detail.isEnumLiteral) textArray.push(`${detail.text}`);
            else if (detail.isLiteral) textArray.push(typeof detail.text === 'string' ? `'${detail.text}'` : `${detail.text}`);
            else if (detail.isTuple && detail.nestedTypeDetails?.length) textArray.push(this.generateValue(detail.nestedTypeDetails, isHydrated, true, false, false));
            else if (detail.isArray && detail.nestedTypeDetails?.length) textArray.push(this.generateValue(detail.nestedTypeDetails, isHydrated, false, true, false));
            else if (detail.isObject && detail.nestedTypeDetails?.length) textArray.push(`${detail.name}: ${this.generateValue(detail.nestedTypeDetails, isHydrated, false, false, true)}`);
            else if (isObject) textArray.push(`${detail.name}: ${this.writeTypeDetails([detail], isHydrated, detail.isObject)}`);
            else if (detail.text === 'number') textArray.push(`faker.number.int()`);
            else if (detail.text === 'string') textArray.push(`faker.string.alphanumeric()`);
            else if (detail.text === 'boolean') textArray.push(`faker.datatype.boolean()`);
            else if (detail.text === 'object') textArray.push(`{}`);
            else if (detail.text === 'bigint') textArray.push(`faker.number.bigInt()`);
            else if (detail.text === 'unknown') textArray.push(`{}`);
            else if (detail.text === 'undefined') textArray.push(`undefined`);
            else if (detail.text === 'null') textArray.push(`null`);
            else if (detail.text === 'void') textArray.push(`undefined`);
            else if (detail.text === 'never') textArray.push(`undefined`);
            else if (detail.text === 'symbol') textArray.push(`Symbol()`);
            else if (detail.text === 'any') textArray.push(`{}`);
            return textArray;
        }, [] as string[]).join(', ');
    }

    generateValue = (typeDetails: TypeFieldDetails[], isHydrated: boolean, isTuple: boolean, isArray: boolean, isObject: boolean): string => {
        let fieldText = '';

        if (isObject) {
            fieldText += '{';
        }
        else if (typeDetails.length > 1) {
            if (isTuple) {
                fieldText += '[';
            }
            else {
                fieldText += 'faker.helpers.arrayElement([';
            }
        }
        else if (isArray) {
            fieldText += 'Array.from({ length: 3 }, () => ';
        }

        fieldText += this.writeTypeDetails(typeDetails, isHydrated, isObject);

        if (isObject) {
            fieldText += '}';
        }
        else if (typeDetails.length > 1) {
            if (isTuple) {
                fieldText += ']';
            }
            else {
                fieldText += '])';
            }
        }
        else if (isArray) {
            fieldText += ')';
        }

        return fieldText;
    }

    generateImports = (field: TypeField, outline: TypesOutline, outputPath: string, writeLocation: string, importMap: Map<string, Set<string>>, enumMap: Map<string, string>): { importMap: Map<string, Set<string>>, enumMap: Map<string, string> } => {
        const typeDefinitionImport = new Set<string>();
        typeDefinitionImport.add(outline.name);
        const typeDefFilePath = path.relative(writeLocation, outline.file).replace(/\\/g, '/');
        importMap.set(typeDefFilePath, typeDefinitionImport);

        field.typeDetails.forEach(detail => {
            if (detail.isInterface) {
                if (detail.file && detail.name) {
                    let filePath = path.relative(writeLocation, detail.file).replace(/\\/g, '/');
                    if (!filePath.startsWith('.')) filePath = `./${filePath}`;
                    const imports = importMap.has(filePath) ? importMap.get(filePath)! : new Set<string>();
                    imports.add(`${detail.name}Mock`);
                    importMap.set(filePath, imports);
                }
            }
            else if (detail.isEnumLiteral) {
                if (detail.enumFile) {
                    let filePath = path.relative(writeLocation, detail.enumFile).replace(/\\/g, '/');
                    if (!filePath.startsWith('.')) filePath = `./${filePath}`;
                    const imports = importMap.has(filePath) ? importMap.get(filePath)! : new Set<string>();
                    imports.add(`${detail.name}`);
                    importMap.set(filePath, imports);
                }
                else {
                    enumMap.set(detail.name!, detail.enumDefinition!);
                }
            }
        });

        return { importMap, enumMap };
    };

    buildImportsFromMap = (importMap: Map<string, Set<string>>): string => {
        let imports = Array.from(importMap).reduce((imports, [file, values]) => {
            const fileName = file.replace(/.ts$/, '');
            const importValues = Array.from(values).join(', ');
            imports += `import { ${importValues} } from "${fileName}";\n`;
            return imports;
        }, '');
        imports += 'import { faker } from "@faker-js/faker";\n';
        return imports;
    }

    buildEnumsFromMap = (enumMap: Map<string, string>): string => {
        return Array.from(enumMap).map(([name, definition]) => {
            return definition;
        }).join('\n\n');
    }
}

// export class ParentMock {
//     constructor() { }
//     private static maxDepth = 3;

//     static hydrated = (overrides: Partial<Parent>, depth: number = 0): Parent => {
//         return {
//             id: 5,
//             name: 'parent',
//             child: depth < this.maxDepth ? childMock({}, depth + 1) : undefined,
//             ...overrides
//         }
//     }

//     // static hydratedArray(
//     //     factory: (index?: number) => Partial<Parent> = () => this.hydrated,
//     //     count: number = 3,
//     //     depth: number = 0
//     // ): Parent {
//     //     return faker.helpers.multiple(() => this.hydrated)
//     // }

//     static bare(overrides: Partial<Parent>, depth: number = 0): Parent {
//         return {
//             id: 5,
//             name: 'parent',
//             child: depth < this.maxDepth ? childMock({}, depth + 1) : undefined,
//             ...overrides
//         }
//     }
// }

// export const parentMock = (overrides: Partial<Parent>, depth: number = 0): Parent => ({
//     id: 5,
//     name: 'parent',
//     child: childMock(),
//     ...overrides
// })