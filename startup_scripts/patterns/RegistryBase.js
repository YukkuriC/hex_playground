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
}
for (let pair of ['double', 'entity', 'list', 'string', 'pattern', 'vec3/vector', 'bool/boolean']) {
    let [key, keyMishap] = pair.split('/')
    Args.prototype[key] = _buildGetter(key, keyMishap)
}

/*
porting note:
stack -> img.stack
ravenmind -> image.userData.remove(HexAPI.RAVENMIND_USERDATA)
ctx -> env

execute(args: List<Iota>, env: CastingEnvironment): newStack
*/

function ActionJS(id, pattern, options) {
    const { sound } = options || {}
    let actionProto = {
        operate(env, img, cont) {
            let stack = img.stack
            if (stack.toArray) stack = stack.toArray()
            stack = Array.from(stack) // always copy for mishap recover
            try {
                let sideEffects = global.PatternOperateMap[id](stack, env, img) || [] // for evil purpose
                let newImg = img.copy(stack, img.parenCount, img.parenthesized, img.escapeNext, img.opsConsumed + 1, img.userData)
                return OperationResult(newImg, sideEffects, cont, sound || HexEvalSounds.NORMAL_EXECUTE)
            } catch (e) {
                if (e instanceof Mishap) {
                    let mishapName = Text.translate(`hexcasting.action.yc:${id}`).aqua()
                    let mishapEffect = OperatorSideEffect.DoMishap(e, Mishap.Context(pattern, mishapName))
                    mishapEffect.performEffect(CastingVM(img, env))
                    let newImg = img.copy(img.stack, img.parenCount, img.parenthesized, img.escapeNext, 0, img.userData)
                    while (cont.next) cont = cont.next // stop anyway
                    return OperationResult(newImg, [mishapEffect], cont, HexEvalSounds.MISHAP)
                }
                throw e
            }
        },
    }
    return new JavaAdapter(Action, actionProto)
}
