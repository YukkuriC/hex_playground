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

        // 真的锤
        let sideEffects = [
            // 先扣钱
            OperatorSideEffect.ConsumeMedia(Math.ceil(damage * 100)),
            // 再施法
            OperatorSideEffect.AttemptSpell(
                {
                    cast: () => {
                        ctx.caster.tell(`锤 ${entity.name.string} ${damage} 伤害`)
                        entity.attack(DamageSource.playerAttack(ctx.caster), damage)
                    },
                },
                true,
                true,
            ),
            // 施法成功再放粒子
            OperatorSideEffect.Particles(ParticleSpray.burst(entity.position(), damage / 20, damage * 2)),
        ]
        return OperationResult(continuation, stack, ravenmind, sideEffects)
    },
}
global.loadCustomPatterns_tutorial = () => {
    let actionLookup = global.getField(PatternRegistry, 'actionLookup', 1) // 反射拿字典
    function registerPatternWrap(seq, dir, id, isGreat) {
        isGreat = !!isGreat
        if (!id in global.PatternOperateMap) throw new Error('missing operate: ' + id)
        let resourceKey = ResourceLocation('kubejs', id)
        if (actionLookup.containsKey(resourceKey))
            // 忽有狂徒夜磨刀
            actionLookup.remove(resourceKey)
        PatternRegistry.mapPattern(
            //
            HexPattern.fromAngles(seq, dir),
            ResourceLocation('kubejs', id),
            new MyActionClass(isGreat, id),
            isGreat,
        )
    }

    // 以下为实际注册自定义法术位置
    registerPatternWrap('wwawawwdeeeee', HexDir.SOUTH_WEST, 'do_punch', false)
}
StartupEvents.postInit(global.loadCustomPatterns_tutorial)
