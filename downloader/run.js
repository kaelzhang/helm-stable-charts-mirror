const yaml = require('js-yaml')

const path = require('path')
const fse = require('fs-extra')
const forEach = require('lodash.foreach')
const replace = require('replace-string')

const {debug, error} = require('./debug')
const {cleanAndFetch, clean} = require('./fetch')
const {Downloader} = require('./downloader')

const ROOT = path.join(__dirname, '..')
const TEMP_DIR = path.join(ROOT, '.download')
const TYPES = {
  stable: {
    prefix: 'https://kubernetes-charts.storage.googleapis.com/',
    ostai: 'https://charts.ost.ai/stable/',
    root: path.join(ROOT, 'docs')
  }
}
const MAX_POOL_SIZE = 10
const RETRIES = 3
const LIMIT = 20

async function run (type) {
  const {
    prefix,
    ostai,
    root
  } = TYPES[type]

  const index = `${prefix}index.yaml`
  const temp_dest = path.join(TEMP_DIR, type, 'index.yaml')

  await cleanAndFetch({
    url: index,
    output: temp_dest
  })

  debug('cleaned and fetched %s', index)

  const buffer = await fse.readFile(temp_dest)
  const content = buffer.toString()
  const doc = yaml.safeLoad(content)

  const downloader = new Downloader({
    max: MAX_POOL_SIZE,
    retries: RETRIES,
    limit: LIMIT,
    root
  })

  forEach(doc.entries, (charts, name) => {
    charts.forEach(chart => {
      debug('start download %s@%s', name, chart.appVersion)
      downloader.add(name, chart)
    })
  })

  await downloader.process()
  debug('download completed')

  const index_dest = path.join(root, 'index.yaml')
  await clean(index_dest)

  debug('removed old index, write new index')
  await fse.writeFile(index_dest, replace(content, prefix, ostai))

  debug('done: %s', type)
}

run('stable')
.catch(error)
