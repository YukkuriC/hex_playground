let ProblemUtils = {
    toJsKeys: ['entity', 'pattern'],
    toJs(iota) {
        if (iota.list) return iota.list.map(sub => ProblemUtils.toJs(sub))
        if (iota.double) return Number(iota.double)
        if (iota.boolean) return !!iota.boolean
        for (let key of ProblemUtils.toJsKeys) if (iota[key]) return iota[key] 
        return null
    },
}
