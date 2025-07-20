// requires: hexoverpowered
{
    let RATIO_REGEN_TO_MAX = 2e-2
    let RATIO_OVER_REGEN_TO_MAX = 1e-5
    let RATIO_CAST_TO_REGEN = 2e-3
    let RATIO_HURT_TO_MAX = 1000
    let KEY_TRAINING = 'hexop_training'

    /**
     * @param {Internal.ServerPlayer} player
     * @returns {{max?:number; regen?:number}}
     */
    let getTrainingMap = (/**@type {Internal.ServerPlayer}*/ player) => {
        let pdata = player.getPersistentData()
        if (!pdata.training_media?.put) {
            pdata.training_media = {}
        }
        return pdata.training_media
    }

    /**
     * @param {Internal.ServerPlayer} player
     */
    let refreshPersonalMana = player => {
        let map = getTrainingMap(player)
        if (map.max) player.modifyAttribute(HexOPAttributes.PERSONAL_MEDIA_MAX, KEY_TRAINING, map.max, 'addition')
        if (map.regen) player.modifyAttribute(HexOPAttributes.PERSONAL_MEDIA_REGEN, KEY_TRAINING, map.regen, 'addition')
    }

    let modifyTraining = (player, max, regen) => {
        let map = getTrainingMap(player)
        if (max) map.max = (map.max || 0) + max
        if (regen) map.regen = (map.regen || 0) + regen
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
        modifyTraining(e.player, 0, e.actual * RATIO_CAST_TO_REGEN)
    })

    // overcast adds max
    EntityEvents.hurt(e => {
        let { player, source } = e
        if (player && source.getType() == 'hexcasting.overcast') {
            modifyTraining(player, RATIO_HURT_TO_MAX * e.damage, 0)
        }
    })

    // init on load
    PlayerEvents.respawned(e => refreshPersonalMana(e.player))
    PlayerEvents.loggedIn(e => refreshPersonalMana(e.player))
}
