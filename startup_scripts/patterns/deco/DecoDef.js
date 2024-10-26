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
    wrapTryMishap: base => {
        let wrappedCall = (c, s, r, ct) => {
            // 爆了，无论什么姿势都会异常
            return base.operate(c, s, r, ct)
        }
        return (c, s, r, ct) => ActionJS.TryOperate(c, s, r, ct, wrappedCall)
    },
}
