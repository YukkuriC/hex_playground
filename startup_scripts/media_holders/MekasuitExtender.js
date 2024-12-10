// requires: mekanism
{
    let IDMekasuitCap = new ResourceLocation('yc', 'media_mekasuit')
    let CapMedia = HexCapabilities.MEDIA
    let NS = Java.class.class
        .forName('org.openjdk.nashorn.api.scripting.NashornScriptEngineFactory')
        .getConstructor()
        .newInstance()
        .getScriptEngine()

    // bind this
    NS.eval(`
        // imports
        var ADMediaHolder = Java.type('at.petrak.hexcasting.api.addldata.ADMediaHolder')
        var StorageUtils = Java.type('mekanism.common.util.StorageUtils')
        var media = 1000000
        var MekasuitHolderCls = Java.extend(ADMediaHolder)

        function buildCap(stack) {
            var MekCap = StorageUtils.getEnergyContainer(stack, 0)
            if(!MekCap) return null
            return new MekasuitHolderCls({
                getMedia: function () {
                    return MekCap.getEnergy()
                },
                getMaxMedia: function () {
                    return MekCap.getMaxEnergy()
                },
                setMedia: function (media) {
                    // MekCap.setEnergy(media) not working, why?
                },
                canRecharge: function () {
                    return false
                },
                canProvide: function () {
                    return true
                },
                getConsumptionPriority: function () {
                    return 114514
                },
                canConstructBattery: function () {
                    return false
                },
            })
        }
    `)

    let provide = function (stack) {
        return {
            getCapability(cap, side) {
                if (stack.isEmpty() || cap !== CapMedia) return LazyOptional.empty()
                return LazyOptional.of(() => NS.invokeFunction('buildCap', stack))
            },
        }
    }

    ForgeEvents.onGenericEvent('net.minecraftforge.event.AttachCapabilitiesEvent', 'net.minecraft.world.item.ItemStack', e =>
        global.onBindMekasuitMedia(e),
    )
    global.onBindMekasuitMedia = e => {
        let stack = e.getObject()
        if (stack.id.startsWith('mekanism:mekasuit_')) e.addCapability(IDMekasuitCap, provide(stack))
    }
}
