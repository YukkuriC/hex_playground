ServerEvents.recipes(e => {
    let Registry = Java.loadClass('net.minecraft.core.Registry')
    let BuiltInRegistries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    let Registries = Java.loadClass('net.minecraft.core.registries.Registries')
    let ResourceKey = Java.loadClass('net.minecraft.resources.ResourceKey')

    let POI = BuiltInRegistries.POINT_OF_INTEREST_TYPE
    let POIKey = Registries.POINT_OF_INTEREST_TYPE
    let scroll = Item.of('hexcasting:scroll', '{op_id:"hexcasting:brainsweep"}').weakNBT()

    let costSteps = [
        ['hexcasting:quenched_allay', 120],
        ['hexcasting:quenched_allay_shard', 30],
        ['hexcasting:charged_amethyst', 10],
        // ['amethyst_shard', 5],
        // ['hexcasting:amethyst_dust', 1],
    ]

    e.forEachRecipe({ type: 'hexcasting:brainsweep' }, r => {
        let raw = r.json
        let entityRaw = raw.get('entityIn')
        let profession = entityRaw.get('profession')
        let blockProfMarker
        if (profession) {
            profession = profession.getAsString()
            let poi = POI.getOrThrow(ResourceKey.create(POIKey, profession))
            blockProfMarker = poi.matchingStates().iterator().next().block.id
        } else {
            if (entityRaw.get('type').asString == 'villager') blockProfMarker = 'hay_block'
            // TODO entities other than allay
            else blockProfMarker = 'jukebox'
        }
        let blockIn = raw.get('blockIn').get('block').asString
        let blockOut = raw.get('result').get('name').asString

        // output
        let ingredients = [blockIn, blockProfMarker, 'soul_sand', scroll]
        let cost = raw.get('cost').asDouble / 10000
        for (let [item, value] of costSteps) {
            while (cost >= value) {
                ingredients.push(item)
                cost -= value
            }
        }
        e.shapeless(blockOut, ingredients).keepIngredient([blockProfMarker, scroll])
    })
})
