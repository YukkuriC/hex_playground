// priority: 10

for (let target of [
    //
    'at.petrak.hexcasting.xplat.IXplatAbstractions',
]) {
    this[target.slice(target.lastIndexOf('.') + 1)] = Java.loadClass(target)
}