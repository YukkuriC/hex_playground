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
})
