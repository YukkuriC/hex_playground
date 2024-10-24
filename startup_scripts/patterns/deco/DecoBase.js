// wrappers
function WrapAction(base, id) {
    function ActionWrap() {
        this.operate = global.patternWrapMap[id](base)
        this.base = base
    }
    let wrapped = new ActionWrap()
    ActionWrap.prototype = base
    return wrapped
}
function ExtractBaseAction(action) {
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
