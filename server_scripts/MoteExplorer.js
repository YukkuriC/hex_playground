// requires: hexal

BlockEvents.rightClicked('hexal:mediafied_storage', e => {
    if (e.hand != 'MAIN_HAND') return
    let {
        player,
        level,
        server,
        block,
        block: { pos: pos },
    } = e
    let BE = level.getBlockEntity(pos)
    if (!BE) return

    let moteMap = BE.storedItems
    let moteList = moteMap.entrySet().toArray()
    let rows = Math.ceil(moteList.length / 9)

    let pickedItems = []

    player.openChestGUI('MOTE STORAGE', rows, gui => {
        moteList.forEach((entry, i) => {
            let { key, value } = entry
            let item = Item.of(value.item, value.count, value.tag)
            let picked = false
            try {
                gui.slot(i % 9, Math.floor(i / 9), slot => {
                    slot.item = item
                    slot.leftClicked = e => {
                        if (picked) return
                        pickedItems.push(item)
                        picked = true
                        slot.item = 'air'
                        moteMap.remove(key)
                    }
                })
            } catch (e) {}
        })
        gui.closed = () => {
            server.scheduleInTicks(5, () => {
                for (let i of pickedItems) block.popItem(i)
            })
        }
    })
})
