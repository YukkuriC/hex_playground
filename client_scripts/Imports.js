// priority: 10

for (let target of [
    //
    'net.minecraft.client.gui.screens.Screen',
    'at.petrak.hexcasting.api.casting.math.HexDir',
    'at.petrak.hexcasting.api.casting.math.HexPattern',
    'at.petrak.hexcasting.api.casting.math.EulerPathFinder',
    'at.petrak.hexcasting.xplat.IClientXplatAbstractions',
    'at.petrak.hexcasting.common.msgs.MsgNewSpellPatternC2S',
    'at.petrak.hexcasting.xplat.IXplatAbstractions',
    'at.petrak.hexcasting.common.items.magic.ItemMediaHolder',
]) {
    this[target.slice(target.lastIndexOf('.') + 1)] = Java.loadClass(target)
}
