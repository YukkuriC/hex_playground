{
    let IDStaticCap = new ResourceLocation('hexcasting', 'media_item')
    let CapMedia = HexCapabilities.MEDIA

    let provide = function (stack, value, priority) {
        value = Integer(String(value))
        priority = priority || 1000
        let supplier = () => new CapStaticMediaHolder(() => value, priority, stack)
        return {
            getCapability(cap, side) {
                if (stack.isEmpty() || cap !== CapMedia) return LazyOptional.empty()
                return LazyOptional.of(supplier)
            },
        }
    }

    let mediaMap = {
        'minecraft:enchanted_golden_apple': 1145140000,
        'ars_nouveau:source_gem': 20000,
    }

    ForgeEvents.onGenericEvent('net.minecraftforge.event.AttachCapabilitiesEvent', 'net.minecraft.world.item.ItemStack', e => {
        let stack = e.getObject()
        if (stack.id in mediaMap) e.addCapability(IDStaticCap, provide(stack, mediaMap[stack.id]))
    })
}
