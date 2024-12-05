ItemEvents.tooltip(reg => {
    for (let target_out of [
        //
        'hexcasting:cypher',
        'hexcasting:trinket',
        'hexcasting:artifact',
        'hexgloop:gloopifact',
    ]) {
        let target = target_out
        if (!Platform.isLoaded(target.split(':')[0])) continue
        reg.addAdvanced(
            target,
            /**@type {Internal.ItemTooltipEventJS$StaticTooltipHandlerFromJS['accept']}*/ (stack, _, tooltips) => {
                let list = stack.item.getHex(stack, null)
                if (!list || list.length <= 0) return
                let comp = Text.of('')
                for (let iota of list) comp.append(iota.display())
                tooltips.add(comp)
            },
        )
    }
})
