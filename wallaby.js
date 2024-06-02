module.exports = function (wallaby) {
    return {
        files: [
            'src/**/*.ts',
            'generated/**/*.ts',
            'spec/types/**/*.ts'
        ],
        tests: [
            'spec/**/*spec.ts'
        ],
        env: {
            type: 'node'
        },
        testFramework: 'jasmine',
    };
};
