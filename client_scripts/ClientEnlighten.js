// ignored: true
// example script for client enlighten

{
    let oldAlt = false
    let mode = 'RUN'
    let LAVA_PATTERN = HexPattern.fromAngles('eaqawqadaqd', HexDir.EAST)
    let LAVA_SET = new Set()
    let LAVA_TARGETS =
        'dqawqaqwaqd|eawqadaqadq|eadedadewdq|dqaqedwedee|qwdedwaqwae|eedewdwedee|qqaqwawqaqq|qdedaqadaqd|qdwedadedae|qdaqadaqwae|qdewdedwaqd|eawqawdedwq|qwdewdwedwq|dqawdedwedq|aedadedaqae|ewaqwawqawe|aedwaqawqae|dqadaqadedq|aedadewdedq|eedewdeqaqd|eaqwaqawdea|dqaqedeqaqd|qdwedwaqawe|qqaqwaqedea|qdedwedadea|aedeqawqaqq|ewaqawdewdq|eaqadedadea|eaqawqadaqd|dqadaqwaqae|aedwedewdea|aedeqaqedea'.split(
            '|',
        )
    let postPattern = sig => {
        let pat = HexPattern.fromAngles(sig, HexDir.EAST)
        IClientXplatAbstractions.INSTANCE.sendPacketToServer(MsgNewSpellPatternC2S('OFF_HAND', pat, []))
    }

    let PATTERNS_MOTION = 'qaq|aadaa|wa|aqaaqawa|aqaaq|wdedw|waqaw|awqqqwaqw'.split('|')

    PlayerEvents.tick(e => {
        let newAlt = Screen.hasAltDown()
        if (newAlt && !oldAlt) {
            if (mode == 'COLLECT') {
                for (let i = 0; i < 1000; i++) {
                    let newPat = EulerPathFinder.findAltDrawing(LAVA_PATTERN, i, () => true)
                    LAVA_SET.add(String(newPat.anglesSignature()))
                }
                let msg = Array.from(LAVA_SET).join('|')
                e.player.tell(Text.of(msg).clickCopy(msg))
            } else {
                for (let pat of LAVA_TARGETS) postPattern(pat)
                for (let pat of PATTERNS_MOTION) postPattern(pat)
            }
        }
        oldAlt = newAlt
    })
}
