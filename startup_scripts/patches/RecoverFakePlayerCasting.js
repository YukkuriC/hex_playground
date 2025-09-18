// works since 0.11.2-pre-739
// running on versions before gives extra 20 dust
{
    let CastingEnvironment = Java.loadClass('at.petrak.hexcasting.api.casting.eval.CastingEnvironment')
    let CastingEnvironmentComponent = Java.loadClass('at.petrak.hexcasting.api.casting.eval.CastingEnvironmentComponent')
    let FakePlayer =
        Java.tryLoadClass('net.minecraftforge.common.util.FakePlayer') || Java.loadClass('net.fabricmc.fabric.api.entity.FakePlayer')
    let key = new JavaAdapter(CastingEnvironmentComponent.Key, {})
    /**@type {Internal.CastingEnvironmentComponent.ExtractMedia.Pre} */
    let protoComp = {
        onExtractMedia(cost, simulate) {
            return Long.valueOf(String(Math.max(0, cost - 200000)))
        },
        getKey() {
            return key
        },
    }
    StartupEvents.postInit(e => {
        CastingEnvironment['addCreateEventListener(java.util.function.BiConsumer)']((env, data) => {
            if (!(env.caster instanceof FakePlayer)) return
            env.addExtension(
                new JavaAdapter(CastingEnvironmentComponent.ExtractMedia.Pre, {
                    caster: env.caster,
                    __proto__: protoComp,
                }),
            )
        })
    })
}
