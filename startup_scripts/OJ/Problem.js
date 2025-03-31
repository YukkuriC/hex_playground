let Problem = function (id, cfg) {
    this.id = id
    this.cfg = cfg
    Problem.pool[id] = this
}
Problem.prototype = {
    createContext(env, img) {
        return new ProblemContext(this.id, this.cfg).bindEnv(env, img)
    },
}
Problem.pool = {}

Problem.expectNumber = (id, cfg) => {
    Object.assign(cfg, {
        onStart() {
            this.answers = []
        },
        onFetch(stack) {
            this.answers[this.caseIdx] = this.genAnswer(stack)
        },
        onSubmit(stack) {
            this.tryCompare(new Args(stack, 1).double(0), this.answers[this.caseIdx])
        },
    })
    return new Problem(id, cfg)
}
