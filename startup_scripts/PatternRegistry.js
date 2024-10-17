function Args(stack, n, keep) {
    if (stack.length < n) throw MishapNotEnoughArgs(n, stack.length)
    this.data = stack[keep ? 'slice' : 'splice'](-n)
}
let _buildGetter = (key, keyMishap) => {
    keyMishap = keyMishap || key
    return function (i) {
        let iota = this.data[i]
        let res = iota[key]
        if (res === undefined) throw MishapInvalidIota(iota, this.data.length - i - 1, keyMishap)
        return res
    }
}
Args.prototype = {
    get(i) {
        return this.data[i]
    },
    brainsweep_target(i) {
        let entity = this.entity(i)
        if (Brainsweeping.isValidTarget(entity)) return entity
        throw MishapInvalidIota(this.data[i], this.data.length - i - 1, 'entity.brainsweep_target')
    },
}
for (let pair of ['double', 'entity', 'list', 'pattern', 'vec3/vector', 'bool/boolean']) {
    let [key, keyMishap] = pair.split('/')
    Args.prototype[key] = _buildGetter(key, keyMishap)
}

global.PatternOperateMap = {
    // 世界交互相关
    floodfill(c, stack, r, ctx) {
        let pos = new Args(stack, 1).vec3(0)
        ctx['assertVecInRange(net.minecraft.world.phys.Vec3)'](pos)

        let startBlock = ctx.world.getBlock(pos)
        let targets = []
        if (startBlock)
            global.FloodFillBlocks(
                ctx.world,
                startBlock.pos,
                b => {
                    if (targets.length >= 511) return false
                    if (b.id != startBlock.id) return false
                    try {
                        ctx['assertVecInRange(net.minecraft.world.phys.Vec3)'](pos)
                    } catch (e) {
                        return false
                    }
                    return true
                },
                b => {
                    targets.push(Vec3Iota(b.pos))
                },
            )
        stack.push(ListIota(targets))
    },
    charge_media(c, s, r, ctx) {
        let stack = ctx.caster.getItemInHand(ctx.castingHand)
        let item = stack.item
        if (item.setMedia && item.getMaxMedia) {
            item.setMedia(stack, item.getMaxMedia(stack))
        }
    },
    punch_entity(continuation, stack, ravenmind, ctx) {
        let args = new Args(stack, 2)
        let victim = args.entity(0)
        let damage = args.double(1)

        let sideEffects = [OperatorSideEffect.Particles(ParticleSpray.burst(victim.position(), damage / 20, damage * 2))]

        if (victim.attack) {
            let src = DamageSource.playerAttack(ctx.caster)
            victim.attack(src, damage)
        }

        return OperationResult(continuation, stack, ravenmind, sideEffects)
    },
    brain_merge(c, stack, r, ctx) {
        let args = new Args(stack, 2)
        let victim = args.brainsweep_target(0)
        /**@type {Internal.Villager}*/
        let inject = args.brainsweep_target(1)
        // TODO 异常处理
        let sideEffects = []

        // 前额叶移植
        let oldData = inject.getVillagerData()
        if (oldData.level < 5 && oldData.profession.name() !== 'none') {
            // TODO 处理交易经验
            inject.setVillagerData(oldData.setLevel(oldData.getLevel() + 1))
            // TODO 刷新交易

            Brainsweeping.brainsweep(victim) // 天生万物以养人
        }

        return OperationResult(c, stack, r, sideEffects)
    },

    // 代码执行相关
    refresh_depth(c, s, r, ctx) {
        global.setField(ctx, 'depth', Integer('-114514'))
    },
    push_to_mind_stack(c, stack, r, ctx) {
        let args = new Args(stack, 1)
        let harness = IXplatAbstractions.INSTANCE.getHarness(ctx.caster, ctx.castingHand)
        harness.stack.push(args.get(0))
        IXplatAbstractions.INSTANCE.setHarness(ctx.caster, harness)
    },
    pop_from_mind_stack(c, stack, r, ctx) {
        let harness = IXplatAbstractions.INSTANCE.getHarness(ctx.caster, ctx.castingHand)
        if (harness.stack.length < 1) throw MishapNotEnoughArgs(1, 0)
        stack.push(harness.stack.pop())
        IXplatAbstractions.INSTANCE.setHarness(ctx.caster, harness)
    },
    mind_stack_size(c, stack, r, ctx) {
        let harness = IXplatAbstractions.INSTANCE.getHarness(ctx.caster, ctx.castingHand)
        stack.push(DoubleIota(harness.stack.length))
    },
    mind_patterns(c, stack, r, ctx) {
        let patterns = IXplatAbstractions.INSTANCE.getPatterns(ctx.caster)
        stack.push(ListIota(patterns.map(x => PatternIota(x.pattern))))
    },
    clear_mind_patterns(c, s, r, ctx) {
        ctx.caster.server.scheduleInTicks(1, () => IXplatAbstractions.INSTANCE.setPatterns(ctx.caster, []))
        // TODO 自动重开画布
    },
}

function ActionJS(id, isGreat) {
    this.operate = (c, s, r, ct) => {
        s = Array.from(s.toArray()) // for js methods
        try {
            return global.PatternOperateMap[id](c, s, r, ct) || OperationResult(c, s, r, [])
        } catch (e) {
            if (String(e).indexOf('Mishap') >= 0) {
                return OperationResult(c, s, r, [OperatorSideEffect.DoMishap(e, Mishap.Context(HexPattern(HexDir.WEST, []), null))])
            }
            throw e
        }
    }

    // isGreat
    this.isGreat = isGreat ? () => true : () => false

    // TODO displayName by lang
    let _displayName = Text.of(id.toUpperCase()).gold()
    this.getDisplayName = this.displayName = () => _displayName
}
ActionJS.prototype = {
    alwaysProcessGreatSpell: () => true,
    causesBlindDiversion: () => true,
}

global.loadCustomPatterns = () => {
    let actionLookup = global.getField(PatternRegistry, 'actionLookup', 1)
    function registerPatternWrap(seq, dir, id, isGreat) {
        isGreat = !!isGreat
        if (!id in global.PatternOperateMap) throw new Error('missing operate: ' + id)
        let resourceKey = ResourceLocation('yc', id)
        if (actionLookup.containsKey(resourceKey)) actionLookup.remove(resourceKey)
        PatternRegistry.mapPattern(HexPattern.fromAngles(seq, dir), resourceKey, new ActionJS(id, isGreat), isGreat)
    }

    registerPatternWrap('aaqawawaeadaadadadaadadadaada', HexDir.EAST, 'floodfill', 1)
    registerPatternWrap('wwaqqqqqedwdwwwaw', HexDir.EAST, 'charge_media', 1)
    registerPatternWrap('aaddwdwdqdwd', HexDir.NORTH_WEST, 'punch_entity')
    registerPatternWrap('wqqwqwqaeqeeedqqeaqadedaqaedeqqeqedeqeaqeqaqedeadeaqwqwqaeda', HexDir.EAST, 'brain_merge')

    registerPatternWrap('wewewewewewweeqeeqeeqeeqeeqee', HexDir.WEST, 'refresh_depth', 1)
    registerPatternWrap('waawweeeeedd', HexDir.SOUTH_WEST, 'push_to_mind_stack')
    registerPatternWrap('wqaqwweeeee', HexDir.SOUTH_WEST, 'pop_from_mind_stack')
    registerPatternWrap('waawweeeeewaa', HexDir.SOUTH_WEST, 'mind_stack_size')
    registerPatternWrap('waawweeeeaaeaeaeaeaw', HexDir.SOUTH_WEST, 'mind_patterns')
    registerPatternWrap('waawweeeeewdewqa', HexDir.SOUTH_WEST, 'clear_mind_patterns')
}
StartupEvents.postInit(global.loadCustomPatterns)
