{
    let regularPatternLookup = global.getField(PatternRegistry, 'regularPatternLookup', 1)
    let perWorldPatternLookup = global.getField(PatternRegistry, 'perWorldPatternLookup', 1)
    global.doPatternDeco = () => {
        // private record RegularEntry(HexDir preferredStart, ResourceLocation opId) {
        // private record PerWorldEntry(HexPattern prototype, ResourceLocation opId) {

        // build regular reverse map
        let patternById = {}
        let isGreatById = {}
        for (let kv of regularPatternLookup.entrySet()) {
            let sig = kv.getKey()
            let entry = kv.getValue()
            try {
                let pattern = HexPattern.fromAngles(sig, entry.preferredStart())
                patternById[entry.opId()] = pattern
            } catch (e) {
                continue
            }
        }
        for (let kv of perWorldPatternLookup.entrySet()) {
            let opId = kv.getKey()
            let entry = kv.getValue()
            patternById[opId] = entry.prototype()
            isGreatById[opId] = 1
        }

        // modified ids
        let modifiedIds = {}
        let tmpActionLookup = {}
        let allIds = []

        for (let kv of ActionJS.actionLookup.entrySet()) {
            let opId = kv.getKey()
            if (opId.namespace.startsWith('yc')) continue
            let action = kv.getValue()
            if (!opId || !patternById[opId]) continue
            allIds.push(opId)
            tmpActionLookup[opId] = ExtractBaseAction(action)
        }
        global.test1 = tmpActionLookup
        global.test2 = patternById

        let doWrap = (opId, decoId) => {
            let action = tmpActionLookup[opId]
            tmpActionLookup[opId] = new ActionWrap(action, decoId)
            modifiedIds[opId] = 1
        }

        // add try-catch for all
        for (let id of allIds) {
            doWrap(id, 'wrapTryMishap')
        }

        // test: all native no cost
        for (let id of allIds) {
            doWrap(id, 'noCost')
        }

        // write back
        for (let id of allIds) {
            if (!modifiedIds[id]) continue
            let pattern = patternById[id]
            let action = tmpActionLookup[id]
            ActionJS.OverrideRegister(id, pattern, action, isGreatById[id])
        }
    }
    StartupEvents.postInit(global.doPatternDeco)
}
