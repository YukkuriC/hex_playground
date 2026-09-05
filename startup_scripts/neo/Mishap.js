;(() => {
    let {
        ActionRegistry,
        MishapJS,
        APIFlat: { HexPattern },
    } = HexJS

    // declaring a mishap type with custom message & execution logic, everything else default
    let MishapSus = MishapJS.type()
        .setConstErrorMessage(Text.red('SUS'))
        .setExecute((mishap, env, ctx, stack) => {
            env.castingEntity.kill()
        })
    this.MishapSus = MishapSus

    // a familiar action throwing this new mishap
    let actionSus = ActionRegistry.of(HexPattern.fromAnglesUnchecked('dewdeqwwedaqedwadweqewwd', 'west'), 'yc:sus', true).setOperate(() =>
        MishapSus.create(),
    )
})()
