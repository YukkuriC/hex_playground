// priority:10

function Args(stack, n, keep) {
    if (stack.length < n) throw MishapNotEnoughArgs(n, stack.length)
    this.data = stack[keep ? 'slice' : 'splice'](-n)
}
let _buildGetter = (key, keyMishap) => {
    keyMishap = keyMishap || key
    keyMishap = 'class.' + keyMishap
    return function (i) {
        let iota = this.data[i]
        let res = iota[key]
        if (res === undefined) throw MishapInvalidIota.of(iota, this.data.length - i - 1, keyMishap)
        return res
    }
}
Args.prototype = {
    get(i) {
        return this.data[i]
    },
    // 1.21: getEntity(ServerLevel)
    entity(i) {
        let iota = this.data[i]
        let res = iota.getEntity && iota.getEntity(this.world)
        if (res === undefined) throw MishapInvalidIota.of(iota, this.data.length - i - 1, 'class.entity')
        return res
    },
    brainmerge_target(i) {
        let entity = this.entity(i)
        if (entity instanceof AbstractVillager || entity instanceof Raider) return entity
        throw MishapInvalidIota.of(this.data[i], this.data.length - i - 1, 'class.entity.brainmerge_target')
    },
    villager(i) {
        let entity = this.entity(i)
        if (entity instanceof Villager) return entity
        throw MishapInvalidIota.of(this.data[i], this.data.length - i - 1, 'class.entity.villager')
    },
    world: null,
}
for (let pair of ['double', 'list', 'string', 'pattern', 'vec3/vector', 'bool/boolean']) {
    let [key, keyMishap] = pair.split('/')
    Args.prototype[key] = _buildGetter(key, keyMishap)
}

/* 
ActionJS.helpers = {
    assertVecInRange(ctx, vec) {
        if (!ctx.isVecInWorld(vec)) throw new MishapBadLocation(vec, 'out_of_world')
        if (!ctx.isVecInRange(vec)) throw new MishapBadLocation(vec, 'too_far')
    },
    fImgStack: Reflection.getField(CastingImage, 'stack'),
}
 */
