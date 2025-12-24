function ActionOJ(id, pattern) {
    this.operate = (env, img, cont) => {
        if (!env.caster) return
        let stack = img.stack
        if (stack.toArray) stack = Array.from(stack.toArray())
        try {
            let sideEffects = global.ActionOJMap[id](stack, env, img) || []
            let newImg = img.copy(stack, img.parenCount, img.parenthesized, img.escapeNext, img.opsConsumed + 1, img.userData)
            return OperationResult(newImg, sideEffects, cont, HexEvalSounds.NORMAL_EXECUTE)
        } catch (e) {
            let sideEffects = []
            if (e instanceof Mishap) {
                let mishapName = Text.translate(`hexcasting.action.yc:oj/${id}`).aqua()
                let mishapEffect = OperatorSideEffect.DoMishap(e, Mishap.Context(pattern, mishapName))
                mishapEffect.performEffect(CastingVM(img, env))
                sideEffects.push(mishapEffect)
            } else if (typeof e === 'string') {
                // OJ error
                env.caster.tell(Text.red(e))
            } else throw e
            // manual stop
            let newImg = img.copy(stack, img.parenCount, img.parenthesized, img.escapeNext, 0, img.userData)
            while (cont.next) cont = cont.next // stop anyway
            return OperationResult(newImg, sideEffects, cont, HexEvalSounds.MISHAP)
        }
    }
}
ActionOJ.outOfProblem = () => {
    throw ActionOJ.doTranslate('oj.problem_miss')
}
ActionOJ.pushNull = s => s.push(NullIota())
ActionOJ.genAction = (onExist, onMiss) => {
    onMiss = onMiss || ActionOJ.outOfProblem
    return (stack, env, img) => {
        let ctx = ProblemContext.get(env.caster)
        if (ctx) onExist(ctx, stack, env, img)
        else {
            onMiss(stack, env, img)
            return
        }
    }
}
ActionOJ.genGetCtx = field => (ctx, stack) => stack.push(DoubleIota(ctx[field]))
ActionOJ.doTranslate = function () {
    return String(Text.translate.apply(null, arguments).string)
}

global.ActionOJMap = {
    start(stack, env, img) {
        let id = new Args(stack, 1).double(0)
        let problem = Problem.pool[id]
        if (!problem) throw ActionOJ.doTranslate('oj.problem_invalid', id)
        ProblemContext.set(env.caster, problem.createContext(env, img).start(stack, env, img))
    },
    fetch: ActionOJ.genAction((ctx, stack, env, img) => ctx.fetch(stack, env, img)),
    submit: ActionOJ.genAction((ctx, stack, env, img) => ctx.submit(stack, env, img)),
    get_id: ActionOJ.genAction(ActionOJ.genGetCtx('id'), s => s.push(NullIota())),
    get_case: ActionOJ.genAction(ActionOJ.genGetCtx('caseIdx')),
    get_max_case: ActionOJ.genAction(ActionOJ.genGetCtx('caseCount')),
}

StartupEvents.registry('hexcasting:action', e => {
    function registerPatternWrap(seq, dir, id) {
        if (!id in global.ActionOJMap) throw new Error('missing operate: ' + id)
        let resourceKey = 'yc:oj/' + id
        let pattern = HexPattern.fromAngles(seq, dir)
        e.custom(resourceKey, ActionRegistryEntry(pattern, new ActionOJ(id, pattern, options)))
    }

    registerPatternWrap('dwddw', HexDir.EAST, 'start')
    registerPatternWrap('dwddwda', HexDir.EAST, 'fetch')
    registerPatternWrap('dwddwwaawa', HexDir.EAST, 'submit')
    registerPatternWrap('dwddweaqa', HexDir.EAST, 'get_id')
    registerPatternWrap('dwddweaqaa', HexDir.EAST, 'get_case')
    registerPatternWrap('dwddweaqaaqde', HexDir.EAST, 'get_max_case')
})
