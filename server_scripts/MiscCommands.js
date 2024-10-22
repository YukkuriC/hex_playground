ServerEvents.commandRegistry(e => {
    const { commands: cmd, arguments: arg } = e
    e.register(
        cmd.literal('hexcasting').then(
            cmd.literal('reloadCustomPatterns').executes(ctx => {
                let server = ctx.source.server
                server.runCommand('kjs reload startup_scripts')
                global.loadCustomPatterns()
                server.runCommand('hexcasting recalcPatterns')
                server.runCommand('reload')
                return 114514
            }),
        ),
    )

    let doGenPatchouli = reorder => {
        global.loadCustomPatterns()
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
