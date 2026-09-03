global.CastingItems = [
    'hexcasting:focus',
    'hexcasting:ancient_cypher',
    'hexcasting:cypher',
    'hexcasting:trinket',
    'hexcasting:artifact',
    //
    'hexgloop:gloopifact',
]

ItemEvents.modification(e => {
    for (let target of global.ReadonlyCastingItems) {
        if (Platform.isLoaded(target.split(':')[0]))
            e.modify(target, i => {
                i.maxStackSize = 64
            })
    }
})
