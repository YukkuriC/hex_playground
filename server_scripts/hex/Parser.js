{
    let PatternRegistryPath = 'at.petrak.hexcasting.api.PatternRegistry'
    let PRClass = Java.loadClass(PatternRegistryPath)
    let PRRaw = global.loadRawClass(PatternRegistryPath)
    let Double = Java.loadClass('java.lang.Double')

    let mapStartDir = {}
    let mapLineDir = {}
    'NORTH_EAST,EAST,SOUTH_EAST,SOUTH_WEST,WEST,NORTH_WEST'.split(',').forEach((x, i) => (mapStartDir[x] = `${i}b`))
    Array.from('wedsaq').forEach((x, i) => (mapLineDir[x] = `${i}B`))
    let seq2bytes = seq =>
        Array.from(seq)
            .map(x => mapLineDir[x])
            .join(',')
    let toPattern = (seq, startDir) =>
        `{"hexcasting:data":{angles:[B;${seq2bytes(seq)}],start_dir:${mapStartDir[startDir]}},"hexcasting:type":"hexcasting:pattern"}`

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

    ServerEvents.commandRegistry(e => {
        const { commands: cmd, arguments: arg } = e
        const GetContainer = ctx => {
            /**@type {Player}*/
            let player = ctx.source.entity
            if (!player || !player.isPlayer()) return
            if (player.mainHandItem.id == 'hexcasting:focus') return player.mainHandItem
            else if (player.offhandItem.id == 'hexcasting:focus') return player.offhandItem
        }
        const toList = lst => `{"hexcasting:data":[${lst.join(',')}],"hexcasting:type":"hexcasting:list"}`
        const toNum = num => `{"hexcasting:data":${num}d,"hexcasting:type":"hexcasting:double"}`
        const toVec = nums =>
            `{"hexcasting:data":[L;${nums
                .map(x => Double.doubleToRawLongBits(x).toString() + 'L')
                .join(',')}],"hexcasting:type":"hexcasting:vec3"}`

        let codeParser = ctx => {
            let code = []
            String(arg.STRING.getResult(ctx, 'code')).replace(/\\|\(|\)|\[|\]|[\w\.\/\-\:]+/g, match => (code.push(match), ''))
            let rename = null
            try {
                rename = arg.STRING.getResult(ctx, 'rename')
            } catch (e) {}

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

                // vec literals
                else if (kw.startsWith('vec')) {
                    let raw = kw.split('_')
                    let nums = [1, 2, 3].map(x => Number(raw[x]) || 0)
                    // TODO use builtin consts
                    stack[0].push(toVec(nums))
                }

                // custom pattern
                else if (kw.match(/_[wedsaq]*/)) {
                    stack[0].push(toPattern(kw.substring(1), 'EAST'))
                }

                // else
                else {
                    Utils.server.tell(`unknown keyword: ${kw}`)
                }
            }

            // parse to item
            let target = GetContainer(ctx)
            if (target) {
                let fooItem = Item.of('hexcasting:focus', `{data:${toList(stack[0])}}`)
                target.orCreateTag.data = fooItem.nbt.data
                if (rename) {
                    rename = rename.replace('\\', '\\\\').replace('"', '\\"') // 这是Java String，不是js string
                    target.orCreateTag.display = { Name: `{"text":"${rename}"}` }
                }
            }
            return 114514
        }

        e.register(
            cmd
                .literal('hexParse')
                .then(
                    cmd.literal('read').executes(ctx => {
                        let target = GetContainer(ctx)
                        if (!target) return 0
                        let iotaRoot = target.item.readIota(target, ctx.source.level)

                        let iota2str = i => {
                            if (i.list) {
                                let inner = i.list.list.map(iota2str)
                                return `[${inner.join(',')}]`
                            } else if (i.pattern) {
                                // TODO pattern match
                                return `_${i.pattern.anglesSignature()}`
                            } else if (i.double !== undefined) {
                                return String(i.double)
                            } else if (i.vec3) {
                                let axes = []
                                for (let sub of 'xyz') {
                                    axes.push(Math.round(i.vec3[sub]() * 1000) / 1000)
                                }
                                while (axes.length > 0 && axes[axes.length - 1] == 0) axes.pop()
                                return 'vec' + axes.map(x => `_${x}`).join('')
                            }

                            return 'UNKNOWN'
                        }

                        let toStr = iota2str(iotaRoot)
                        ctx.source.entity.tell(Text.gold('Result: ').append(Text.white(toStr)).clickCopy(toStr))

                        return 1919810
                    }),
                )
                .then(
                    cmd
                        .argument('code', arg.STRING.create(e))
                        .executes(codeParser)
                        .then(cmd.argument('rename', arg.STRING.create(e)).executes(codeParser)),
                ),
        )
    })
}
