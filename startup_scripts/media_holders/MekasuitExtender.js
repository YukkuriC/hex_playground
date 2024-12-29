// requires: mekanism
{
    let IDMekasuitCap = new ResourceLocation('yc', 'media_mekasuit')
    let NS = global.createNashorn()

    // bind this
    NS.eval(`
        // imports
        var ADMediaHolder = Java.type('at.petrak.hexcasting.api.addldata.ADMediaHolder')
        var StorageUtils = Java.type('mekanism.common.util.StorageUtils')
        var FloatingLong = Java.type('mekanism.api.math.FloatingLong')
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
                    MekCap.setEnergy(FloatingLong.create(media))
                },
                canRecharge: function () {
                    return false
                },
                canProvide: function () {
                    return true
                },
                getConsumptionPriority: function () {
                    return 3999
                },
                canConstructBattery: function () {
                    return false
                },
            })
        }
    `)

    global.registerMediaCap(
        IDMekasuitCap,
        stack => stack.id.startsWith('mekanism:mekasuit_'),
        stack => () => NS.invokeFunction('buildCap', stack),
    )
}
