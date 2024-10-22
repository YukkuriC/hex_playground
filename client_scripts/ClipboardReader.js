NetworkEvents.dataReceived('hexParse/clipboard/pull', e => {
    let clipboard = String(Client.keyboardHandler.clipboard)
    if (e.data.duck) {
        let seqs = []
        clipboard.replace(/"[qweasd]+"/g, match => {
            seqs.push('_' + match.substring(1, match.length - 1))
        })
        clipboard = seqs.join(',')
    }
    if (clipboard && clipboard.length > 0) {
        Client.player.sendData('hexParse/clipboard/push', {
            code: clipboard,
            rename: e.data.rename,
        })
    }
})
