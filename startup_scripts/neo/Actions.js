;(() => {
    let { ActionJS, ActionRegistryJS } = HexJS

    let testNester = ActionRegistryJS.of(HexPattern.fromAnglesUnchecked('assed', 'EAST')).setOperate((env, img, cont) => {
        // env.castingEntity.tell(`${testNester}\n${env}\n${img}\n${cont}`)
        env.castingEntity.tell('hello hexjs')
        return [DoubleIota(114), [[[[[]]]]], DoubleIota(514)]
    })
})()
