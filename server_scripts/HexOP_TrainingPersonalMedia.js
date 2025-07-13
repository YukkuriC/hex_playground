// requires: hexoverpowered
{
    let RATIO_REGEN_TO_MAX = 1e-2
    let RATIO_OVER_REGEN_TO_MAX = 1e-6
    let RATIO_CAST_TO_REGEN = 1e-2
    let KEY_TRAINING = 'hexop_training'

    /**
     * @param {Internal.ServerPlayer} player
     * @returns {{max?:number; regen?:number}}
     */
    let getTrainingMap = (/**@type {Internal.ServerPlayer}*/ player) => {
        if (!player.persistentData.training_media?.put) {
            player.tell('wtf' + player.persistentData.training_media?.put)
            player.persistentData.training_media = {}
        }
        return player.persistentData.training_media
    }
    global.getTrainingMap = getTrainingMap

    /**
     * @param {Internal.ServerPlayer} player
     */
    let refreshPersonalMana = player => {
        let map = getTrainingMap(player)
        if (map.max) player.modifyAttribute(HexOPAttributes.PERSONAL_MEDIA_MAX, KEY_TRAINING, map.max, 'addition')
        if (map.regen) player.modifyAttribute(HexOPAttributes.PERSONAL_MEDIA_REGEN, KEY_TRAINING, map.regen, 'addition')
    }

    // reset all events
    PersonalManaEvents.resetAll()

    // excess regen adds max
    PersonalManaEvents.AddOnInsert(e => {
        let map = getTrainingMap(e.player)
        map.max = (map.max || 0) + e.actual * RATIO_REGEN_TO_MAX + e.dropped * RATIO_OVER_REGEN_TO_MAX
        e.player.tell(e.player.class) // TODO: why do I get LocalPlayer?
        refreshPersonalMana(e.player)
    })

    // successful usage adds regen
    PersonalManaEvents.AddOnExtract(e => {
        let map = getTrainingMap(e.player)
        map.regen = (map.regen || 0) + e.actual * RATIO_CAST_TO_REGEN
        refreshPersonalMana(e.player)
    })

    // init on load
    PlayerEvents.respawned(e => refreshPersonalMana(e.player))
    PlayerEvents.loggedIn(e => refreshPersonalMana(e.player))
}
