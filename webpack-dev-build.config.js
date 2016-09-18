module.exports = require('./webpack.config')({
    devtool: 'sourcemap',
    debug: false,
    minimize: true,
    longTermCaching: true
});