{
    let minimalDisplay = val => {
        let res = String(val)
        res = res.replace(/\.0+$/, '')
        return Text.translate('hexcasting.tooltip.media', res).color(ItemMediaHolder.HEX_COLOR)
    }

    NativeEvents.onEvent('net.neoforged.neoforge.event.entity.player.ItemTooltipEvent', e => {
        let stack = e.itemStack
        let lines = e.toolTip
        let holder = IXplatAbstractions.INSTANCE.findMediaHolder(stack)
        if (!holder || !holder.canConstructBattery()) return
        let media = holder.media / 10000
        lines.add(Text.of('Total: ').append(minimalDisplay(media)))
        if (stack.count > 1) {
            lines.add(Text.of('Single: ').append(minimalDisplay(media / stack.count)))
        }
    })
}
