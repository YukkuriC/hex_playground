const TARGETS = new Set(['yc:hoe', 'yc:pickaxe', 'yc:axe', 'yc:shovel'])

/**
 * @param { Internal.PlayerInteractEvent$RightClickBlock } e
 * @returns
 */
function OnUseTools(e) {
    const { level, itemStack } = e
    if (level.clientSide || !TARGETS.has(String(itemStack.id))) return
    const block = level.getBlock(e.pos)
    const { x, y, z } = e.pos
    /** @type Internal.Player */
    const player = e.getEntity()
    const isShift = player.isShiftKeyDown()
    /** @type Internal.BlockContainerJS[] */
    const blockTargets = []

    switch (itemStack.id) {
        case 'yc:hoe':
            if (isShift) {
                let msg = `block: ${block}`
                if (block?.entityData) msg += `\ndata: ${block?.entityData}`
                level.tell(msg)
            }
            for (let i = x - 2; i <= x + 2; i++)
                for (let j = y - 1; j <= y + 1; j++)
                    for (let k = z - 2; k <= z + 2; k++) {
                        let newPos = new BlockPos(i, j, k)
                        let bb = level.getBlock(newPos)
                        if (!bb) continue
                        let state = bb.blockState

                        let simpleIsTillable =
                            bb.id == 'minecraft:dirt' ||
                            bb.id == 'minecraft:dirt_path' ||
                            bb.id == 'minecraft:grass_block' ||
                            bb.id == 'minecraft:mycelium' ||
                            bb.id == 'minecraft:podzol'

                        // grow crops
                        /** @type Internal.CropBlock */
                        let bbb = state.block
                        if (!isShift) {
                            if (bbb.isValidBonemealTarget) {
                                if (bbb.isValidBonemealTarget(level, newPos, state, false)) {
                                    bbb.performBonemeal(level, level.random, newPos, state)
                                }
                            }
                            if (
                                (state.getCollisionShape(level, newPos).isEmpty() || bbb instanceof $CocoaBlock) &&
                                CanHarvest(bbb, state, level)
                            ) {
                                let res = BreakBlock(level, bb, player, true)
                                if (res) {
                                    for (const i of res) {
                                        block.up.popItem(i)
                                    }
                                }
                            }
                        }

                        // till dirt
                        if (
                            isShift &&
                            (!bb.up || level.getBlockState(newPos.above()).getCollisionShape(level, newPos.above()).isEmpty()) &&
                            simpleIsTillable
                        ) {
                            level.destroyBlock(newPos, false)
                            level.runCommandSilent(`setblock ${newPos.x} ${newPos.y} ${newPos.z} minecraft:farmland[moisture=7]`)
                        }

                        // nbt
                        let data = bb.entityData
                        if (data) {
                            let manaMax = data.manaCap
                            if (manaMax) level.runCommandSilent(`data merge block ${newPos.x} ${newPos.y} ${newPos.z} {mana: ${manaMax}}`)
                        }
                    }
            return

        case 'yc:pickaxe':
            if (!block?.popItem) return
            for (let i = x - 2; i <= x + 2; i++)
                for (let j = -64; j <= 256; j++)
                    for (let k = z - 2; k <= z + 2; k++) {
                        let bb = level.getBlock(i, j, k)
                        if (bb) global.EVENT_BUS.post(new $BreakEvent(level, bb.pos, bb.blockState, player))
                        let shouldKeep = bb && (bb.hasTag('forge:ores') /* || bb.inventory */ || (isShift && Math.random() < 0.1))
                        if (!shouldKeep) continue
                        for (const d of bb.getDrops() ?? []) block.popItem(d)
                        // if (bb.inventory) for (const i of bb.inventory.allItems) block.popItem(i)
                    }
            return

        case 'yc:axe':
            if (!block) return
            /** @type Internal.BlockContainerJS[] */
            let hasLeaves = false
            FloodFillBlocks(
                level,
                block.pos,
                bb => {
                    if (!bb) return false
                    if (!(bb.hasTag('minecraft:logs') || bb.hasTag('minecraft:leaves'))) return false
                    if (bb.hasTag('minecraft:leaves')) hasLeaves = true
                    return true
                },
                bb => blockTargets.push(bb),
            )
            if (blockTargets.length > 1 && hasLeaves) for (const bb of blockTargets) BreakBlock(level, bb, player)
            return

        case 'yc:shovel':
            for (let i = x - 1; i <= x + 1; i++)
                for (let j = y - 1; j <= y + 1; j++)
                    for (let k = z - 1; k <= z + 1; k++) {
                        let bb = level.getBlock(i, j, k)
                        if (bb.entityData || bb.inventory) {
                            level.tell(`danger at ${bb.pos}`)
                            return
                        }
                        blockTargets.push(bb)
                    }
            for (const bb of blockTargets) BreakBlock(level, bb, player)

            return
    }
}

global.OnUseTools = OnUseTools
