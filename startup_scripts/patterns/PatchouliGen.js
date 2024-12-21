global.HexPatchouliGen = {
    paths: {
        lang: 'kubejs/assets/hex_playground/lang/zh_cn.json',
        lang_en: 'kubejs/assets/hex_playground/lang/en_us.json',
        normal: 'kubejs/assets/hexcasting/patchouli_books/thehexbook/en_us/entries/normal.json',
        perWorld: 'kubejs/assets/hexcasting/patchouli_books/thehexbook/en_us/entries/per_world.json',
    },
    overallMap: new Set(),
    normalMap: new Set(),
    perWorldMap: new Set(),
    genPage(id) {
        return {
            type: 'hexcasting:pattern',
            op_id: id,
            anchor: id,
            input: '',
            output: '',
            text: `book.descrip.${id}`,
        }
    },
    add(id, isPerWorld) {
        id = String(id)
        this[isPerWorld ? 'perWorldMap' : 'normalMap'].add(id)
        this.overallMap.add(id)
    },
    read(key) {
        return JsonIO.read(this.paths[key])
    },
    write(key, obj) {
        JsonIO.write(this.paths[key], obj)
    },
    tryAddLang(langMap, key) {
        if (!(key in langMap)) {
            langMap[key] = 'TODO ' + key
            return true
        }
    },
    genAll(reorder) {
        let entryNormal = this.read('normal')
        let entryPerWorld = this.read('perWorld')
        let pagesExist = {}
        for (let p of entryNormal.pages) pagesExist[p.op_id] = p
        for (let p of entryPerWorld.pages) pagesExist[p.op_id] = p
        if (reorder) {
            entryNormal.pages = []
            entryPerWorld.pages = []
        }
        let langMap = this.read('lang'),
            langMap_en = this.read('lang_en')
        let normapDocDirty = false,
            perWorldDocDirty = false,
            langMapDirty = false,
            langMapDirty_en = false

        // fill missing data
        let keySeq = Array.from(this.overallMap).sort()
        for (let id of keySeq) {
            let page = pagesExist[id] ?? this.genPage(id)
            langMapDirty |= this.tryAddLang(langMap, 'hexcasting.action.' + id)
            langMapDirty |= this.tryAddLang(langMap, page.text)
            langMapDirty_en |= this.tryAddLang(langMap_en, 'hexcasting.action.' + id)
            langMapDirty_en |= this.tryAddLang(langMap_en, page.text)
            if (reorder || !(id in pagesExist)) {
                if (this.normalMap.has(id)) {
                    entryNormal.pages.push(page)
                    normapDocDirty = true
                } else {
                    entryPerWorld.pages.push(page)
                    perWorldDocDirty = true
                }
            }
        }

        // save data
        if (normapDocDirty) this.write('normal', entryNormal)
        if (perWorldDocDirty) this.write('perWorld', entryPerWorld)
        if (langMapDirty) this.write('lang', langMap)
        if (langMapDirty_en) this.write('lang_en', langMap_en)
    },
}
