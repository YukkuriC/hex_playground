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
        var media = 1000000
        var MekasuitHolder = Java.extend(ADMediaHolder, {
            getMedia: function () {
                return media
            },
            getMaxMedia: function () {
                return media
            },
            setMedia: function () {},
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
    `)
    let mekaInstance = NS.eval(`new MekasuitHolder()`)

    let provide = function (stack) {
        return {
            getCapability(cap, side) {
                if (stack.isEmpty() || cap !== CapMedia) return LazyOptional.empty()
                return LazyOptional.of(() => mekaInstance)
            },
        }
    }

    ForgeEvents.onGenericEvent('net.minecraftforge.event.AttachCapabilitiesEvent', 'net.minecraft.world.item.ItemStack', e => {
        let stack = e.getObject()
        if (stack.id.startsWith('mekanism:mekasuit_')) e.addCapability(IDMekasuitCap, provide(stack))
    })
}
