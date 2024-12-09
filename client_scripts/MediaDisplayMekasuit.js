// requires: mekanism
{
    // https://github1s.com/FallingColors/HexMod/blob/main/Common/src/main/java/at/petrak/hexcasting/common/items/magic/ItemMediaHolder.java
    ItemEvents.tooltip(reg => {
        for (let part of ['helmet', 'bodyarmor', 'pants', 'boots'])
            reg.addAdvanced(`mekanism:mekasuit_${part}`, (stack, advanced, lines) => {
                try {
                    let holder = IXplatAbstractions.INSTANCE.findMediaHolder(stack)
                    if (!holder) return
                    let maxMedia = Math.round(holder.getMaxMedia() / 10000)
                    let media = Math.round(holder.getMedia() / 10000)
                    let ratio = media / maxMedia
                    lines.add(
                        Text.translate(
                            'hexcasting.tooltip.media_amount.advanced',
                            Text.darkPurple(media),
                            Text.darkPurple(maxMedia),
                            Text.of(Math.round(ratio * 100) + '%'),
                        ),
                    )
                } catch (e) {
                    lines.add(Text.of(e))
                }
            })
    })
}
