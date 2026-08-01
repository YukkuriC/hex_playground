// priority:10
if (this.HexCapabilities) {
    let CapMedia = HexCapabilities.Item.MEDIA
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
    global.registerMediaCap = (id, supplier) => {
        capPool.push([id, supplier])
    }

    NativeEvents.onEvent(Java.loadClass('net.neoforged.neoforge.capabilities.RegisterCapabilitiesEvent'), e => {
        for (let entry of capPool) {
            try {
                let [id, supplier] = entry
                e.registerItem(CapMedia, supplier, Item.getItem(id))
            } catch (e) {
                console.error(e)
            }
        }
    })
}
