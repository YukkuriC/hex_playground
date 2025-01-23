// chain block breaking
{
    let MAX_CHAIN = 4096
    let DELTA_DIRS = []
    for (let d of [-1, 1]) {
        DELTA_DIRS.push([d, 0, 0], [0, d, 0], [0, 0, d])
        for (let d2 of [-1, 1]) {
            DELTA_DIRS.push([d, d2, 0], [0, d, d2], [d2, 0, d])
        }
    }

    /**
     * general helper
     * @param { Internal.Level } level
     * @param { BlockPos } blockPos
     * @param { (block:Internal.BlockContainerJS) => boolean } predicate
     * @param { (block:Internal.BlockContainerJS) => void } callback
     */
    global.FloodFillBlocks = (level, blockPos, predicate, callback) => {
        let blockQueue = [blockPos]
        let visited = new Set()
        visited.add(blockPos.hashCode())
        for (let _ = 0; _ < MAX_CHAIN && blockQueue.length > 0; ) {
            let pos = blockQueue.shift()
            let { x, y, z } = pos
            let bb = level.getBlock(pos)
            if (!predicate(bb)) continue
            callback(bb)
            _++

            // dfs
            for (let delta of DELTA_DIRS) {
                let [i, j, k] = delta
                let newPos = new BlockPos(x + i, y + j, z + k)
                let newKey = newPos.hashCode()
                if (!visited.has(newKey)) {
                    visited.add(newKey)
                    blockQueue.push(newPos)
                }
            }
        }
    }
}
/**
 * check crop age
 * @param { Internal.CropBlock } block
 * @param { Internal.BlockState } state
 */
global.CanHarvest = (block, state) => {
    if (block.isMaxAge && block.isMaxAge(state)) return true
    for (const prop of state.getProperties()) {
        if (!prop instanceof IntegerProperty) continue
        if (prop.getName() != 'age') continue
        /** @type { Internal.IntegerProperty }*/
        let intProp = prop
        let age = state.getValue(intProp)
        let maxAge = intProp.getPossibleValues().size() - 1
        if (age == maxAge) return true
    }
    return false
}

global.shuffleList = list => {
    for (let f = list.length - 1; f > 0; f--) {
        let t = Math.floor((1 + f) * Math.random())
        if (f !== t) {
            let swap = list[f]
            list[f] = list[t]
            list[t] = swap
        }
    }
}

// get new nashorn env
if (this.HexCapabilities) {
    let NSFactory = Java.class.forName('org.openjdk.nashorn.api.scripting.NashornScriptEngineFactory').getConstructor().newInstance()
    global.createNashorn = () => NSFactory.getScriptEngine()
}
