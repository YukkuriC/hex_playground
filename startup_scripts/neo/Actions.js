;(() => {
    let { ActionJS, ActionRegistryJS } = HexJS

    let testNester = ActionRegistryJS.of(HexPattern.fromAnglesUnchecked('assed', 'EAST')).setOperate((env, img, cont) => {
        let player = env.castingEntity
        return [114, [null, [player, [player.position(), [cont, [testNester.prototype, [true]]]]]]]
    })
})()
