<!-- [![Build Status](https://travis-ci.org/kaelzhang/helm-stable-charts-mirror.svg?branch=master)](https://travis-ci.org/kaelzhang/helm-stable-charts-mirror) -->
<!-- [![Coverage](https://codecov.io/gh/kaelzhang/helm-stable-charts-mirror/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/helm-stable-charts-mirror) -->
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/helm-stable-charts-mirror?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/helm-stable-charts-mirror)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/helm-stable-charts-mirror.svg)](http://badge.fury.io/js/helm-stable-charts-mirror)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/helm-stable-charts-mirror.svg)](https://www.npmjs.org/package/helm-stable-charts-mirror)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/helm-stable-charts-mirror.svg)](https://david-dm.org/kaelzhang/helm-stable-charts-mirror)
-->

# The Mirror of Helm Stable Charts

The mirror of helm stable charts, the drop-in replacement of [https://kubernetes-charts.storage.googleapis.com](https://kubernetes-charts.storage.googleapis.com)

由于某些不可描述的技术原因，如果不使用科学上网（比如在服务器上）， Helm 的官方 Charts 仓库（[https://kubernetes-charts.storage.googleapis.com](https://kubernetes-charts.storage.googleapis.com)）在国内无法访问，所以有了这个项目。可以使用 `https://charts.ost.ai` 来直接替代原仓库。

同时，这个项目也可以帮助你快速创建自己的镜像源。

## Usage

Helm users should run this command before `helm init`

```sh
helm repo add stable https://charts.ost.ai
```

Or

```sh
helm init --stable-repo-url https://charts.ost.ai
```

For most cases, it is better to update the repo

```sh
helm repo update
```

## Create your own mirror

Fork the project

```sh
git clone git@github.com:YOUR_NAME/helm-stable-charts-mirror.git
cd helm-stable-charts-mirror

# Install dependencies
npm install

# Before the following step you may need to changes the values inside
#   downloader/run.js

# Updates repo index
npm run update

# Adds the new files to git
git add -A
git push origin master
```

Then go to github/settings, activate Github Pages, set the source as `master branch /docs folder`, done.

You can use the repo url as https://YOUR_NAME.github.io/helm-stable-charts-mirror

## License

MIT
