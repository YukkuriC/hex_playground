// requires: hexoverpowered
{
    let RATIO_REGEN_TO_MAX = 2e-2
    let RATIO_OVER_REGEN_TO_MAX = 0 // disabled passive exponential gen
    let RATIO_CAST_TO_MAX = 0
    let RATIO_CAST_TO_REGEN = 2e-3
    let RATIO_HURT_TO_MAX = 1000
    let REGEN_CAP = 4e8
    let MAX_CAP = 4e9
    let KEY_TRAINING = 'hexop_training'

    /**
     * @param {Internal.$ServerPlayer} player
     * @returns {Internal.$CompoundTag}
     */
    let getTrainingMap = (player) => {
        let pdata = player.getPersistentData()
        if (!pdata.training_media?.put) {
            pdata.training_media = {}
        }
        return pdata.training_media
    }

    /**
     * @param {Internal.$ServerPlayer} player
     */
    let refreshPersonalMana = player => {
        let map = getTrainingMap(player)
        if (map.max) player.modifyAttribute(HexOPAttributes.PERSONAL_MEDIA_MAX, KEY_TRAINING, map.getDouble('max'), 'add_value')
        if (map.regen) player.modifyAttribute(HexOPAttributes.PERSONAL_MEDIA_REGEN, KEY_TRAINING, map.getDouble('regen'), 'add_value')
    }

    let modifyTraining = (player, max, regen) => {
        let map = getTrainingMap(player)
        let curMax = map.getDouble('max')
        let curRegen = map.getDouble('regen')
        map.max = Math.min(curMax + max * Math.max(0, 1 - curMax / MAX_CAP), MAX_CAP)
        map.regen = Math.min(curRegen + regen * Math.max(0, 1 - curRegen / REGEN_CAP), REGEN_CAP)
        refreshPersonalMana(player)
    }

    // reset all events
    PersonalManaEvents.resetAll()

    // excess regen adds max
    PersonalManaEvents.AddOnInsert(e => {
        modifyTraining(e.player, e.actual * RATIO_REGEN_TO_MAX + e.dropped * RATIO_OVER_REGEN_TO_MAX, 0)
    })

    // successful usage adds regen
    PersonalManaEvents.AddOnExtract(e => {
        modifyTraining(e.player, e.actual * RATIO_CAST_TO_MAX, e.actual * RATIO_CAST_TO_REGEN)
    })

    // overcast adds max
    EntityEvents.afterHurt(e => {
        let { player, source } = e
        if (player && source.getType() == 'hexcasting.overcast') {
            modifyTraining(player, RATIO_HURT_TO_MAX * Math.min(e.damage, player.maxHealth / 2), 0)
        }
    })

    // init on load
    PlayerEvents.respawned(e => refreshPersonalMana(e.player))
    PlayerEvents.loggedIn(e => refreshPersonalMana(e.player))
}
