const HEX_API = Java.loadClass('at.petrak.hexcasting.xplat.IXplatAbstractions')

ServerEvents.recipes(e => {
    // helpers
    function convertDataToList(nbt) {
        if (!nbt.data) nbt.data = {}
        if (nbt.data['hexcasting:type'] != 'hexcasting:list') {
            if (nbt.data['hexcasting:type']) {
                let oldData = Object.assign({}, nbt.data)
                nbt.data['hexcasting:data'] = [oldData]
            } else nbt.data['hexcasting:data'] = []
            nbt.data['hexcasting:type'] = 'hexcasting:list'
        }
    }

    // append focus patterns
    e.shapeless('hexcasting:focus', ['hexcasting:focus']).modifyResult((grid, item) => {
        let { player, width, height } = grid

        let src_item,
            total = width * height
        for (let i = 0; i < total; i++) {
            src_item = grid.get(i)
            if (src_item.id == 'hexcasting:focus') break
        }

        item.nbt = src_item.nbt
        if (player) {
            let offItem = player.offHandItem
            if (offItem.nbt?.data && offItem.nbt.data['hexcasting:type']) {
                if (offItem.nbt.data['hexcasting:type'] == 'hexcasting:list') {
                    convertDataToList(item.nbt)
                    for (let obj of offItem.nbt.data['hexcasting:data']) item.nbt.data['hexcasting:data'].push(obj)
                } else {
                    convertDataToList(item.nbt)
                    item.nbt.data['hexcasting:data'].push(offItem.nbt.data['hexcasting:data'])
                }
            } else if (offItem.nbt?.patterns?.length > 0) {
                convertDataToList(item.nbt)
                for (let obj of offItem.nbt.patterns) item.nbt.data['hexcasting:data'].push(obj)
            } else {
                convertDataToList(item.nbt)
                for (let obj of HEX_API.INSTANCE.getPatternsSavedInUi(player).map(x => x.serializeToNBT()))
                    item.nbt.data['hexcasting:data'].push({
                        'hexcasting:type': 'hexcasting:pattern',
                        'hexcasting:data': obj.Pattern,
                    })
            }
        }

        return item
    })
    // pair-clear items with content
    for (let target_out of [
        //
        'hexcasting:focus',
        'hexcasting:cypher',
        'hexcasting:trinket',
        'hexcasting:artifact',
        'hexgloop:gloopifact',
    ]) {
        let target = target_out
        if (!Platform.isLoaded(target.split(':')[0])) continue
        e.shapeless(Item.of(target, 2), [target, target])

        if (target === 'hexcasting:focus') continue
        // auto inject focus to pattern
        e.shapeless(target, [target, 'hexcasting:focus'])
            .modifyResult((grid, item) => {
                let { width, height } = grid

                let focus,
                    original,
                    total = width * height
                for (let i = 0; i < total; i++) {
                    let ii = grid.get(i)
                    if (ii.id == 'hexcasting:focus') focus = ii
                    else if (ii.id == target) original = ii
                }

                item.orCreateTag.merge(original.orCreateTag)
                convertDataToList(focus.orCreateTag)

                item.nbt.patterns = focus.nbt.data['hexcasting:data']
                if ((item.nbt['hexcasting:start_media'] || 0) <= 0) {
                    item.nbt.putLong('hexcasting:start_media', 64e5)
                }

                return item
            })
            .keepIngredient('hexcasting:focus')
    }
})
