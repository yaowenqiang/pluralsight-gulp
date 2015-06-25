module.exports = function () {
    var client = './src/client/';
    var config = {
        //all the js to wet
        temp:'./.tmp',
        /**
         * files paths
         */
        alljs:[
        './src/**/*.js',
        './*.js'
        ],
        //less:'./src/client/styles/styles.less',
        less:client+'styles/styles.less',
    };
    return config;
};
