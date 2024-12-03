/*
checklist:
    charge_media/wisp
 */

global.PatternOperateMap = {
    // 世界交互相关
    floodfill: (stack, ctx) => {
        let pos = new Args(stack, 1).vec3(0)
        ctx.assertVecInRange(pos)

        let startBlock = ctx.world.getBlock(pos)
        let targets = []
        if (startBlock)
            global.FloodFillBlocks(
                ctx.world,
                startBlock.pos,
                b => {
                    if (targets.length >= 511) return false
                    if (b.id != startBlock.id) return false
                    if (!ctx.isVecInAmbit(pos)) return false
                    return true
                },
                b => {
                    targets.push(Vec3Iota(b.pos))
                },
            )
        stack.push(ListIota(targets))
    },
    charge_media: (s, ctx) => {
        let stack = ctx.caster.getItemInHand(ctx.castingHand)
        let item = stack.item
        if (item.setMedia && item.getMaxMedia) {
            item.setMedia(stack, item.getMaxMedia(stack))
        }
    },
    'charge_media/wisp': (s, ctx) => {
        let wisp = ctx.wisp
        if (wisp) {
            wisp.media = 1145140000
        }
    },
    punch_entity: (stack, ctx) => {
        let args = new Args(stack, 2)
        let victim = args.entity(0)
        let damage = args.double(1)
        let player = ctx.caster

        let sideEffects = [OperatorSideEffect.Particles(ParticleSpray.burst(victim.position(), damage / 20, damage * 2))]

        if (victim.attack) {
            let src = player.damageSources().playerAttack(player)
            victim.attack(src, damage)
        }

        return sideEffects
    },
    brain_merge: (stack, ctx) => {
        let args = new Args(stack, 2)
        /**@type {Internal.AbstractVillager}*/
        let victim = args.brainmerge_target(0)
        /**@type {Internal.Villager}*/
        let inject = args.villager(1)
        // 异常处理
        for (let target of [victim, inject]) if (IXplatAbstractions.INSTANCE.isBrainswept(target)) throw MishapAlreadyBrainswept(target)
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

            IXplatAbstractions.INSTANCE.setBrainsweepAddlData(victim) // 天生万物以养人
            sideEffects.push(
                OperatorSideEffect.Particles(ParticleSpray.cloud(victim.eyePosition, 1, 20)),
                OperatorSideEffect.Particles(ParticleSpray.burst(inject.eyePosition, 1, 100)),
            )
            let posStr = `${victim.x} ${victim.y} ${victim.z}`
            ctx.world.runCommandSilent(`playsound minecraft:entity.villager.death ambient @a ${posStr} 0.8 1`)
            ctx.world.runCommandSilent(`playsound minecraft:entity.player.levelup ambient @a ${posStr} 0.5 0.8`)
        }

        return sideEffects
    },
    crystalize: (s, ctx) => {
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
                player.attack(player.damageSources().outOfBorder(), player.health - 1)
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

        return sideEffects
    },

    // 代码执行相关
    // refresh_depth: (s, ctx) => {
    //     global.setField(ctx, 'depth', Integer('-114514'))
    // },
    'mind_stack/push': (stack, ctx) => {
        let args = new Args(stack, 1)
        let img = IXplatAbstractions.INSTANCE.getStaffcastVM(ctx.caster, ctx.castingHand).image
        img.stack.add(args.get(0))
        IXplatAbstractions.INSTANCE.setStaffcastImage(ctx.caster, img)
    },
    'mind_stack/pop': (stack, ctx) => {
        let img = IXplatAbstractions.INSTANCE.getStaffcastVM(ctx.caster, ctx.castingHand).image
        let removeIdx = img.stack.length - 1
        if (removeIdx < 0) throw MishapNotEnoughArgs(1, 0)
        stack.push(img.stack.remove(img.stack.length - 1))
        IXplatAbstractions.INSTANCE.setStaffcastImage(ctx.caster, img)
    },
    'mind_stack/size': (stack, ctx) => {
        let img = IXplatAbstractions.INSTANCE.getStaffcastVM(ctx.caster, ctx.castingHand).image
        stack.push(DoubleIota(img.stack.length))
    },
    mind_patterns: (stack, ctx) => {
        let patterns = IXplatAbstractions.INSTANCE.getPatternsSavedInUi(ctx.caster)
        stack.push(ListIota(patterns.map(x => PatternIota(x.pattern))))
    },
    'mind_patterns/clear': (s, ctx) => {
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
    nested_modify: (stack, ctx) => {
        let args = new Args(stack, 3)
        let list_nbt = IotaType.serialize(args.get(0))
        let idx_list = args.list(1).list
        let n = idx_list.length
        let setter = list_nbt
        for (let i = 0; i < n; i++) {
            let idx = Math.round(idx_list[i].double)
            if (i === n - 1) setter['hexcasting:data'][idx] = IotaType.serialize(args.get(2))
            else setter = setter['hexcasting:data'][idx]
        }
        stack.push(IotaType.deserialize(list_nbt, ctx.world))
    },
}
