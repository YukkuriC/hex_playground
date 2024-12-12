global.ScheduleSignals = new WeakHashMap()
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
    'charge_media/wisp': (c, s, r, ctx) => {
        let wisp = ctx.wisp
        if (wisp) {
            wisp.media = 1145140000
        }
    },
    'charge_media/circle': (c, s, r, ctx) => {
        let circle = ctx.spellCircle
        if (circle) {
            let src = ctx.world.getBlockEntity(circle.impetusPos)
            if (src.media !== undefined) src.media = 1145140000
        }
    },
    punch_entity: (continuation, stack, ravenmind, ctx) => {
        let args = new Args(stack, 2)
        let victim = args.entity(0)
        let damage = args.double(1)

        let damage_for_fx = Math.max(10, Math.min(100, damage))
        let sideEffects = [OperatorSideEffect.Particles(ParticleSpray.burst(victim.position(), damage_for_fx / 20, damage_for_fx * 2))]

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
                    if (trade) newOffers.push(trade)
                }
            }
            // 再毛一个受害者的交易（若有）
            if (victim instanceof AbstractVillager) {
                let extOffers = victim.offers
                if (extOffers.length > 0) {
                    let offer = extOffers[Math.floor(Math.random() * extOffers.length)]
                    if (offer) newOffers.push(offer)
                }
                extOffers.clear()
                if (victim.setOffers) victim.setOffers(extOffers)
                victim.nbt.merge({ NoAI: 1 }) // 流浪栓绳你抗洗脑是吧 // TODO 处理BlueSkies守门人等更加抗洗脑的
            }
            inject.setOffers(newOffers)

            Brainsweeping.brainsweep(victim) // 天生万物以养人
            sideEffects.push(
                OperatorSideEffect.Particles(ParticleSpray.cloud(victim.eyePosition, 1, 20)),
                OperatorSideEffect.Particles(ParticleSpray.burst(inject.eyePosition, 1, 100)),
            )
            let posStr = `${victim.x} ${victim.y} ${victim.z}`
            ctx.world.runCommandSilent(`playsound minecraft:entity.villager.death ambient @a ${posStr} 0.8 1`)
            ctx.world.runCommandSilent(`playsound minecraft:entity.player.levelup ambient @a ${posStr} 0.5 0.8`)
        }

        return OperationResult(c, stack, r, sideEffects)
    },
    crystalize: (c, s, r, ctx) => {
        let crystalSteps = [
            [Item.of('budding_amethyst'), 100],
            [Item.of('hexcasting:charged_amethyst'), 10],
            [Item.of('amethyst_shard'), 5],
            [Item.of('hexcasting:amethyst_dust'), 1],
        ]
        let sideEffects = []

        /**@type {Internal.Player}*/
        let player = ctx.caster
        let level = player.level
        let origin = player.eyePosition
        let x = origin.x(),
            y = origin.y(),
            z = origin.z()
        for (let target of level.getEntitiesWithin(player.boundingBox.inflate(32))) {
            // 筛选
            if (target.type == 'dummmmmmy:target_dummy') continue
            if (player.stringUuid === target.stringUuid) {
                player.setAirSupply(0)
                player.setFoodLevel(0)
                player.attack(DamageSource.OUT_OF_WORLD, player.health - 1)
                player.potionEffects.add('slowness', 200, 2)
                player.potionEffects.add('night_vision', 100, 0)
                continue
            }
            let targetPos = target.eyePosition
            if (targetPos.subtract(origin).lengthSqr() > 1024) continue
            // 处死
            let health = target.health
            if (health === undefined) continue
            health *= Math.random()
            target.setHealth(0)
            // 结晶
            for (let pair of crystalSteps) {
                let [item, step] = pair
                while (health >= step) {
                    health -= step
                    // create item ender eye
                    let eye = new EyeOfEnder(level, targetPos.x(), targetPos.y(), targetPos.z())
                    eye.setItem(item)
                    eye.signalTo(new BlockPos(x + (Math.random() - 0.5) * 8, y + (Math.random() - 0.3) * 6, z + (Math.random() - 0.5) * 8))
                    eye.spawn()
                }
            }
            // fx
            sideEffects.push(OperatorSideEffect.Particles(ParticleSpray.burst(targetPos, 5, 100)))
        }

        return OperationResult(c, s, r, sideEffects)
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
    'mind_env/schedule': (c, stack, r, ctx) => {
        let args = new Args(stack, 2)
        let code = args.list(0).list
        let timeout = args.double(1)
        let key = ctx.spellCircle || ctx.caster
        let oldSignal = global.ScheduleSignals.get(key)
        if (oldSignal) oldSignal.cancel = true
        let mySignal = { cancel: false }
        global.ScheduleSignals.put(key, mySignal)

        ctx.caster.server.scheduleInTicks(timeout, () => {
            if (mySignal.cancel) return
            let harness = new CastingHarness(ctx)
            harness.executeIotas(code, ctx.caster.level)
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
    foo_nothing: () => {},
}
