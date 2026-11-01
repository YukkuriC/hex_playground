;(() => {
    let {
        IotaJS,
        APIFlat: {},
    } = HexJS

    // simple hue cycle
    let hue = 0
    let cycleColor = () => {
        hue = (hue + 0.001) % 6
        let r = 0,
            g = 0,
            b = 0
        if (hue < 1) {
            b = Math.floor((1 - hue) * 255)
            r = 255
        } else if (hue < 2) {
            r = 255
            g = Math.floor((hue - 1) * 255)
        } else if (hue < 3) {
            r = Math.floor((3 - hue) * 255)
            g = 255
        } else if (hue < 4) {
            g = 255
            b = Math.floor((hue - 3) * 255)
        } else if (hue < 5) {
            g = Math.floor((5 - hue) * 255)
            b = 255
        } else if (hue < 6) {
            b = 255
            r = Math.floor((hue - 5) * 255)
        }
        return 0xff000000 + r * 65536 + g * 256 + b
    }

    this.PotionIota = IotaJS.type('yc:potion')
        .setDisplay(iota => {
            let { data } = iota
            let [namespace, path] = data.getString('id').split(':')
            if (!path) {
                path = namespace
                namespace = 'minecraft'
            }
            let lang = Text.translate(`effect.${namespace}.${path}`)
            let amp = data.getInt('amp')

            let ret = lang
            if (amp > 0) ret = ret.append(Text.gold(` +${amp}`))
            return Text.translate('hexcasting.tooltip.yc:potion', ret).blue()
        })
        .setOperate(true, false, action => {
            action.setOperate((env, image, cont) => {
                let player = env.castingEntity
                if (!player) return
                let { data } = action
                player.potionEffects.add(data.getString('id'), 1200, data.getInt('amp'))
            })
        })
        .setColor(cycleColor)
})()
