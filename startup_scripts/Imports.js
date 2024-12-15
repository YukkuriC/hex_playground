// priority:10
{
    let SCOPE = this
    let _cls = function (path, children) {
        this.path = path
        this.subs = []
        if (children) this.add(children)
    }
    _cls.prototype = {
        add(children) {
            for (let c of children) {
                if (typeof c === 'string') c = _(c)
                this.subs.push(c)
            }
            return this
        },
        build(root) {
            root = root ? `${root}.${this.path}` : this.path
            if (this.subs.length > 0) for (let c of this.subs) c.build(root)
            else SCOPE[root.substring(root.lastIndexOf('.') + 1)] = Java.loadClass(root)
        },
    }
    let _ = (path, subs) => new _cls(path, subs)

    let roots = [
        _('net.minecraftforge', [
            //
            'common.util.LazyOptional',
        ]),
        _('net.minecraft', [
            _('sounds', ['SoundEvents', 'SoundSource']),
            _('world', [
                _('entity', [
                    'Mob',
                    _('projectile', ['AbstractArrow$Pickup', 'SpectralArrow', 'EyeOfEnder']),
                    _('npc', [
                        //
                        'AbstractVillager',
                        'Villager',
                        'VillagerTrades',
                    ]),
                ]),
                _('level.block', [
                    // legacy
                    'CocoaBlock',
                    'state.properties.IntegerProperty',
                ]),
            ]),
        ]),
        _('java', ['lang.Integer', 'util.WeakHashMap']),
        _('at.petrak.hexcasting', [
            _('forge.cap', ['HexCapabilities', 'adimpl.CapStaticMediaHolder']),
            'xplat.IXplatAbstractions',
            _('common', [
                //
                'lib.hex.HexIotaTypes',
                'misc.Brainsweeping',
            ]),
        ]),
        _('at.petrak.hexcasting.api', [
            'PatternRegistry',
            'misc.HexDamageSources',
            _('spell', [
                _('math', ['HexDir', 'HexPattern']),
                'Action',
                'OperationResult',
                'ParticleSpray',
                _('casting', [
                    //
                    'CastingContext',
                    'CastingHarness',
                    'sideeffects.OperatorSideEffect',
                ]),
                _('mishaps', [
                    //
                    'Mishap',
                    'MishapNotEnoughArgs',
                    'MishapInvalidIota',
                    'MishapAlreadyBrainswept',
                ]),
                _('iota', [
                    // 'Iota',
                    'Vec3Iota',
                    'ListIota',
                    'DoubleIota',
                    'NullIota',
                    'PatternIota',
                ]),
            ]),
        ]),
    ]
    for (let root of roots) root.build()
}

global.EVENT_BUS = ForgeEvents.eventBus()
