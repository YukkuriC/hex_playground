let NS = Java.class.class
    .forName('org.openjdk.nashorn.api.scripting.NashornScriptEngineFactory')
    .getConstructor()
    .newInstance()
    .getScriptEngine()

// bind this
NS.eval(`
// imports
var PatternIota = Java.type('at.petrak.hexcasting.api.spell.iota.PatternIota')
var HexPattern = Java.type('at.petrak.hexcasting.api.spell.math.HexPattern')
var Iota = Java.type('at.petrak.hexcasting.api.spell.iota.Iota')
var IotaType = Java.type('at.petrak.hexcasting.api.spell.iota.IotaType')
var HexUtils = Java.type('at.petrak.hexcasting.api.utils.HexUtils')
var HexDir = Java.type('at.petrak.hexcasting.api.spell.math.HexDir')
var StringTag = Java.type('net.minecraft.nbt.StringTag')
var ChatFormatting = Java.type('net.minecraft.ChatFormatting')
var Component = Java.type('net.minecraft.network.chat.Component')

// comment iota type
var fooPattern = HexPattern.fromAngles('adadadadaqadadadada', HexDir.SOUTH_EAST)
var CommentType = Java.extend(IotaType, {
    deserialize: function (tag, world) {
        return new PatternIota(fooPattern)
    },
    display: function (tag) {
        if (!(tag instanceof StringTag)) {
            return Component.m_237115_('hexcasting.spelldata.unknown')
        }
        return Component.m_237113_(tag.m_7916_()).m_130940_(ChatFormatting.DARK_GREEN)
    },
})

// registry
var Registry = Java.type('net.minecraft.core.Registry')
var HexIotaTypes = Java.type('at.petrak.hexcasting.common.lib.hex.HexIotaTypes')
Registry.m_122961_(HexIotaTypes.REGISTRY, 'yc:comment', new CommentType())
`)
