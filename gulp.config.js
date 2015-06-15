module.exports = function () {
    var client = './src/client/';
    var clientApp = client + "app/";
    var temp = "./.tmp/";
    var config = {
        //all the js to wet
        temp:temp,
        /**
         * files paths
         */
        alljs:[
        './src/**/*.js',
        './*.js'
        ],
        client: client,
        index: client +  "index.html",
        css: temp + "styles.css",
        js: [
            clientApp + "**/*.mudole.js",
            clientApp + "**/*.js",
            '!' + clientApp + "**/*.spec.js",//排除
        ],
        //less:'./src/client/styles/styles.less',
        less:client+'styles/styles.less',
        /**
         * Bower and NPM locations
        */
       bower: {
           json: require('./bower.json'),
           directory: './bower_components/',
           ignorePath: '../..'
       }
    };
    config.getWiredepDefaultOptions = function () {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };
        return options;
    }
    return config;
};
