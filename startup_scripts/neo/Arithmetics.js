;(() => {
    let {
        Arithmetic,
        Operator,
        Operator: { Accepts },
    } = HexJS
    let { HexPattern } = HexJS.APIFlat

    // register arithmetic holder
    let arithPatterns = new Arithmetic('pattern_ops')

    // add operator
    arithPatterns.setOperator(
        'add',
        new Operator(2, Accepts.allOfType('pattern')).setApply((args, env, img, cont) => {
            let p1 = args.pattern(0),
                p2 = args.pattern(1)
            let sigs = p1.signature.toAnglesString() + p2.signature.toAnglesString()
            return [HexPattern.fromAngleString(sigs, p1.orientation, false)]
        }),
    )

    // mul operator, but bind reversed
    let mulOp = new Operator(2, Accepts.ofTypes('pattern', 'double'))
        .setApply((args, env, img, cont) => {
            let pattern = args.pattern(0)
            let mul = args.double(1)
            let sigs = pattern.signature.toAnglesString().repeat(mul)
            return [HexPattern.fromAngleString(sigs, pattern.orientation, false)]
        })
        // it's also ok to link an OperatorJS back to arithmetic
        .bindArithmetic(arithPatterns, Arithmetic.Companion.BUILTIN_OPERATIONS.mul)
})()
