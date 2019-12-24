A [Babel](https://babeljs.io) transform plugin to replace strings with their translations.

## Example

**.babelrc**

```json
{
    "plugins": [
        ["skyscanner-i18n", {
            "dictionary": {
                "Hello": "Bonjour",
                "Hello, {name}!": "Bonjour, {name}!"
            }
        }]
    ]
}
```

**In**

```js
const name = 'Brad';
const hello = t('Hello');
const helloWithName = t('Hello, {name}!', {
    name
})
```

**Out**

```js
const name = 'Brad';
const hello = 'Bonjour';
const helloWithName = 'Bonjour, ' + name + '!';
```

## Installation

```bash
npm i -D babel-plugin-skyscanner-i18n
```

## Usage

### Via `.babelrc`

```json
{
    "plugins": [
        ["skyscanner-i18n", {
            "functionName": "t",
            "dictionary": {}
        }]
    ]
}
```

### Via Node API

```js
require('babel-core').transform('code', {
    plugins: [
        ['skyscanner-i18n', {
            functionName: 't',
            dictionary: {}
        }]
    ]
});
```

## Options

There are two options available, both are optional:

### `dictionary`

A mapping of the strings passed to the translation function to their translated versions. If no dictionary is passed, calls to the translation function will be replaced with the original string.

### `functionName`

The name of the function that wraps the strings. Defaults to `t`.

### `leftDelimiter`, `rightDelimiter`

The delimiter to be used for templating. Defaults to `{` `}`.

### `delimiter`

Shorthand for when both `leftDelimiter` and `rightDelimiter` are the same. Example: `@@`