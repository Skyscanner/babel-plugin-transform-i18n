const { transformSync } = require('@babel/core');

const consoleWarnSpy = jest
    .spyOn(global.console, 'warn')
    .mockImplementation(() => {});

const i18nPlugin = require('./index');

test('Should not have side effects', () => {
    const source = `var something = anotherFunction('foo');var hello = 'hello';`;

    const expected = `var something = anotherFunction('foo');\nvar hello = 'hello';`;

    const { code } = transformSync(source, {
        babelrc: false,
        plugins: [[i18nPlugin, {}]],
    });

    expect(code).toBe(expected);
});

test('Should replace with empty string when an empty string is provided as translation and not log by default', () => {
    const source = `t('key_hello', { name: 'Rob' });`;

    const expected = `"";`;

    const { code } = transformSync(source, {
        babelrc: false,
        plugins: [
            [
                i18nPlugin,
                {
                    dictionary: {
                        key_hello: '',
                    },
                },
            ],
        ],
    });

    expect(code).toBe(expected);
    expect(consoleWarnSpy).not.toBeCalled();
});

test('Should replace with empty string when an empty string is provided as translation and log when debug is true', () => {
    const source = `t('key_hello', { name: 'Rob' });`;

    const expected = `"";`;

    const { code } = transformSync(source, {
        babelrc: false,
        plugins: [
            [
                i18nPlugin,
                {
                    debug: true,
                    dictionary: {
                        key_hello: '',
                    },
                },
            ],
        ],
    });

    expect(code).toBe(expected);
    expect(consoleWarnSpy).toBeCalled();
});

test('Should replace the token', () => {
    const source = `t('key_hello', { name: 'Rob' });`;

    const expected = `"Hello, Rob!";`;

    const { code } = transformSync(source, {
        babelrc: false,
        plugins: [
            [
                i18nPlugin,
                {
                    dictionary: {
                        key_hello: 'Hello, {name}!',
                    },
                },
            ],
        ],
    });

    expect(code).toBe(expected);
});

test('Should use the dictionary', () => {
    const source = `t('key_hello');`;

    const expected = `"ciao";`;

    const { code } = transformSync(source, {
        babelrc: false,
        plugins: [
            [
                i18nPlugin,
                {
                    dictionary: {
                        key_hello: 'ciao',
                    },
                },
            ],
        ],
    });

    expect(code).toBe(expected);
});

test('Should use the the custom functionName', () => {
    const source = `translate('key_hello');`;

    const expected = `"ciao";`;

    const { code } = transformSync(source, {
        babelrc: false,
        plugins: [
            [
                i18nPlugin,
                {
                    dictionary: {
                        key_hello: 'ciao',
                    },
                    functionName: 'translate',
                },
            ],
        ],
    });

    expect(code).toBe(expected);
});

test('Should skip replacing a missing token', () => {
    const source = `t('key_hello', { name: 'Rob' });`;

    const expected = `"Hello, Rob {surname}!";`;

    const { code } = transformSync(source, {
        babelrc: false,
        plugins: [
            [
                i18nPlugin,
                {
                    dictionary: {
                        key_hello: 'Hello, {name} {surname}!',
                    },
                },
            ],
        ],
    });

    expect(code).toBe(expected);
});

test('Should replace the token using the custom pattern', () => {
    const source = `t('key_hello', { name: 'Rob' });`;

    const expected = `"Hello, Rob!";`;

    const { code } = transformSync(source, {
        babelrc: false,
        plugins: [
            [
                i18nPlugin,
                {
                    delimiter: '@@',
                    dictionary: {
                        key_hello: 'Hello, @@name@@!',
                    },
                },
            ],
        ],
    });

    expect(code).toBe(expected);
});

test('Should replace the token using the variable', () => {
    const source = `const name = 'Rob'; const str = t('key_hello', { name });`;

    const expected = `const name = 'Rob';\nconst str = "Hello, " + name + "!";`;

    const { code } = transformSync(source, {
        babelrc: false,
        plugins: [
            [
                i18nPlugin,
                {
                    delimiter: '@@',
                    dictionary: {
                        key_hello: 'Hello, @@name@@!',
                    },
                },
            ],
        ],
    });

    expect(code).toBe(expected);
});
