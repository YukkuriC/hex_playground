ServerEvents.commandRegistry(e => {
    const { commands: cmd, arguments: arg } = e

    let doGenPatchouli = reorder => {
        global.HexPatchouliGen.genAll(reorder)
        Utils.server.tell('gen success!')
        return 114514
    }
    e.register(
        cmd.literal('hexcasting').then(
            cmd
                .literal('patchouli')
                .executes(() => doGenPatchouli(false))
                .then(cmd.literal('reorder').executes(() => doGenPatchouli(true))),
        ),
    )
})
