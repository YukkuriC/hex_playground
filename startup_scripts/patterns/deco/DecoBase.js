// wrappers
function ActionWrap(base, decoId) {
    this.operate = global.patternWrapMap[decoId](base)
    this.base = base
    for (let key of ['isGreat', 'getDisplayName', 'displayName', 'alwaysProcessGreatSpell', 'causesBlindDiversion'])
        ActionWrap.BindFunc(this, base, key)
}
ActionWrap.BindFunc = (action, base, key) => {
    let val
    try {
        val = base[key]()
    } catch (e) {
        val = base[key]
    }
    action[key] = () => val
}
function ExtractBaseAction(action) {
    // TODO unwrap proxy
    while (1) {
        if (!action.base) return action
        action = action.base
    }
}
function HasWrap(action) {
    return !!action.base
}

// helpers
const DecoHelpers = {
    // reflection
    OverrideStack(result, stack) {
        if (!this.f_result_stack) {
            this.f_result_stack = global.getDeclaredField(result, 'newStack')
        }
        this.f_result_stack.set(result, stack)
    },
    OverrideEffects(result, effects) {
        if (!this.f_result_effects) {
            this.f_result_effects = global.getDeclaredField(result, 'sideEffects')
        }
        this.f_result_effects.set(result, effects)
    },
}
