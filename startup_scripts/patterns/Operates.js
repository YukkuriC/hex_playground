global.PatternOperateMap = {
    // 世界交互相关
    floodfill: (c, stack, r, ctx) => {
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
    charge_media: (c, s, r, ctx) => {
        let stack = ctx.caster.getItemInHand(ctx.castingHand)
        let item = stack.item
        if (item.setMedia && item.getMaxMedia) {
            item.setMedia(stack, item.getMaxMedia(stack))
        }
    },
    punch_entity: (continuation, stack, ravenmind, ctx) => {
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
    brain_merge: (c, stack, r, ctx) => {
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
    refresh_depth: (c, s, r, ctx) => {
        global.setField(ctx, 'depth', Integer('-114514'))
    },
    'mind_stack/push': (c, stack, r, ctx) => {
        let args = new Args(stack, 1)
        let harness = IXplatAbstractions.INSTANCE.getHarness(ctx.caster, ctx.castingHand)
        harness.stack.push(args.get(0))
        IXplatAbstractions.INSTANCE.setHarness(ctx.caster, harness)
    },
    'mind_stack/pop': (c, stack, r, ctx) => {
        let harness = IXplatAbstractions.INSTANCE.getHarness(ctx.caster, ctx.castingHand)
        if (harness.stack.length < 1) throw MishapNotEnoughArgs(1, 0)
        stack.push(harness.stack.pop())
        IXplatAbstractions.INSTANCE.setHarness(ctx.caster, harness)
    },
    'mind_stack/size': (c, stack, r, ctx) => {
        let harness = IXplatAbstractions.INSTANCE.getHarness(ctx.caster, ctx.castingHand)
        stack.push(DoubleIota(harness.stack.length))
    },
    mind_patterns: (c, stack, r, ctx) => {
        let patterns = IXplatAbstractions.INSTANCE.getPatterns(ctx.caster)
        stack.push(ListIota(patterns.map(x => PatternIota(x.pattern))))
    },
    'mind_patterns/clear': (c, s, r, ctx) => {
        // 自动重开画布
        let itemStack = ctx.caster.getItemInHand(ctx.castingHand)
        let item = itemStack?.item
        if (item?.class.name === 'at.petrak.hexcasting.common.items.ItemStaff') {
            item.use(ctx.world, ctx.caster, ctx.castingHand)
        } else item = null
        ctx.caster.server.scheduleInTicks(1, () => {
            IXplatAbstractions.INSTANCE.setPatterns(ctx.caster, [])
            if (item) item.use(ctx.world, ctx.caster, ctx.castingHand)
        })
    },
}
