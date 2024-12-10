global.perWorldPatterns = []

StartupEvents.registry('hexcasting:action', e => {
    function registerPatternWrap(seq, dir, id, isGreat, options) {
        isGreat = !!isGreat
        if (!id in global.PatternOperateMap) throw new Error('missing operate: ' + id)
        let resourceKey = 'yc:' + id
        if (isGreat) global.perWorldPatterns.push(resourceKey)
        let pattern = HexPattern.fromAngles(seq, dir)
        e.custom(resourceKey, ActionRegistryEntry(pattern, new ActionJS(id, pattern, options)))
        // patchouli entry
        global.HexPatchouliGen.add(resourceKey, isGreat)
    }

    registerPatternWrap('aaqawawaeadaadadadaadadadaada', HexDir.EAST, 'floodfill', 1)
    registerPatternWrap('wwaqqqqqedwdwwwaw', HexDir.EAST, 'charge_media', 1)
    registerPatternWrap('eqaawawaeqqqaawdwdwaw', HexDir.SOUTH_WEST, 'charge_media/wisp', 1)
    registerPatternWrap('eaqwqaewwaqawdwaqaw', HexDir.SOUTH_WEST, 'charge_media/circle', 1)
    registerPatternWrap('aaddwdwdqdwd', HexDir.NORTH_WEST, 'punch_entity')
    registerPatternWrap('wqqwqwqaeqeeedqqeaqadedaqaedeqqeqedeqeaqeqaqedeadeaqwqwqaeda', HexDir.EAST, 'brain_merge', 1)
    registerPatternWrap('qwewewewewewdqeeeeedwwwawwqwwqwwwdedwwwqwwqwwwded', HexDir.EAST, 'crystalize', 1)

    // registerPatternWrap('wewewewewewweeqeeqeeqeeqeeqee', HexDir.WEST, 'refresh_depth', 1)
    registerPatternWrap('waawweeeeedd', HexDir.SOUTH_WEST, 'mind_stack/push')
    registerPatternWrap('wqaqwweeeee', HexDir.SOUTH_WEST, 'mind_stack/pop')
    registerPatternWrap('waawweeeeewaa', HexDir.SOUTH_WEST, 'mind_stack/size')
    registerPatternWrap('waawweeeeaaeaeaeaeaw', HexDir.SOUTH_WEST, 'mind_patterns')
    registerPatternWrap('waawweeeeewdewqa', HexDir.SOUTH_WEST, 'mind_patterns/clear')
    registerPatternWrap('waawedaqqqqdeaqq', HexDir.SOUTH_WEST, 'mind_env/schedule')

    registerPatternWrap('wdwawedqdewawdw', HexDir.SOUTH_WEST, 'nested_modify')
})
