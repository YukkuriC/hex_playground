// priority:10
if (HexCapabilities) {
    let CapMedia = HexCapabilities.MEDIA
    let provideMediaCap = (stack, supplierGen) => {
        let supplier = supplierGen(stack)
        return {
            getCapability(cap, side) {
                if (stack.isEmpty() || cap !== CapMedia) return LazyOptional.empty()
                return LazyOptional.of(supplier)
            },
        }
    }

    let capPool = []
    global.registerMediaCap = (id, predicate, supplierGen) => {
        capPool.push([id, predicate, supplierGen])
    }

    ForgeEvents.onGenericEvent('net.minecraftforge.event.AttachCapabilitiesEvent', 'net.minecraft.world.item.ItemStack', e => {
        let stack = e.getObject()
        for (let entry of capPool) {
            try {
                let [id, predicate, supplierGen] = entry
                if (!predicate(stack)) continue
                e.addCapability(id, provideMediaCap(stack, supplierGen))
            } catch (e) {
                console.error(e)
            }
        }
    })
}
