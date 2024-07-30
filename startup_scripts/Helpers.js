// chain block breaking
const MAX_CHAIN = 4096

/**
 * general helper
 * @param { Internal.Level } level
 * @param { {x:number; y:number; z:number} } blockPos
 * @param { (block:Internal.BlockContainerJS) => boolean } predicate
 * @param { (block:Internal.BlockContainerJS) => void } callback
 */
function FloodFillBlocks(level, blockPos, predicate, callback) {
    const blockQueue = [blockPos]
    const visited = new Set()
    visited.add(`${blockPos.x},${blockPos.y},${blockPos.z}`)
    for (let _ = 0; _ < MAX_CHAIN && blockQueue.length > 0; ) {
        let { x, y, z } = blockQueue.pop()
        let bb = level.getBlock(x, y, z)
        if (!predicate(bb)) continue
        callback(bb)
        _++

        // dfs
        for (let i = -1; i <= 1; i++)
            for (let j = -1; j <= 1; j++)
                for (let k = -1; k <= 1; k++) {
                    if (!i && !j && !k) continue
                    let newPos = { x: x + i, y: y + j, z: z + k }
                    let newKey = `${newPos.x},${newPos.y},${newPos.z}`
                    if (!visited.has(newKey)) {
                        visited.add(newKey)
                        blockQueue.push(newPos)
                    }
                }
    }
}
/**
 * helper general break block
 * @param { Internal.Level } level
 * @param { Internal.BlockContainerJS } block
 */
function BreakBlock(level, block) {
    if (!block) return
    for (const d of block.getDrops() ?? []) block.popItem(d)
    level.removeBlock(block.pos, true)
}

global.FloodFillBlocks = FloodFillBlocks
global.BreakBlock = BreakBlock
