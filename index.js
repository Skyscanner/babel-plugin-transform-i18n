module.exports = function i18nPlugin({ types: t }) {
    function getNodeForValue(
        value,
        tokens,
        leftDelimiter = '{',
        rightDelimiter = '}',
    ) {
        if (
            value.match(new RegExp(`^${leftDelimiter}.*?${rightDelimiter}$`)) &&
            tokens[value]
        ) {
            return tokens[value];
        }

        return t.stringLiteral(value);
    }

    return {
        visitor: {
            CallExpression(path, state) {
                const { delimiter } = state.opts;
                const leftDelimiter =
                    delimiter || state.opts.leftDelimiter || '{';
                const rightDelimiter =
                    delimiter || state.opts.rightDelimiter || '}';
                const pattern = new RegExp(
                    `(${leftDelimiter}.*?${rightDelimiter})`,
                    'g',
                );
                const translationFunctionName = state.opts.functionName || 't';
                const dictionary = state.opts.dictionary || {};

                if (
                    t.isIdentifier(path.node.callee) &&
                    path.node.callee.name === translationFunctionName
                ) {
                    const firstArgument = path.node.arguments[0];
                    if (!firstArgument || !firstArgument.extra) {
                        return;
                    }

                    let string = firstArgument.extra.rawValue;

                    if (dictionary[string]) {
                        string = dictionary[string];
                    }

                    if (
                        path.node.arguments.length > 1 &&
                        t.isObjectExpression(path.node.arguments[1])
                    ) {
                        const tokens = path.node.arguments[1].properties.reduce(
                            (previous, current) => ({
                                ...previous,
                                [`${leftDelimiter}${current.key.name}${rightDelimiter}`]: current.value,
                            }),
                            {},
                        );

                        const replacementNode = string
                            .split(pattern)
                            .filter(component => component !== '')
                            .reduce((previous, current, i) => {
                                let previousNode = previous;

                                if (i === 1) {
                                    previousNode = getNodeForValue(
                                        previous,
                                        tokens,
                                        leftDelimiter,
                                        rightDelimiter,
                                    );
                                }

                                const currentNode = getNodeForValue(
                                    current,
                                    tokens,
                                    leftDelimiter,
                                    rightDelimiter,
                                );

                                if (t.isStringLiteral(currentNode)) {
                                    // If the previous node is a StringLiteral, return a combined StringLiteral
                                    if (t.isStringLiteral(previousNode)) {
                                        return t.stringLiteral(
                                            `${previousNode.value}${currentNode.value}`,
                                        );
                                    }

                                    // If the previous node is a BinaryExpression with a StringLiteral on the right side,
                                    // update the BinaryExpression to have a combined StringLiteral on the right
                                    if (
                                        t.isBinaryExpression(previousNode) &&
                                        t.isStringLiteral(previous.right)
                                    ) {
                                        previousNode.right = t.stringLiteral(
                                            `${previousNode.right.value}${currentNode.value}`,
                                        );
                                        return previousNode;
                                    }
                                }

                                return t.binaryExpression(
                                    '+',
                                    previousNode,
                                    currentNode,
                                );
                            });

                        path.replaceWith(replacementNode);
                        return;
                    }

                    path.replaceWith(t.stringLiteral(string));
                }
            },
        },
    };
};
