// requires: mekanism
{
    // https://github1s.com/FallingColors/HexMod/blob/main/Common/src/main/java/at/petrak/hexcasting/common/items/magic/ItemMediaHolder.java
    ItemEvents.tooltip(reg => {
        for (let part of ['helmet', 'bodyarmor', 'pants', 'boots'])
            reg.addAdvanced(`mekanism:mekasuit_${part}`, (stack, advanced, lines) => {
                try {
                    let holder = IXplatAbstractions.INSTANCE.findMediaHolder(stack)
                    if (!holder) return
                    let maxMedia = holder.getMaxMedia()
                    let media = holder.getMedia()
                    let ratio = Math.round((media / maxMedia) * 100)
                    maxMedia = Math.round(maxMedia / 1000) / 10
                    media = Math.round(media / 1000) / 10
                    lines.add(
                        Text.translate(
                            'hexcasting.tooltip.media_amount.advanced',
                            Text.darkPurple(media),
                            Text.darkPurple(maxMedia),
                            Text.of(ratio + '%'),
                        ),
                    )
                } catch (e) {
                    lines.add(Text.of(e))
                }
            })
    })
}
