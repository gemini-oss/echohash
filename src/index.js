var wordList = require('./wordlists/en_eff_long')
var bigInt = require('big-integer')
var crypto = require('crypto-js')
var chunk = require('lodash/chunk')

module.exports = {
    generate: generate,
}

function generate (s) {
    var encrypted = crypto.SHA256(crypto.enc.Utf8.parse(s))
    return bigInt2Wordlist(buf2BigInt(encrypted))
}

function bigInt2Wordlist (largeNum) {
    var base = wordList.length
    var res = []
    var acc = largeNum

    while (acc.isPositive() && (res.length * Math.log2(base) < 128)) {
        var x = acc.divmod(base)
        acc = x.quotient
        res.push(wordList[x.remainder.toJSNumber()])
    }

    return res
}

function buf2UInt32Array (buffer) {
    var hex = buffer.toString(crypto.enc.Hex)
    return chunk(hex.split(''), 8).map(function (c) {
        return parseInt(c.join(''), 16)
    })
}

function buf2BigInt (buffer) {
    var ints = buf2UInt32Array(buffer)
    var maxUint32 = bigInt(2).pow(32).minus(1)
    var res = bigInt(0)

    for (var i = 0; i < ints.length; i++) {
        res = res.multiply(maxUint32).plus(ints[i])
    }

    return res
}
