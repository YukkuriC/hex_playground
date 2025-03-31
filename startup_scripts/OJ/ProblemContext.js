let ProblemContext = function (id, cfg) {
    this.id = id
    this.caseIdx = 0
    this.caseCount = 1 // default
    Object.assign(this, cfg)
}
ProblemContext.prototype = {
    tryCall(funcName) {
        let func = this[funcName]
        if (!func) return
        func.apply(this, Array.from(arguments).slice(1))
    },
    wrongAnswer(input, got, expected) {
        let ret = [Text.translate('oj.wrong_answer').string]
        if (input !== undefined) ret.push(Text.translate('oj.wrong_answer.input', input).string)
        if (got !== undefined) ret.push(Text.translate('oj.wrong_answer.got', got).string)
        if (expected !== undefined) ret.push(Text.translate('oj.wrong_answer.expected', expected).string)
        throw ret.join('\n')
    },
    start(stack, env, img) {
        this.tryCall('onStart', stack, env, img)
        env.caster.tell(Text.translate('oj.problem_start', this.id).yellow())
    },
    fetch(stack, env, img) {
        env.caster.tell(Text.translate('oj.case_input', this.id).yellow())
        this.tryCall('onFetch', this, stack, env, img)
    },
    submit(stack, env, img) {
        this.tryCall('onSubmit', this, stack, env, img)
        env.caster.tell(Text.translate('oj.case_clear', this.caseIdx).green())
        this.caseIdx++
        if (this.caseIdx >= this.caseCount) {
            env.caster.tell(Text.translate('oj.problem_clear', this.id).green())
            env.caster.stages.add(`oj_${this.id}`)
        }
    },
}
ProblemContext.pool = {}
ProblemContext.get = player => {
    let key = player.stringUuid
    return ProblemContext.pool[key]
}
ProblemContext.set = (player, newCtx) => {
    let key = player.stringUuid
    ProblemContext.pool[key] = newCtx
}
ProblemContext.remove = player => {
    let key = player.stringUuid
    delete ProblemContext.pool[key]
}

global.ProblemContext = ProblemContext
