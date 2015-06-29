var gulp = require('gulp');
var args = require('yargs').argv;
var browserSync = require('browser-sync');
var $ = require('gulp-load-plugins')({lazy:true});
var config = require('./gulp.config')();
var del = require('del');
//var jshint = require('gulp-jshint');
//var jscs = require('gulp-jscs');
//var util = require('gulp-util');
//var gulpprint = require('gulp-print');
//var gulpif = require('gulp-if');
//gulp.task('hello-world',function(){
    //console.log('Our hello world gulp task!')
//});
gulp.task('web',function(){
    log('Analyzing source with JSHint and JSCS.');
    return gulp
    .src(config.alljs)
    //.pipe(gulpprint())
    //gulp web --verbose
    .pipe($.if(args.verbose,$.print()))
    .pipe($.jscs())
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish',{verbose:true}))
    .pipe($.jshint.reporter('fail'));

});
gulp.task('clean-styles',function(done){
    var files = config.temp + '**/*.css';
    //log(files);
    //del(files);
    clean(files,done);
});
gulp.task('styles',['clean-styles'],function(){
    log("Compiling less to css");
    return gulp
    .src(config.less)//TODO add the config
    .pipe($.plumber())
    .pipe($.less())
    //.on('error',errorlogger)
    .pipe($.autoprefixer({browsers:['last 2 version','> 5%']}))
    .pipe(gulp.dest(config.temp))
});

gulp.task('wiredep',function(){
    log('Wire up the bower css and js and our app js into the html');
    var options = config.getWiredepDefaultOptions();//TODO
    log(options);
    var wiredep = require('wiredep').stream;
    return gulp
            .src(config.index)//TODO index.html
            .pipe(wiredep(options))
            .pipe($.inject(gulp.src(config.js)))//TODO js ?

            .pipe(gulp.dest(config.client));//TODO config
});
gulp.task('inject',['wiredep','styles'],function(){
    log('Wire up the bower css and js and our app js into the html');
    return gulp
            .src(config.index)//TODO index.html
            .pipe($.inject(gulp.src(config.css)))
            .pipe(gulp.dest(config.client));//TODO config
});
gulp.task('serve-dev',['inject'],function(){
    var dev = true;
    var options = {
        script: config.nodeServer, //TODO pp.js
        delayTmme: 1,
        env: {
            //TODO 读取app.js中的变量
            //"PORT": port? port : 7203,
            //"NODE_ENV":isDev? 'dev' : 'build'
            "PORT": 7203,
            "NODE_ENV":'dev'
        },
        watch: [config.server]// TODO define the files to restart on
    };
    return $.nodemon(options)
        .on('restart',['web'],function(ev){
            log('*** nodemon restarted')
            log('files changed on restart:\n' + ev);
            setTimeout(function() {
                browserSync.notify('reloading now ...');
                browserSync.reload({stream:false});
            }, config.browserReloadDelay);
        })
        .on('start',function(){
            log('*** nodemon started');
            startBrowserSync();
        })
        .on('crash',function(){
            log('*** nodemon crashed: script crashed for some reason');
        })
        .on('exit',function(){
            log('*** nodemon exited clearly');
        })
});
function errorlogger(error) {
    log('*** Start of Error ***')
    log(error)
    log('*** End of Error ***')
    this.emit('end')
}

function changeEvent(event) {
    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/')
    log('File ' + event.path.replace(srcPattern,'') + ' ' + event.type);
}
function startBrowserSync() {
    if(args.nosync || browserSync.active) {
        return;
    }
    var port = 7203;
    log("starting browser-sync on port :" + $.util.colors.blue(port));
    gulp.watch([config.less],['styles'])
        .on('change',function(event){
            changeEvent(event);
        });
    var options = {
        proxy: "localhost:" + port,
        port: 3000,
        files: [
            config.client + '**/*.*',
            '!' + config.less,
            config.temp + '**/*.css',
        ],
        ghostMode:{
            clicks:true,
            location:true,
            forms:true,
            scroll:true
        },
        injectChanges:true,
        logFileChanges:true,
        logLevel:'debug',
        logPrefix: 'gulp-ptternes',
        notify: true,
        reloadDelay:0 // 1000
    };
    browserSync(options)
    //browserSync.init({
        //proxy:"local.dev"
    //})

}
function clean(path,done) {
    log("We are cleaning :" + $.util.colors.blue(path));
    del(path,done);
}
gulp.task('less-watcher',function(){
    gulp.watch([config.less],['styles'])

})
///////
function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg ) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}

