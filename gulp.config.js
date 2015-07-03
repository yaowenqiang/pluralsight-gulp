module.exports = function () {
    var client = './src/client/';
    var clientApp = client + "app/";
    var temp = "./.tmp/";
    var browserReloadDelay=1000;
    var server = "./src/server";
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
        build: "./build/",//.dist,prod,
        fonts: "./bower_components/font-awesome/fonts/**/*.*",
        html: '**/*.html',
        htmltemplates: clientApp + "**/*.html",
        images: client + "/images/**/*.*",
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
        server: server,
        /**
         * Bower and NPM locations
        */
       bower: {
           json: require('./bower.json'),
           directory: './bower_components/',
           ignorePath: '../..'
       },
        /**
         * Node settings
         */
        defaultPort: 7203,
        nodeServer: "./src/server/app.js",
        /**
         * template cache
         */

        templateCache: {
            file:'template.js',
            options: {
                module: "app.core",
                standAlone: false,
                root: 'app/'

            }
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
