ServerEvents.commandRegistry(e => {
    const { commands: cmd, arguments: arg } = e
    e.register(
        cmd.literal('hexcasting').then(
            cmd.literal('reloadCustomPatterns').executes(ctx => {
                let server = ctx.source.server
                server.runCommand('kjs reload startup_scripts')
                server.runCommand('hexcasting recalcPatterns')
                global.loadCustomPatterns()
                server.runCommand('reload')
                return 114514
            }),
        ),
    )
})
