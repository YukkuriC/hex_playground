{
    let IDStaticCap = new ResourceLocation('hexcasting', 'media_item')
    let mediaMap = {
        'minecraft:enchanted_golden_apple': 1145140000,
        'ars_nouveau:source_gem': 20000,
    }

    global.registerMediaCap(
        IDStaticCap,
        stack => stack.id in mediaMap,
        stack => {
            let value = Long(String(mediaMap[stack.id]))
            return () => new CapStaticMediaHolder(() => value, 1000, stack)
        },
    )
}
