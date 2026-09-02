/**
 * Changes:
 * create obj = register, no more registry phase
 * TODO:
 * great tag dump
 * Patchouli dump
 */
;(() => {
    let {
        // one per line
        ActionJS,
        ActionRegistryJS,
        Args,
        CastingEnvironmentComponentJS: CastEnvJS,
    } = HexJS
    let {
        // ALL used API in a flat map
        // iota
        BooleanIota,
        ListIota,
        Vec3Iota,
        DoubleIota,

        // mishap
        MishapAlreadyBrainswept,

        // utils
        HexPattern,
        HexDir,
        OperatorSideEffect$Particles,
        ParticleSpray,
        TreeList,
    } = HexJS.APIFlat
    function registerPatternWrap(seq, dir, id, isGreat) {
        isGreat = !!isGreat
        let resourceKey = 'yc:' + id
        let pattern = HexPattern.fromAnglesUnchecked(seq, dir)
        let obj = ActionRegistryJS.of(pattern, resourceKey, isGreat)
        // pipe operate method later
        return obj
    }

    // 查询相关
    registerPatternWrap('aaqawawaeadaadadadaadadadaada', HexDir.EAST, 'floodfill', 1).setOperateMutableStack((stack, ctx) => {
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
                    if (!ctx.isVecInRange(pos)) return false
                    return true
                },
                b => {
                    targets.push(Vec3Iota(b.pos))
                },
            )
        return [targets]
    })
    registerPatternWrap('qqqqqwdeddwqeeeeede', HexDir.SOUTH_EAST, 'zone_block_entity').setOperateMutableStack((stack, ctx) => {
        let args = new Args(stack, 2)
        let pos = args.vec3(0)
        ctx.assertVecInRange(pos)
        let x = pos.x(),
            y = pos.y(),
            z = pos.z()
        let distSq = args.double(1)
        distSq *= distSq
        let chunkX = x >> 4,
            chunkY = z >> 4
        let level = ctx.world
        let targets = []
        for (let cx = chunkX - 1; cx <= chunkX + 1; cx++) {
            for (let cy = chunkY - 1; cy <= chunkY + 1; cy++) {
                let chunk = level.getChunk(cx, cy)
                for (let bpos of chunk.getBlockEntitiesPos()) {
                    if (!ctx.isVecInRange(bpos)) continue
                    let dsq = Math.pow(x - bpos.x, 2) + Math.pow(y - bpos.y, 2) + Math.pow(z - bpos.z, 2)
                    if (dsq <= distSq) targets.push(new Vec3Iota(bpos))
                }
            }
        }
        let ret = new ListIota(TreeList.from(targets))
        global.setField(ret, 'size', Integer('0'))
        stack.push(ret)
    })

    registerPatternWrap('wawaw', HexDir.EAST, 'check_ambit').setOperateMutableStack((stack, ctx) => {
        let args = new Args(stack, 1)
        let pos = args.vec3(0)
        stack.push(
            new BooleanIota(
                // ctx.isVecInRange(pos) && ctx.isVecInWorld(pos)
                ctx.isVecInAmbit(pos),
            ),
        )
    })
    registerPatternWrap('eaqawqadaqdeewewewe', HexDir.EAST, 'in_nether').setOperate(ctx => {
        return [new BooleanIota(String(ctx.world.dimension) == 'minecraft:the_nether')]
    })

    // 世界交互相关
    registerPatternWrap('aaddwdwdqdwd', HexDir.NORTH_WEST, 'punch_entity').setOperateMutableStack((stack, ctx) => {
        let args = new Args(stack, 2)
        let victim = args.entity(0)
        ctx.assertEntityInRange(victim)
        let damage = args.double(1)
        let player = ctx.castingEntity

        let damage_for_fx = Math.max(10, Math.min(100, damage))
        let sideEffects = [new OperatorSideEffect$Particles(ParticleSpray.burst(victim.position(), damage_for_fx / 20, damage_for_fx * 2))]

        if (victim.attack) {
            let src = player.damageSources().playerAttack(player)
            victim.attack(src, damage)
        }

        return sideEffects
    })
    registerPatternWrap(
        'wqqwqwqaeqeeedqqeaqadedaqaedeqqeqedeqeaqeqaqedeadeaqwqwqaeda',
        HexDir.EAST,
        'brain_merge',
        1,
    ).setOperateMutableStack((stack, ctx) => {
        let args = new Args(stack, 2)
        // TODO
        let victim = args.brainmerge_target(0)
        ctx.assertEntityInRange(victim)
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
                    // ctx.castingEntity.tell(`test ${tradeType} 0:${curLevelTrades[0]} 1:${curLevelTrades[1]}`)
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
    })
    registerPatternWrap('qwewewewewewdqeeeeedwwwawwqwwqwwwdedwwwqwwqwwwded', HexDir.EAST, 'crystalize', 1).setOperate(ctx => {
        let crystalSteps = [
            [Item.of('budding_amethyst'), 100],
            [Item.of('hexcasting:charged_amethyst'), 10],
            [Item.of('amethyst_shard'), 5],
            [Item.of('hexcasting:amethyst_dust'), 1],
        ]
        let sideEffects = []

        let player = ctx.castingEntity
        let level = player.level
        let origin = player.eyePosition
        let x = origin.x(),
            y = origin.y(),
            z = origin.z()
        for (let target of level.getEntitiesWithin(player.boundingBox.inflate(32))) {
            // 筛选
            if (target.type == 'dummmmmmy:target_dummy') continue
            if (!ctx.isEntityInRange(target)) continue
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
            sideEffects.push(new OperatorSideEffect$Particles(ParticleSpray.burst(targetPos, 5, 100)))
        }

        return sideEffects
    })
    registerPatternWrap('qaeaqewqded', HexDir.NORTH_WEST, 'summon_arrow').setOperateMutableStack((stack, ctx) => {
        let args = new Args(stack, 2)
        let pos = args.vec3(0)
        ctx.assertVecInRange(pos)
        let speed = args.vec3(1)
        let arrow = new SpectralArrow(ctx.world, ctx.castingEntity, 'bedrock', null)
        arrow.mergeNbt({
            life: 1150,
            damage: 5,
            pickup: 0,
            PierceLevel: 5,
        })
        arrow.setPos(pos)
        arrow.setMotion(speed.x(), speed.y(), speed.z())
        arrow.spawn()
    })
    registerPatternWrap('eeeeedewdqeeeeedewd', HexDir.WEST, 'place_mageblock').setOperateMutableStack((stack, ctx) => {
        let args = new Args(stack, 1)
        let pos = args.vec3(0)
        ctx.assertVecInRange(pos)
        ctx.world.setBlock(
            BlockPos.containing(pos),
            // Blocks.BUDDING_AMETHYST.defaultBlockState(),
            Java.loadClass('com.hollingsworth.arsnouveau.setup.registry.BlockRegistry').MAGE_BLOCK.get().defaultBlockState(),
            2,
        )
    })
    registerPatternWrap('awqqqwaqqwa', HexDir.SOUTH_WEST, 'look_at').setOperateMutableStack((stack, ctx) => {
        let args = new Args(stack, 2)
        let entity = args.entity(0)
        let pos = args.vec3(1)
        entity.lookAt('eyes', pos)
    })
    registerPatternWrap('wqwqwqwawewewewewewdwqqaeaaeq', HexDir.WEST, 'i_see_all', 1).setOperate(ctx => {
        ctx.addExtension(new CastEnvJS.IsVecInRange('i_see_all', () => true))
    })

    // 代码执行相关
    registerPatternWrap('wewewewewewweeqeeqeeqeeqeeqee', HexDir.WEST, 'refresh_depth', 1).setOperate((ctx, img) => {
        img.opsConsumed = -114514
    })
    registerPatternWrap('waawweeeeewdewqa', HexDir.SOUTH_WEST, 'mind_patterns/clear').setOperate(ctx => {
        // 自动重开画布
        let itemStack = ctx.castingEntity.getItemInHand(ctx.castingHand)
        let item = itemStack?.item
        if (item?.class.name === 'at.petrak.hexcasting.common.items.ItemStaff') {
            item.use(ctx.world, ctx.castingEntity, ctx.castingHand)
        } else item = null
        ctx.castingEntity.server.scheduleInTicks(1, () => {
            IXplatAbstractions.INSTANCE.setPatterns(ctx.castingEntity, [])
            if (item) item.use(ctx.world, ctx.castingEntity, ctx.castingHand)
        })
    })
    registerPatternWrap('sdsdsdsdsds', HexDir.WEST, 'size_holder').setOperate(() => {
        let holder = new ListIota(TreeList.from([DoubleIota(114514)]))
        global.setField(holder, 'size', Integer('-114514'))
        return [holder]
    })
})()
