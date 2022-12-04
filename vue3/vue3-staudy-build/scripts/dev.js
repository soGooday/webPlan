const path = require('path');
const minimist = require('minimist');
const { build } = require('esbuild');
//获取指令中的设置参数
const args = minimist(process.argv.slice(2))

//获取目标文件名称
const target = args._[0] || 'reactivity';
//目标文件需要打成的包的格式
const format = args.f || 'global';
//目标文件地址json的配置
const pkg = require(path.resolve(__dirname, `../packages/${target}/package.json`));
//打包的文件类型
const outputFormat = format.startsWith('gloabl') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm';

//打包输出的文件路径及其名称
const outfile = path.resolve(__dirname, `../packages/${target}/dist/${target}.${outputFormat}.js`)


console.log(pkg.buildOptions.name)

build({
    entryPoints: [path.resolve(__dirname, `../packages/${target}/src/index.ts`)],
    outfile,
    bundle: true,
    sourcemap: true,
    format: outputFormat,
    globalName: pkg.buildOptions.name,
    platform: format === 'cjs' ? 'node' : 'browser',
    watch: {
        onRebuild(err) {
            if (!err) console.log('err', err)
        }
    }
}).then(() => {
    console.log('watching~~~')
})