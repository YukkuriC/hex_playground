// requires: hexal

BlockEvents.rightClicked('hexal:mediafied_storage', e => {
    if (e.hand != 'MAIN_HAND') return
    let {
        player,
        level,
        server,
        block: { pos: pos },
    } = e
    let BE = level.getBlockEntity(pos)
    if (!BE) return

    let moteMap = BE.storedItems
    let moteList = moteMap.entrySet().toArray()
    let rows = Math.ceil(moteList.length / 9)

    player.openChestGUI('MOTE STORAGE', rows, gui => {
        moteList.forEach((entry, i) => {
            let { key, value } = entry
            let item = Item.of(value.item, value.count, value.tag)
            gui.slot(i % 9, Math.floor(i / 9), slot => {
                slot.item = item
                slot.leftClicked = e => {
                    // TODO
                }
            })
        })
        gui.closed = () => {
            // TODO
        }
    })
})
