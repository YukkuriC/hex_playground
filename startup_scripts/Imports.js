// priority:10
{
    let SCOPE = this
    let _cls = function (path) {
        this.path = path
        this.subs = []
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
    let _ = path => new _cls(path)

    _('net.minecraft.world')
        .add([
            // TODO villagers
            _('level.block').add([
                // legacy
                'CocoaBlock',
                'state.properties.IntegerProperty',
            ]),
        ])
        .build()
    _('java.lang.Integer').build()
    _('at.petrak.hexcasting')
        .add([
            //
            'xplat.IXplatAbstractions',
        ])
        .build()
    _('at.petrak.hexcasting.api')
        .add([
            'PatternRegistry',
            _('spell').add([
                _('math').add(['HexDir', 'HexPattern']),
                'Action',
                'OperationResult',
                'ParticleSpray',
                _('casting').add([
                    //
                    'CastingContext',
                    'sideeffects.OperatorSideEffect',
                ]),
                _('mishaps').add([
                    //
                    'Mishap',
                    'MishapNotEnoughArgs',
                    'MishapInvalidIota',
                ]),
                _('iota').add([
                    // 'Iota',
                    'Vec3Iota',
                    'ListIota',
                ]),
            ]),
        ])
        .build()
}

global.EVENT_BUS = ForgeEvents.eventBus()
