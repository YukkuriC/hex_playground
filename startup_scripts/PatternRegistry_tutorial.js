function MyActionClass(isGreat, id) {
    this.operate = (continuation, stack, ravenmind, ctx) => {
        try {
            return global.operateMap[id](continuation, stack, ravenmind, ctx) ?? OperationResult(continuation, stack, ravenmind, [])
            // 此默认值是为了以后更多无副作用的符文省去例行公事
        } catch (e) {
            // 事故则收入副作用列表
            if (e instanceof Mishap)
                return OperationResult(continuation, stack, ravenmind, [
                    OperatorSideEffect.DoMishap(e, Mishap.Context(HexPattern(HexDir.WEST, []), null)),
                ])
            // 否则抛出
            throw e
        }
    }
    this.isGreat = () => isGreat
    let _displayName = Text.translate(`hexcasting.spell.kubejs:${id}`).gold()
    this.getDisplayName = this.displayName = () => _displayName
}
MyActionClass.prototype = {
    alwaysProcessGreatSpell: () => true,
    causesBlindDiversion: () => true,
}

global.operateMap = {
    do_punch: (continuation, stack, ravenmind, ctx) => {
        if (stack.length < 2) throw MishapNotEnoughArgs(2, stack.length)
        // 倒序弹出实体和数字iota
        let iotaDamage = stack.pop()
        let iotaEntity = stack.pop()
        // 理论上可以loadClass再instanceof判断iota类型，摆了直接用对应获取数据方法拿到的是否是undefined判断了
        // 注：此处iota.xxx等价于原始方法iota.getXxx()，是kjs自动转换的
        let damage = iotaDamage.double,
            entity = iotaEntity.entity
        if (damage === undefined) throw MishapInvalidIota.of(iotaDamage, 0, 'class.double')
        // 因为要锤人，确保被锤的有受击方法，对应方法似乎1.20还是1.21改名成hurt了
        if (entity?.attack === undefined) throw MishapInvalidIota.of(iotaEntity, 1, 'class.entity')

        // TODO 真的锤
        ctx.caster.tell(`将要锤 ${entity.name.string} ${damage} 伤害`)
        return OperationResult(continuation, stack, ravenmind, [])

        // 开锤
        let src = DamageSource.playerAttack(ctx.caster)
        victim.attack(src, damage)

        //
        let sideEffects = [OperatorSideEffect.Particles(ParticleSpray.burst(victim.position(), damage / 20, damage * 2))]
    },
}
function lazyMapPattern(pattern, id, isGreat) {
    // 删去执行函数输入
    PatternRegistry.mapPattern(pattern, ResourceLocation('kubejs', id), new MyActionClass(isGreat, id), isGreat)
}
StartupEvents.postInit(() => {
    lazyMapPattern(HexPattern.fromAngles('wwawawwdeeeee', HexDir.SOUTH_WEST), 'do_punch', false)
})
