global.patternWrapMap = {
    noCost: base => (c, s, r, ct) => {
        let res = base.operate(c, s, r, ct)
        let newEffects = []
        let hasCost = false
        for (let e of res.sideEffects) {
            if (e.amount > 0) {
                hasCost = true
            } else newEffects.push(e)
        }
        if (hasCost) DecoHelpers.OverrideEffects(res, newEffects)
        return res
    },
    wrapTryMishap: base => (c, s, r, ct) => {
        try {
            return base.operate(c, s, r, ct) || OperationResult(c, s, r, [])
        } catch (e) {
            // TODO JavaException fuck
            global.test = e
            if (e instanceof Mishap)
                return OperationResult(c, s, r, [OperatorSideEffect.DoMishap(e, Mishap.Context(HexPattern(HexDir.WEST, []), null))])
            throw e
        }
    },
}
