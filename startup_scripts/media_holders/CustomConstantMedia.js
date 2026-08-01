if (this.HexCapabilities) {
    let mediaMap = {
        'minecraft:enchanted_golden_apple': 1145140000,
        'ars_nouveau:source_gem': 20000,
    }

    for (let [id, amount] of Object.entries(mediaMap)) {
        global.registerMediaCap(id, (stack, ctx) => new CapStaticMediaHolder(amount, 1000, stack))
    }
}
