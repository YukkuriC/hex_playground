global.loadCustomPatterns = () => {
    let actionLookup = global.getField(PatternRegistry, 'actionLookup', 1)
    function registerPatternWrap(seq, dir, id, isGreat) {
        isGreat = !!isGreat
        if (!id in global.PatternOperateMap) throw new Error('missing operate: ' + id)
        let resourceKey = ResourceLocation('yc', id)
        if (actionLookup.containsKey(resourceKey)) actionLookup.remove(resourceKey)
        PatternRegistry.mapPattern(HexPattern.fromAngles(seq, dir), resourceKey, new ActionJS(id, isGreat), isGreat)
        // patchouli entry
        global.HexPatchouliGen.add(resourceKey, isGreat)
    }

    registerPatternWrap('aaqawawaeadaadadadaadadadaada', HexDir.EAST, 'floodfill', 1)
    registerPatternWrap('wwaqqqqqedwdwwwaw', HexDir.EAST, 'charge_media', 1)
    registerPatternWrap('eqaawawaeqqqaawdwdwaw', HexDir.SOUTH_WEST, 'charge_media/wisp', 1)
    registerPatternWrap('aaddwdwdqdwd', HexDir.NORTH_WEST, 'punch_entity')
    registerPatternWrap('wqqwqwqaeqeeedqqeaqadedaqaedeqqeqedeqeaqeqaqedeadeaqwqwqaeda', HexDir.EAST, 'brain_merge', 1)
    registerPatternWrap('qwewewewewewdqeeeeedwwwawwqwwqwwwdedwwwqwwqwwwded', HexDir.EAST, 'crystalize', 1)

    registerPatternWrap('wewewewewewweeqeeqeeqeeqeeqee', HexDir.WEST, 'refresh_depth', 1)
    registerPatternWrap('waawweeeeedd', HexDir.SOUTH_WEST, 'mind_stack/push')
    registerPatternWrap('wqaqwweeeee', HexDir.SOUTH_WEST, 'mind_stack/pop')
    registerPatternWrap('waawweeeeewaa', HexDir.SOUTH_WEST, 'mind_stack/size')
    registerPatternWrap('waawweeeeaaeaeaeaeaw', HexDir.SOUTH_WEST, 'mind_patterns')
    registerPatternWrap('waawweeeeewdewqa', HexDir.SOUTH_WEST, 'mind_patterns/clear')

    registerPatternWrap('wdwawedqdewawdw', HexDir.SOUTH_WEST, 'nested_modify')

    registerPatternWrap('adadadadaqadadadada', HexDir.SOUTH_EAST, 'foo_nothing')
}
StartupEvents.postInit(global.loadCustomPatterns)
