;(() => {
    let { ActionJS, ActionRegistryJS, Args } = HexJS
    let {
        //
        HexPattern,
        OperatorSideEffect,
        ParticleSpray,
    } = HexJS.APIFlat

    // example for editing stack & building spell action
    // from https://github.com/FallingColors/HexMod/blob/main/Common/src/main/java/at/petrak/hexcasting/api/casting/castables/SpellAction.kt
    let spellAlternative = ActionRegistryJS.of(
        HexPattern.fromAnglesUnchecked('assassass', 'WEST'),
        'hexjsneo:spell_action_alternative',
    ).setOperateMutableStack((stack, env) => {
        let takeANum = new Args(stack, 1).double(0)

        // precheck and throw first
        spellAlternative.preCheckMedia(env, takeANum)
        // spellAlternative.mediaCost = takeANum // changing media cost for auto-add ConsumeMedia side effect, or...
        let ret = [OperatorSideEffect.ConsumeMedia(takeANum)] // side effects inside return array will be accepted
        ret.push(
            OperatorSideEffect.AttemptSpell(
                // due to some deep dark causes, JS objects can be converted to KT interfaces seamlessly
                {
                    cast: envArg => {
                        env.castingEntity.tell(`env outside = ${env}; env inside = ${envArg}; cost = ${takeANum}`)
                    },
                },
                true,
                true,
            ),
        )

        // add particle spray(s)
        ret.push(OperatorSideEffect.Particles(ParticleSpray.burst(env.castingEntity.position(), 1, 1)))

        // optional: override casting sound (1 at max, more will mishap)
        ret.push(HexEvalSounds.THOTH.get())

        // return all weak-typed override array altogether
        return ret
    })

    // if ID not provided, it will be assigned as `hexjsneo:${pattern.anglesSignature()}`
    let testNester = ActionRegistryJS.of(HexPattern.fromAnglesUnchecked('assed', 'EAST')).setOperate((env, img, cont) => {
        let player = env.castingEntity
        return [114, [null, [player, [player.position(), [cont, [testNester.prototype, [true]]]]]]]
    })
})()
