// port of Hexcellular 1.20.1 (https://github.com/miyucomics/hexcellular)
// original repo under MIT license

// tests left:
// TreeList related stuff: FrameEvaluate

;(() => {
    if (Platform.isLoaded('hexcellular')) return
    let { IotaJS, ActionRegistryEntryJS, ActionRegistryJS } = HexJS
    let {
        TreeList,
        NullIota,
        ListIota,
        FrameFinishEval,
        FrameEvaluate,
        OperatorSideEffect,
        Mishap,
        MishapEvalTooMuch,
        HexEvalSounds,
        IotaType,
        MediaConstants,
        MishapInvalidIota,
        MishapOthersName,
        Iota,
    } = HexJS.APIFlat
    let NbtOps = Java.loadClass('net.minecraft.nbt.NbtOps')
    let ServerPlayer = Java.loadClass('net.minecraft.server.level.ServerPlayer')

    // config
    let STORAGE_KEY = 'yc:property_storage'
    let PROP_TYPE = 'hexcellular:property'

    // helpers
    /**
     * fetch prop storage from env
     * @param {Internal.$CastingEnvironment} env
     * @returns {Internal.$CompoundTag}
     */
    let getGlobalStorage = env => {
        let server = env.world
        let root = server.persistentData
        if (!root[STORAGE_KEY]) root[STORAGE_KEY] = {}
        return root[STORAGE_KEY]
    }
    /**
     * convert iota to nbt
     * @param {Internal.$Iota} iota
     * @returns {Internal.$CompoundTag} nbt
     */
    let iota2nbt = iota => {
        return IotaType.TYPED_CODEC.encodeStart(NbtOps.INSTANCE, iota).getOrThrow()
    }
    /**
     * convert nbt to iota
     * @param {Internal.$CompoundTag} nbt
     * @returns {Internal.$Iota} iota
     */
    let nbt2iota = nbt => {
        return IotaType.TYPED_CODEC.decode(NbtOps.INSTANCE, nbt).getOrThrow().getFirst()
    }
    /**
     * creates polyfilled prop iota with given name
     * @param {string} name
     */
    let propOfName = name => {
        return new IotaJS({ name }, PropIotaType)
    }
    /**
     * creates a prop name, ported from hexcellular PropertyNamer
     * @param {string} [seed] omitted for pure random, provided for a deterministic result
     */
    let generatePropName = (() => {
        let consonants = ['j', 'k', 'l', 'm', 'n', 'p', 's', 't', 'w']
        let vowels = ['a', 'e', 'i', 'o', 'u']
        let bannedSyllables = ['ji', 'ti', 'wo', 'wu']
        let syllableBounds = [2, 7, 10]
        let newRandom = seed => {
            if (seed === undefined) return Math.random
            let state = 0
            for (let i = 0; i < seed.length; i++) state = (state * 31 + seed.charCodeAt(i)) | 0
            state = state >>> 0
            return () => {
                state = (state * 1664525 + 1013904223) % 4294967296
                return state / 4294967296
            }
        }
        let randomBool = rand => rand() < 0.5
        let pick = (rand, list) => list[Math.floor(rand() * list.length)]
        let newSyllable = (rand, wasNasal) => {
            let consonant = pick(rand, consonants)
            let vowel = pick(rand, vowels)
            let syllable = `${consonant}${vowel}`
            while ((wasNasal && (consonant == 'm' || consonant == 'n')) || bannedSyllables.indexOf(syllable) >= 0) {
                consonant = pick(rand, consonants)
                vowel = pick(rand, vowels)
                syllable = `${consonant}${vowel}`
            }
            if (randomBool(rand)) syllable += 'n'
            return syllable
        }
        return seed => {
            let rand = newRandom(seed)
            let word = ''
            if (randomBool(rand)) {
                word += pick(rand, vowels)
                if (randomBool(rand)) word += 'n'
            }
            let target = Math.floor(rand() * 10) + 1
            let count = 0
            for (let i = 0; i < syllableBounds.length; i++) {
                count = i + 1
                if (target <= syllableBounds[i]) break
            }
            for (let i = 0; i < count; i++) word += newSyllable(rand, word.endsWith('n'))
            return word
        }
    })()
    /**
     * checks whether given iota is a prop iota
     */
    let isPropIota = iota => Iota.typesMatch(iota, propOfName(''))
    /**
     * reads prop name from given iota
     */
    let getProp = (iota, reverseIdx) => {
        if (isPropIota(iota)) return iota.data.getString('name')
        throw MishapInvalidIota.ofType(iota, reverseIdx, 'property')
    }
    /**
     * casts env's caster to a player if possible, otherwise null
     */
    let asCaster = env => {
        let caster = env.castingEntity
        return caster instanceof ServerPlayer ? caster : null
    }

    // iotajs eq
    let PropIotaType = IotaJS.type(PROP_TYPE)
        .setOperate(true, false, action => {
            action.setOperate((env, image, cont) => {
                // pick iota
                let name = action.data.getString('name')
                let storage = getGlobalStorage(env)
                let rawData = storage[name]
                let iota = rawData ? nbt2iota(rawData) : new NullIota()
                let spell = iota instanceof ListIota ? iota.list : TreeList.from([iota])

                // add to cont
                if (image.opsConsumed > env.maxOpCount) return [new MishapEvalTooMuch()]
                let newCont = cont.pushFrame(FrameFinishEval.INSTANCE).pushFrame(new FrameEvaluate(spell, true))
                return [newCont, image.withUsedOp(), HexEvalSounds.NOTHING.get()]
            })
        })
        .setDisplay(iota => {
            let { data } = iota
            let ret = Text.of(data.getString('name')).green()
            if (data.getBoolean('readonly')) ret = ret.bold()
            return ret
        })
        .setColor(() => -0x591c5f)

    // pattern series
    {
        // create_property: "aawe", SOUTH_WEST, 5 crystals
        let create_property = ActionRegistryJS.of('SOUTH_WEST,aawe', 'hexcellular:create_property').setOperate((env, image, cont) => {
            let storage = getGlobalStorage(env)
            let name = generatePropName()
            while (storage[name]) name = generatePropName()
            create_property.preCheckMedia(env)
            return [
                OperatorSideEffect.AttemptSpell(
                    {
                        cast: () => {
                            storage[name] = iota2nbt(new NullIota())
                        },
                    },
                    true,
                    true,
                ),
                propOfName(name),
                HexEvalSounds.SPELL.get(),
            ]
        })
        create_property.action.mediaCost = MediaConstants.CRYSTAL_UNIT * 5

        // observe_property: "aawd", SOUTH_WEST
        ActionRegistryJS.of('SOUTH_WEST,aawd', 'hexcellular:observe_property').setOperateArgsSplit(1, (args, env) => {
            let name = getProp(args.data.get(0), 0)
            let rawData = getGlobalStorage(env)[name]
            return [rawData ? nbt2iota(rawData) : new NullIota()]
        })

        // set_property: "aawq", SOUTH_WEST, dust / 10
        let set_property = ActionRegistryJS.of('SOUTH_WEST,aawq', 'hexcellular:set_property').setOperateArgsSplit(2, (args, env) => {
            let prop = args.data.get(0)
            let name = getProp(prop, 1)
            if (prop.data.getBoolean('readonly')) throw MishapInvalidIota.of(prop, 1, 'writeable_prop')

            let iota = args.data.get(1)
            let mishap = MishapOthersName.getTrueNameMishapFromDatum(env.world, iota, asCaster(env))
            if (mishap) throw mishap
            getGlobalStorage(env)[name] = iota2nbt(iota)
        })
        set_property.action.mediaCost = MediaConstants.DUST_UNIT / 10

        // readonly_property: "aawa", SOUTH_WEST
        ActionRegistryJS.of('SOUTH_WEST,aawa', 'hexcellular:readonly_property').setOperateArgsSplit(1, (args, env) => {
            let prop = args.data.get(0)
            let name = getProp(prop, 0)
            if (prop.data.getBoolean('readonly')) throw MishapInvalidIota.of(prop, 1, 'writeable_prop')
            return [new IotaJS({ name, readonly: true }, PropIotaType)]
        })
    }

    // interop
    if (Platform.isLoaded('hexparse')) {
        let HexParseAPI = Java.loadClass('io.yukkuric.hexparse.api.HexParseAPI')
        let HexParseConfig = Java.loadClass('io.yukkuric.hexparse.config.HexParseConfig')
        let StringProcessors = Java.loadClass('io.yukkuric.hexparse.misc.StringProcessors')
        let PluginIotaFactory = Java.loadClass('io.yukkuric.hexparse.parsers.PluginIotaFactory')
        let CostTracker = Java.loadClass('io.yukkuric.hexparse.parsers.CostTracker')
        let MetaHolder = Java.loadClass('io.yukkuric.hexparse.parsers.meta.MetaHolder')
        let CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag')

        let getPropParseCost = () => HexParseConfig.parserBaseCost() + MediaConstants.CRYSTAL_UNIT
        let makePropNbt = name => {
            let data = new CompoundTag()
            data.putString('name', name)
            return PluginIotaFactory.makeType(PROP_TYPE, data, 'data')
        }

        // prop_xxx / property_xxx
        HexParseAPI.AddForthParser(
            {
                match: node => /^prop(erty)?_/.test(node),
                parse: node => {
                    let str = StringProcessors.APPEND_UNDERLINE.apply(node.substring(node.indexOf('_') + 1))
                    if (HexParseConfig.fairPlayPropNames()) {
                        str = generatePropName(str)
                        str = StringProcessors.APPEND_UNDERLINE.apply(str)
                    }
                    return makePropNbt(str)
                },
                ignored: () => false,
                getCost: getPropParseCost,
            },
            'hexcellular:prop',
        )

        // myprop_xxx
        HexParseAPI.AddForthParser(
            {
                match: node => /^myprop_/.test(node),
                parse: node => {
                    let str = node.substring(node.indexOf('_') + 1)
                    if (HexParseConfig.fairPlayPropNames()) str = generatePropName(str)
                    let owner = CostTracker.INSTANCE.player
                    return makePropNbt(`[face:${owner.getScoreboardName()}]@${str}`)
                },
                ignored: () => false,
                getCost: getPropParseCost,
            },
            'hexcellular:myprop',
        )

        // property iota -> prop_xxx / myprop_xxx
        let propBack = {
            match: node => node.getString('type') == PROP_TYPE,
            parse: node => {
                let name = node.getCompound('data').getString('name')
                let at = name.indexOf('@')
                if (at >= 0) return `myprop_${name.substring(at + 1)}`
                return `prop_${name.startsWith('_') ? name.substring(1) : name}`
            },
            receiveConfigNum: num => {},
        }
        propBack.parseAndCollect = node => {
            let res = propBack.parse(node)
            if (MetaHolder.enabled(MetaHolder.ADDONS)) MetaHolder.addNamespace('hexcellular')
            return res
        }
        HexParseAPI.AddBackParser(propBack, PROP_TYPE)
    }
})()

