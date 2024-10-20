global.HexPatchouliGen = {
    paths: {
        lang: 'kubejs/assets/hex_playground/lang/zh_cn.json',
        normal: 'patchouli_books/thebook/en_us/entries/normal.json',
        perWorld: 'patchouli_books/thebook/en_us/entries/per_world.json',
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
    genAll() {
        let entryNormal = this.read('normal')
        let entryPerWorld = this.read('perWorld')
        entryNormal.pages = []
        entryPerWorld.pages = []
        let langMap = this.read('lang')

        // fill missing data
        let keySeq = Array.from(this.overallMap).sort()
        for (let id of keySeq) {
            let page = this.genPage(id)
            if (!(id in langMap)) langMap[page.text] = 'TODO ' + page.text
            ;(this.normalMap.has(id) ? entryNormal : entryPerWorld).pages.push(page)
        }

        // save data
        this.write('normal', entryNormal)
        this.write('perWorld', entryPerWorld)
        this.write('lang', langMap)
    },
}
