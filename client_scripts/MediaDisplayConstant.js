{
    let minimalDisplay = val => {
        let res = String(val)
        res = res.replace(/\.0+$/, '')
        return Text.translate('hexcasting.tooltip.media', res).darkPurple()
    }

    ItemEvents.tooltip(reg => {
        // for replacement of hexgloop
        // https://github.com/SamsTheNerd/HexGloop/blob/main/common/src/main/java/com/samsthenerd/hexgloop/mixins/misc/MixinShowMediaWorth.java
        reg.addAdvancedToAll((stack, advanced, lines) => {
            let holder = IXplatAbstractions.INSTANCE.findMediaHolder(stack)
            if (!holder || !holder.canConstructBattery()) return
            let media = holder.media / 10000
            lines.add(Text.of('Total: ').append(minimalDisplay(media)))
            if (stack.count > 1) {
                lines.add(Text.of('Single: ').append(minimalDisplay(media / stack.count)))
            }
        })
    })
}
