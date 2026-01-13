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
            else SCOPE[root.substring(root.lastIndexOf('.') + 1)] = Java.tryLoadClass(root)
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
                    _('projectile', ['SpectralArrow', 'EyeOfEnder']),
                    'raid.Raider',
                    _('npc', [
                        //
                        'AbstractVillager',
                        'Villager',
                        'VillagerTrades',
                    ]),
                ]),
            ]),
        ]),
        _('java', [_('lang', ['Long', 'Integer']), 'util.WeakHashMap']),
        _('at.petrak.hexcasting', [
            _('forge.cap', ['HexCapabilities', 'adimpl.CapStaticMediaHolder']),
            'xplat.IXplatAbstractions',
            'common.lib.hex.HexEvalSounds',
            _('api', [
                _('casting', [
                    'castables.Action',
                    'ActionRegistryEntry',
                    'ParticleSpray',
                    _('eval', [
                        'CastingEnvironmentComponent',
                        'OperationResult',
                        'vm.CastingVM',
                        _('sideeffects', ['EvalSound', 'OperatorSideEffect']),
                    ]),
                    _('iota', ['IotaType', 'NullIota', 'BooleanIota', 'Vec3Iota', 'ListIota', 'DoubleIota', 'PatternIota']),
                    _('mishaps', ['Mishap', 'MishapNotEnoughArgs', 'MishapInvalidIota', 'MishapAlreadyBrainswept', 'MishapBadLocation']),
                    _('math', ['HexDir', 'HexPattern']),
                ]),
            ]),
        ]),
    ]
    for (let root of roots) root.build()
}
