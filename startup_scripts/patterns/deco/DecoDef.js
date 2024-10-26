global.patternWrapMap = {
    noCost: base => (c, s, r, ct) => {
        let res = base.operate(c, s, r, ct)
        let newEffects = []
        let hasCost = false
        for (let e of res.sideEffects) {
            if (e instanceof OperatorSideEffect.ConsumeMedia) {
                hasCost = true
            } else newEffects.push(e)
        }
        if (hasCost) DecoHelpers.OverrideEffects(res, newEffects)
        return res
    },
    wrapTryMishap: base => (c, s, r, ct) => ActionJS.TryOperate(c, s, r, ct, base.operate),
}
