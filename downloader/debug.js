const chalk = require('chalk')
const debug = require('util').debuglog('helm-charts')

const debugError = (template, ...args) => debug(chalk.red(template), ...args)

const error = str => console.error(chalk.red(str))

module.exports = {
  debug,
  debugError,
  error
}
