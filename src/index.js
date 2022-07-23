const deepmerge = require('deepmerge')
const { Type } = require('@jedmud/tui-elements')
const defaultOptions = require('../options.json')
const defaultGauge = require('../gauge.json')

require('colors')

module.exports = class extends Type {
    construct() {
        this.stats = []
        this.gauges = {}

        this.mergeOptions(defaultOptions)

        const placeholders = []

        for (const gauge of this.options.gauges) {
            this.gauges[gauge.name] = deepmerge(defaultGauge, gauge)

            placeholders.push({
                name: gauge.name,
                full: 100,
                fill: 0,
            })
        }

        this.set(placeholders)

        this.count = Object.keys(this.gauges).length
    }

    set(stats) {
        this.stats = stats

        return this
    }

    write() {
        let rows = []

        switch(this.options.axis) {
            case 'horizontal':
                rows = this.horisontal()
                break
            case 'vertical':
                rows = this.vertical()
                break
        }

        this.print(rows)
    }

    vertical() {
        const full = this.config.params.width

        return this.normalize(full)
    }

    horisontal() {
        const full = Math.floor(this.config.params.width / this.count) - 1
        const items = this.normalize(full)

        return [items.join(' ')]
    }

    normalize(full) {
        const items = []

        for (const stat of this.stats) {
            const gauge = this.gauges[stat.name]
            const fill = Math.floor(((stat.fill * 100 / stat.full) / 100) * full)

            items.push(this.fill(fill, gauge.chr)[gauge.fg] + this.fill(full - fill, gauge.chr)[gauge.bg])
        }

        return items
    }

    fill(length, chr) {
        return Array(length + 1).join(chr)
    }
}
