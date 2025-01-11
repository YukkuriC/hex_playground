// priority: 10

for (let target of [
    //
    'at.petrak.hexcasting.xplat.IXplatAbstractions',
    'at.petrak.hexcasting.common.items.magic.ItemMediaHolder',
]) {
    this[target.slice(target.lastIndexOf('.') + 1)] = Java.loadClass(target)
}
