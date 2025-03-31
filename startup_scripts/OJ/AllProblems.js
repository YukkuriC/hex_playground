// priority: -114514

new Problem(0)
new Problem(1, { caseCount: 3 })
new Problem(2, {
    onSubmit(stack) {
        this.tryCompare(new Args(stack, 1).entity(0), this.env.caster)
    },
})

// simple case gen
Problem.expectNumber(3, {
    caseCount: 5,
    genAnswer(stack) {
        stack.push(DoubleIota(this.caseIdx))
        return this.caseIdx * 2
    },
})
Problem.expectNumber(4, {
    caseCount: 5,
    genAnswer(stack) {
        let a = 3 * (this.caseIdx + 1)
        let b = 1 + Math.floor(Math.random() * 100)
        stack.push(DoubleIota(a))
        stack.push(DoubleIota(b))
        return a + b
    },
})
