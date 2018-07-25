const crypto = require('crypto')
const request = require('request')
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')

const {debug, error} = require('./debug')

const justFetch = (url, output) => new Promise((resolve, reject) => {
  const hash = crypto.createHash('sha256')
  const fstream = fs.createWriteStream(output)

  request(url)
  .on('data', chunk => {
    hash.update(chunk)
  })
  .on('end', () => {
    resolve(hash.digest('hex'))
  })
  .on('error', reject)
  .pipe(fstream)
})

// Remove a file and never throws
const tryToRemove = filepath => fse.remove(filepath).catch(err => {
  console.warn(`fails to remove ${filepath}: ${err.message}`)
})

const fetch = async ({
  url,
  digest,
  output
}) => {
  debug('fetching %s to %s', url, output)

  output = path.resolve(output)
  const dir = path.dirname(output)

  await fse.ensureDir(dir)
  let hash

  try {
    hash = await justFetch(url, output)
  } catch (e) {
    await tryToRemove(output)
    throw new Error(`fails to fetch ${url}: ${e.message}`)
  }

  debug('fetch complete, hash %s', hash)

  if (!digest) {
    return
  }

  if (hash !== digest) {
    await tryToRemove(output)
    throw new Error(`digest not match, expect '${digest}', but got '${hash}', removed ${output}`)
  }
}

const clean = file => fse.remove(file)
.catch(err => {
  console.log(err, err.code)
})

const cleanAndFetch = async task => {
  const {output} = task
  await clean(output)

  return fetch(task)
}

module.exports = {
  fetch,
  clean,
  cleanAndFetch,
  error
}

// fetch({
//   url: 'https://kubernetes-charts.storage.googleapis.com/acs-engine-autoscaler-2.2.0.tgz',
//   digest: '5904caae456eecd1fed0a5d58f4a6f46e1fe97f954c4467e49fc80f91d912a10',
//   output: 'a.tgz'
// })
