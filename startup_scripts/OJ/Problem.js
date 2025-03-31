let Problem = function (id, cfg) {
    this.id = id
    this.cfg = cfg
    Problem.pool[id] = this
}
Problem.prototype = {
    createContext(env, img) {
        return new ProblemContext(this.id, this.cfg)
    },
}
Problem.pool = {}
