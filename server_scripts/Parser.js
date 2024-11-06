{
    let PatternRegistryPath = 'at.petrak.hexcasting.api.PatternRegistry'
    let PRClass = Java.loadClass(PatternRegistryPath)
    let PRRaw = global.loadRawClass(PatternRegistryPath)
    let Double = Java.loadClass('java.lang.Double')
    let HexIotaTypes = Java.loadClass('at.petrak.hexcasting.common.lib.hex.HexIotaTypes')
    let EntityIota = Java.loadClass('at.petrak.hexcasting.api.spell.iota.EntityIota')
    let Registry = Java.loadClass('net.minecraft.core.Registry')
    let CompoundTag = Java.loadClass('net.minecraft.nbt.CompoundTag')

    let mapStartDir = {}
    let mapLineDir = {}
    'NORTH_EAST,EAST,SOUTH_EAST,SOUTH_WEST,WEST,NORTH_WEST'.split(',').forEach((x, i) => (mapStartDir[x] = `${i}b`))
    Array.from('wedsaq').forEach((x, i) => (mapLineDir[x] = `${i}B`))
    let seq2bytes = seq =>
        Array.from(seq)
            .map(x => mapLineDir[x])
            .join(',')
    let toList = lst => `{"hexcasting:data":[${lst.join(',')}],"hexcasting:type":"hexcasting:list"}`
    let toNum = num => `{"hexcasting:data":${num}d,"hexcasting:type":"hexcasting:double"}`
    let toVec = nums =>
        `{"hexcasting:data":[L;${nums
            .map(x => Double.doubleToRawLongBits(x).toString() + 'L')
            .join(',')}],"hexcasting:type":"hexcasting:vec3"}`
    let toPattern = (seq, startDir) =>
        `{"hexcasting:data":{angles:[B;${seq2bytes(seq)}],start_dir:${mapStartDir[startDir]}},"hexcasting:type":"hexcasting:pattern"}`
    let toType = type => `{"hexcasting:data":"${type}","hexcasting:type":"hexal:iota_type"}`
    let toEntityType = type => `{"hexcasting:data":"${type}","hexcasting:type":"hexal:entity_type"}`

    let specialPatternSeq = {
        qqqaw: '\\',
        qqq: '(',
        eee: ')',
    }
    let mapPatterns = global.mapPatterns || {}
    let onLoad = (/**@type {Internal.CommandEventJS}*/ e) => {
        mapPatterns = global.mapPatterns = {
            escape: toPattern('qqqaw', 'WEST'),
            pop: toPattern('a', 'SOUTH_WEST'),
            '(': toPattern('qqq', 'WEST'),
            ')': toPattern('eee', 'EAST'),
        }
        mapPatterns['\\'] = mapPatterns.escape
        // map static class
        let staticMap = global.getField(PRRaw, 'regularPatternLookup', 1)
        for (let seq in staticMap) {
            let pattern = staticMap[seq]
            let op = pattern.opId()
            let startDir = pattern.preferredStart()
            let patternNBT = toPattern(seq, startDir)
            mapPatterns[op] = mapPatterns[op.path] = patternNBT
        }
        // map per-world patterns
        let server = Utils.server
        let perWorldMap = PRClass.getPerWorldPatterns(server.getLevel('overworld'))
        for (let seq in perWorldMap) {
            let pair = perWorldMap[seq]
            let op = pair.first
            let startDir = pair.second
            let patternNBT = toPattern(seq, startDir)
            mapPatterns[op] = mapPatterns[op.path] = patternNBT
        }
    }
    ServerEvents.loaded(onLoad)
    ServerEvents.command('reload', onLoad)

    // 把正反解析函数挪一块
    let str2nbt = (raw, player) => {
        raw = String(raw)
            .replace(/\/\/.*/g, ' ')
            .replace(/[\r\n]/g, ' ')
            .replace(/\/\*.*?\*\//g, ' ')
        let code = []
        raw.replace(/\\|\(|\)|\[|\]|[\w\.\/\-\:]+/g, match => (code.push(match), ''))

        let stack = [[]]
        for (let kw of code) {
            // nested list
            if (kw == '[') {
                stack.unshift([])
            } else if (kw == ']') {
                let inner = stack.shift()
                stack[0].push(toList(inner))
            }
            // normal kw
            else if (kw in mapPatterns) {
                stack[0].push(mapPatterns[kw])
            }

            // myself
            else if (kw.toLowerCase() === 'myself') {
                stack[0].push(String(HexIotaTypes.serialize(EntityIota(player))))
            }

            // num pattern by escape
            else if (kw.startsWith('num_')) {
                let num = Number(kw.substring(4)) || 0
                stack[0].push(mapPatterns.escape)
                stack[0].push(toNum(num))
            }
            // num literal
            else if (kw.match(/^[0-9\.\-]+(e[0-9\.\-]+)?$/)) {
                let num = Number(kw) || 0
                stack[0].push(toNum(num))
            }

            // special: mask
            else if (kw.match(/^mask_[-v]+$/)) {
                let seq = [],
                    line = true,
                    start = 'EAST'
                if (kw[5] === 'v') {
                    line = false
                    seq.push('a')
                    start = 'SOUTH_EAST'
                }
                for (let c of kw.substring(6)) {
                    if (c === '-') {
                        seq.push(line ? 'w' : 'e')
                        line = true
                    } else {
                        seq.push(line ? 'ea' : 'da')
                        line = false
                    }
                }
                stack[0].push(toPattern(seq.join(''), start))
            }

            // vec literals
            else if (kw.startsWith('vec')) {
                let raw = kw.split('_')
                let nums = [1, 2, 3].map(x => Number(raw[x]) || 0)
                // TODO use builtin consts
                stack[0].push(toVec(nums))
            }

            // type literal
            else if (kw.startsWith('type_')) {
                let type = kw.substring(kw.indexOf('_') + 1)
                if (type.indexOf(':') < 0) type = 'hexcasting:' + type
                stack[0].push(toType(type))
            } else if (kw.startsWith('type/entity_')) {
                let type = kw.substring(kw.indexOf('_') + 1)
                if (type.indexOf(':') < 0) type = 'minecraft:' + type
                stack[0].push(toEntityType(type))
            }

            // custom pattern
            else if (kw.match(/^_[wedsaq]*/)) {
                stack[0].push(toPattern(kw.substring(1), 'EAST'))
            }

            // else
            else {
                Utils.server.tell(`unknown keyword: ${kw}`)
            }
        }

        return toList(stack[0])
    }
    let iota2str = (i, level, root) => {
        if (i.list) {
            let inner = i.list.list.map(x => iota2str(x, level))
            inner = inner.join(',')
            return root ? inner : `[${inner}]`
        } else if (i.pattern) {
            let angleSeq = i.pattern.anglesSignature()
            try {
                if (angleSeq in specialPatternSeq) return specialPatternSeq[angleSeq]
                let pair = PRClass.matchPatternAndID(i.pattern, level)
                let resKey = pair.second
                if (resKey == 'hexcasting:mask') {
                    return `mask_${pair.first.mask.map(x => 'v-'[Number(x)]).join('')}`
                } else if (resKey == 'hexcasting:number') {
                    // TODO num literal
                    throw null
                } else if (!(resKey in mapPatterns)) throw null // for special registers
                if (resKey.namespace === 'hexcasting') return resKey.path
                else return String(resKey)
            } catch (e) {}
            return `_${angleSeq}`
        } else if (i.double !== undefined) {
            return String(i.double)
        } else if (i.vec3) {
            let axes = []
            for (let sub of 'xyz') {
                axes.push(Math.round(i.vec3[sub]() * 1000) / 1000)
            }
            while (axes.length > 0 && axes[axes.length - 1] == 0) axes.pop()
            return 'vec' + axes.map(x => `_${x}`).join('')
        } else if (i.iotaType) {
            let key = HexIotaTypes.REGISTRY.getKey(i.iotaType)
            if (key.namespace === 'hexcasting') key = key.path
            return 'type_' + key
        } else if (i.entityType) {
            let key = Registry.ENTITY_TYPE.getKey(i.entityType)
            if (key.namespace === 'minecraft') key = key.path
            return 'type/entity_' + key
        }

        return 'UNKNOWN'
    }
    let player2focus = (/**@type {Player}*/ player) => {
        if (!player || !player.isPlayer()) return
        if (player.mainHandItem.id == 'hexcasting:focus') return player.mainHandItem
        else if (player.offhandItem.id == 'hexcasting:focus') return player.offhandItem
    }
    let injectItem = (target, nbt, rename) => {
        if (target) {
            let tag = new CompoundTag()
            tag.merge(nbt)
            target.orCreateTag.data = tag
            if (rename) {
                rename = String(rename).replace(/\\/g, '\\\\').replace(/\"/g, '\\"') // 统一按js string处理
                target.orCreateTag.display = { Name: `{"text":"${rename}"}` }
            }
        }
    }

    ServerEvents.commandRegistry(e => {
        const { commands: cmd, arguments: arg } = e

        let codeParser = ctx => {
            let nbt = str2nbt(arg.STRING.getResult(ctx, 'code'), ctx.source.entity)
            let rename = null
            try {
                rename = arg.STRING.getResult(ctx, 'rename')
            } catch (e) {}

            // parse to item
            let target = player2focus(ctx.source.entity)
            injectItem(target, nbt, rename)
            return 114514
        }
        let clipboardSendData = (ctx, duck) => {
            /**@type {Player}*/
            let player = ctx.source.entity
            if (!player.sendData) return 0

            let payload = {}
            try {
                payload.rename = arg.STRING.getResult(ctx, 'rename')
            } catch (e) {}
            if (duck) payload.duck = 1

            player.sendData('hexParse/clipboard/pull', payload)
            return 1919810
        }
        let readHandIota = (ctx, then) => {
            let target = player2focus(ctx.source.entity)
            if (!target) return 0
            let iotaRoot = target.item.readIota(target, ctx.source.level)
            if (iotaRoot) then(iotaRoot)
            return 1919810
        }

        e.register(
            cmd
                .literal('hexParse')
                .then(
                    cmd
                        .literal('load_clipboard')
                        .executes(clipboardSendData)
                        .then(cmd.argument('rename', arg.STRING.create(e)).executes(clipboardSendData)),
                )
                .then(
                    cmd
                        .literal('load_clipboard_ducky')
                        .executes(c => clipboardSendData(c, 1))
                        .then(cmd.argument('rename', arg.STRING.create(e)).executes(c => clipboardSendData(c, 1))),
                )
                .then(
                    cmd.literal('read').executes(ctx =>
                        readHandIota(ctx, iota => {
                            let toStr = iota2str(iota, ctx.source.level, 1)
                            ctx.source.entity.sendSystemMessage(
                                Text.gold('Result: ').append(Text.white(toStr)).clickCopy(toStr).hover('click to copy'),
                            )
                        }),
                    ),
                )
                .then(
                    cmd.literal('share').executes(ctx =>
                        readHandIota(ctx, iota => {
                            let toStr = iota2str(iota, ctx.source.level, 1)
                            // Client.player.tell(toStr)
                            ctx.source.server.tell(
                                Text.gold(ctx.source.entity.name)
                                    .append(Text.white(' shares: '))
                                    .append(iota.display())
                                    .append(' ')
                                    .append(Text.white('CLICK_COPY').underlined().clickCopy(toStr).hover('click to copy')),
                            )
                        }),
                    ),
                )
                .then(
                    cmd
                        .argument('code', arg.STRING.create(e))
                        .executes(codeParser)
                        .then(cmd.argument('rename', arg.STRING.create(e)).executes(codeParser)),
                ),
        )
    })

    NetworkEvents.dataReceived('hexParse/clipboard/push', e => {
        let { code, rename } = e.data
        let nbt = str2nbt(code, e.player)
        let item = player2focus(e.player)
        injectItem(item, nbt, rename)
    })
}
