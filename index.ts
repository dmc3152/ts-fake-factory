import { generateTypes } from "./src/generateTypes";

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