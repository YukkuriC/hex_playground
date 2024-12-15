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
    brainsweep_target(i) {
        let entity = this.entity(i)
        if (entity instanceof Mob) {
            if (Brainsweeping.isValidTarget(entity)) return entity
            if (entity instanceof AbstractVillager) return entity
        }
        throw MishapInvalidIota.of(this.data[i], this.data.length - i - 1, 'class.entity.brainsweep_target')
    },
    villager(i) {
        let entity = this.entity(i)
        if (entity instanceof Villager) return entity
        throw MishapInvalidIota.of(this.data[i], this.data.length - i - 1, 'class.entity.villager')
    },
}
for (let pair of ['double', 'entity', 'list', 'string', 'pattern', 'vec3/vector', 'bool/boolean']) {
    let [key, keyMishap] = pair.split('/')
    Args.prototype[key] = _buildGetter(key, keyMishap)
}

function ActionJS(id, isGreat) {
    this.operate = (c, s, r, ct) => {
        s = Array.from(s.toArray()) // for js methods
        try {
            return global.PatternOperateMap[id](c, s, r, ct) || OperationResult(c, s, r, [])
        } catch (e) {
            if (e instanceof Mishap)
                return OperationResult(c, s, r, [OperatorSideEffect.DoMishap(e, Mishap.Context(HexPattern(HexDir.WEST, []), null))])
            throw e
        }
    }

    // isGreat
    this.isGreat = isGreat ? () => true : () => false

    // TODO displayName by lang
    let _displayName = Text.translate(`hexcasting.spell.yc:${id}`).gold()
    this.getDisplayName = this.displayName = () => _displayName
}
ActionJS.prototype = {
    alwaysProcessGreatSpell: () => true,
    causesBlindDiversion: () => true,
}
