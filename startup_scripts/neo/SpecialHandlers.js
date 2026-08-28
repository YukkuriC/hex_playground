;(() => {
    // with or without `JS` both are fine
    let { ActionJS, SpecialHandler } = HexJS

    let testSeqFetcher = new SpecialHandler('yc:test_special_0', (pat, env) => {
        let sig = pat.anglesSignature()
        // env.castingEntity.tell(`try match: ${sig}`)
        if (!sig.startsWith('deaqqdeaqq')) return // undefined & null: no match
        return SpecialHandler.create(
            new ActionJS((env, image, cont) => {
                let player = env.castingEntity
                player.tell(`matched: ${pat}, do further stuff here`)
            }),
            'test',
        )
    })
})()
