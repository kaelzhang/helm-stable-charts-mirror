const {createPool} = require('generic-pool')
const fse = require('fs-extra')
const url = require('url')
const path = require('path')
const delay = require('delay')

const {debugError, error} = require('./debug')
const {cleanAndFetch} = require('./fetch')

const exists = async file => {
  try {
    await fse.access(file)
    return true
  } catch (e) {
    return false
  }
}

const DELAY = 1000

class Downloader {
  constructor ({
    max,
    retries,
    root,
    limit
  }) {
    this._pool = createPool({
      create () {
        return {}
      },
      destroy () {}
    }, {
      max,
      min: 0
    })

    this._retries = retries
    this._count = 0
    this._limit = limit
    this._root = path.resolve(root)
  }

  // apiVersion: v1
  // appVersion: 2.1.1
  // created: 2018-07-23T15:24:50.799921401Z
  // description: Scales worker nodes within agent pools
  // digest: 5904caae456eecd1fed0a5d58f4a6f46e1fe97f954c4467e49fc80f91d912a10
  // home: https://github.com/wbuchwalter/Kubernetes-acs-engine-autoscaler
  // icon: https://github.com/kubernetes/kubernetes/blob/master/logo/logo.png
  // maintainers:
  // - email: ritazh@microsoft.com
  //   name: ritazh
  // - email: wibuch@microsoft.com
  //   name: wbuchwalter
  // name: acs-engine-autoscaler
  // sources:
  // - https://github.com/wbuchwalter/Kubernetes-acs-engine-autoscaler
  // urls:
  // - https://kubernetes-charts.storage.googleapis.com/acs-engine-autoscaler-2.2.0.tgz
  // version: 2.2.0
  add (name, chart) {
    if (this._limit && this._limit <= this._count) {
      return
    }

    return this._add({
      name,
      chart
    })
    .catch(error)
  }

  async _add ({
    name,
    retry_count = 0,
    chart
  }) {
    const {
      urls: [download_url],
      digest,
      appVersion
    } = chart

    if (!appVersion) {
      console.log(`no appVersion, skip ${name}`)
      return
    }

    const {pathname} = url.parse(download_url)
    const filename = path.basename(pathname)
    const output = path.join(this._root, filename)

    const existed = await exists(output)
    if (existed) {
      console.log(`exists, skip ${name}@${appVersion}: ${output}`)
      return
    }

    const resource = await this._pool.acquire()

    try {
      await cleanAndFetch({
        url: download_url,
        digest,
        output
      })
    } catch (e) {
      this._pool.release(resource)
      debugError('download error %s', e.stack)

      if (retry_count < this._retries) {
        retry_count ++
        console.log(
          `fails to download ${name}@${appVersion}, retry x${retry_count}`
        )

        return this._add({
          name,
          retry_count,
          chart
        })
      }

      throw new Error(`fails to download ${name}@${appVersion}`)
    }

    this._pool.release(resource)
    this._count ++
  }

  process () {
    return delay(DELAY).then(() => this._pool.drain())
  }
}

module.exports = {
  Downloader
}
