This is a project for generating factories for types and interfacses to be used in unit tests in TypeScript projects. It relies heavily on ts-morph for extracting type information.

# Motivation
This project is inspired by ts-auto-mock. It is a tool that uses transformers to generate instances of types, classes, and interfaces at runtime. However, there authors of that package have discontinued further development as transformers are not a priority of the team that manages TypeScript. I have used ts-auto-mock for a few years and while it works quite well, I think there are some benefits to having a tool generate the factories instead of using transformers at runtime. One of those benefits is performance. Using transformers requires evalutating types and building instances at runtime on every single run. Using generated code removes the need for the evaluation at runtime which causes the code to run faster. This is particularly important in projects with large amounts of tests. Another benefit of using generated code is that the logic in the factories can be inspected and even changed if necessary. A downside of using generated code is that it requires an extra step when building the code any time a type is changed.

# Notes
I am just getting started on it so it doesn't do anything yet.
