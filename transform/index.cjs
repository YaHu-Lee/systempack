/**
 * transform 提供“文件搬运”工作。
 * 不同于 webpack 的指定入口 + 依赖解析，systempack 把模块之间的依赖交给开发者来处理。
 * 这是因为，在微前端的架构模型下，很难由开发环境中的工具来决定每个模块的实际引用地址。
 * 因此，transform 仅承担类似 webpack 中 loader 的工作(实际上也确实是借助 loader 来实现的)
 * 它将指定文件夹中的所有文件依照本来的目录格式来搬运到 dist 文件夹，在此过程中，会对某些特定文件
 * 类型进行处理，比如，将 react 的 jsx 语法转为 js，对 ES 高阶语法做兼容处理等。
 * 借助System.js的register方法，处理过后的文件将会被包装成一个Systemjs模块
 */
const fs = require("fs")
const pt = require("path")
const loader = require("babel-loader")
let dir
function transform(initialDir) {
  dir = initialDir
  read(dir)
}
function read(path) {
  fs.stat(path, (err, stat) => {
    if(err)throw err
    if(stat.isDirectory()) {
      const npath = path.replace(dir, pt.join(__dirname, "dist"))
      fs.mkdir(npath, null, (err, url) => {
        console.log("made a dir:" + url)
        fs.readdir(path, {}, (err, files) => {
          if(err)throw err
          files.forEach(file => read(path + '/' + file))
        })
      })
    } else if(stat.isFile()) {
      fs.readFile(path, {}, (err, data) => {
        if(/\.js$/.test(path)) {
          loader.call({
            async: () => (err, code, map) => {
              console.log(code)
              fs.writeFile(path.replace(dir, pt.join(__dirname, "dist")), code || " ", () => {})
            }
          }, data, null)
        } else {
          fs.writeFile(path.replace(dir, pt.join(__dirname, "dist")), data, () => {})
        }
      })
    }
  })
}
transform(pt.join(__dirname, "../example"))
module.exports = transform