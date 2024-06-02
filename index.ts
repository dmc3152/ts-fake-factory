import path from "path";
import { FactoryWriter } from "./src/factoryWriter";
import { TypeParser } from "./src/typeParser";

// const generatedTypes = generateTypes("src/*.ts");
const typeParser = new TypeParser();
const generatedTypes = typeParser.generateTypes("spec/types/*");
// const generatedTypes = typeParser.generateTypes("spec/types/primitivesInterface.ts");
// generatedTypes.forEach(value => {
//     console.log(value.fields);
// });

const factoryWriter = new FactoryWriter();
factoryWriter.writeTypeMapFactory(generatedTypes, path.join(__dirname, 'generated'));

// printMap(typeMap);


/*
- I need to identify types by files so that I can differentiate between multiple types with the same name
- Use a Map to store the types that are already created so that they are only created once
- I need to determine a strategy for circular dependencies




*/