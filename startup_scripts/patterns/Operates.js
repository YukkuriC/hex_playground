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
        /**@type {Internal.AbstractVillager}*/
        let victim = args.brainsweep_target(0)
        /**@type {Internal.Villager}*/
        let inject = args.villager(1)
        // 异常处理
        for (let target of [victim, inject]) if (Brainsweeping.isBrainswept(target)) throw MishapAlreadyBrainswept(target)
        let sideEffects = []

        // 前额叶移植
        let oldData = inject.getVillagerData && inject.getVillagerData()
        if (oldData.level < 5 && oldData.profession.name() !== 'none') {
            let newLevel = oldData.getLevel() + 1
            inject.setVillagerData(oldData.setLevel(newLevel))
            inject.setVillagerXp([10, 70, 150, 250][newLevel - 2]) // VillagerData.NEXT_LEVEL_XP_THRESHOLDS
            inject.potionEffects.add('regeneration', 40, 0)
            let newOffers = inject.offers
            let tradeMap = VillagerTrades.TRADES.get(oldData.profession)
            // 其实不用删之前的交易
            {
                // 抓两个对应等级交易
                let curLevelTrades = tradeMap[newLevel]
                global.shuffleList(curLevelTrades)
                for (let j = 0; j < 2 && j < curLevelTrades.length; j++) {
                    // let tradeType = curLevelTrades.pop() 这倒霉的array pop之后不删的
                    let tradeType = curLevelTrades[j]
                    // ctx.caster.tell(`test ${tradeType} 0:${curLevelTrades[0]} 1:${curLevelTrades[1]}`)
                    if (!tradeType) break
                    let trade = tradeType.getOffer(inject, inject.random)
                    newOffers.push(trade)
                }
            }
            // 再毛一个受害者的交易（若有）
            if (victim instanceof AbstractVillager) {
                let extOffers = victim.offers
                if (extOffers.length > 0) {
                    newOffers.push(extOffers[Math.floor(Math.random() * extOffers.length)])
                }
                extOffers.clear()
                victim.setOffers(extOffers)
                victim.nbt.merge({ NoAI: 1 }) // 流浪栓绳你抗洗脑是吧
            }
            inject.setOffers(newOffers)

            Brainsweeping.brainsweep(victim) // 天生万物以养人
            sideEffects.push(
                OperatorSideEffect.Particles(ParticleSpray.cloud(victim.eyePosition, 1, 20)),
                OperatorSideEffect.Particles(ParticleSpray.burst(inject.eyePosition, 0.3, 100)),
            )
            let posStr = `${victim.x} ${victim.y} ${victim.z}`
            ctx.world.runCommandSilent(`playsound minecraft:entity.villager.death ambient @a ${posStr} 0.8 1`)
            ctx.world.runCommandSilent(`playsound minecraft:entity.player.levelup ambient @a ${posStr} 0.5 0.8`)
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
    nested_modify: (c, stack, r, ctx) => {
        let args = new Args(stack, 3)
        let list_nbt = HexIotaTypes.serialize(args.get(0))
        let idx_list = args.list(1).list
        let n = idx_list.length
        let setter = list_nbt
        for (let i = 0; i < n; i++) {
            let idx = Math.round(idx_list[i].double)
            if (i === n - 1) setter['hexcasting:data'][idx] = HexIotaTypes.serialize(args.get(2))
            else setter = setter['hexcasting:data'][idx]
        }
        stack.push(HexIotaTypes.deserialize(list_nbt, ctx.world))
    },
}
