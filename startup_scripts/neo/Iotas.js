// requires: hexjsneo
;(() => {
    let {
        IotaJS,
        APIFlat: {},
    } = HexJS

    this.PotionIota = IotaJS.type('yc:potion')
        .setDisplay(data => {
            let [namespace, path] = data['id'].split(':')
            if (!path) {
                path = namespace
                namespace = 'minecraft'
            }
            let lang = Text.translate(`effect.${namespace}.${path}`)
            let amp = data['amp']

            let ret = lang
            if (amp > 0) ret = ret.append(Text.gold(` +${amp}`))
            return Text.translate('hexcasting.tooltip.yc:potion', ret).blue()
        })
        .setOperate(true, false, action => {
            action.setOperate((env, image, cont) => {
                let player = env.castingEntity
                if (!player) return
                let { data } = action
                player.potionEffects.add(data['id'], 1200, data['amp'] || 0)
                return []
            })
        })
})()
