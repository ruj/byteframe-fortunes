const { readdir, readFileSync } = require('fs')
const { promisify } = require('util')
const { resolve } = require('path')

class Byteframe {
  constructor(directory = 'fortunes') {
    this.directory = directory
    this.readdir = promisify(readdir)
  }

  async fortune(file, amount = 1, fortune = '') {
    amount = [...Array(amount).keys()]
    const fortunes = await this.load()

    amount.forEach((index) => {
      fortune += fortunes[file].sort(() => Math.random() - .5)[index].trim()
      fortune.replace(/ +/g, ' ').trim()
    })

    return fortune
  }

  async big(length) {
    const text = (await this.fortune('all')).replace(/\n/g, ' ').trim()
    return text.length < length || text.length < 1 ? this.big(length) : text
  }

  async load(directory = this.directory) {
    const files = await this.readdir(directory)
    const fortunes = {}

    return Promise.all(files.map(async (file) => {
      const path = resolve(directory, file)
      fortunes[file] = readFileSync(path, 'utf8').split('\n%')
    }))
    .then(() => fortunes)
    .catch(console.error)
  }
}

module.exports = Byteframe