if (this.HexCapabilities) {
    let mediaMap = {
        'minecraft:enchanted_golden_apple': Long('1145140000'),
        'ars_nouveau:source_gem': Long('20000'),
    }

    for (let [id, amount] of Object.entries(mediaMap)) {
        let kjsClosureIsShit = amount
        global.registerMediaCap(id, (stack, ctx) => new CapStaticMediaHolder(() => kjsClosureIsShit, 1000, stack))
    }
}
