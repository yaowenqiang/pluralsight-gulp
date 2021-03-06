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
gulp.task('clean',function(done){
    var delconfig = [].concat(config.build,config.temp);
    log('Clean:' + $.util.colors.blue(delconfig));
    del(delconfig,done);
});
gulp.task('clean-styles',function(done){
    clean(config.temp + '**/*.css',done);
});
gulp.task('clean-fonts',function(done){
    clean(config.build + 'fonts/**/*.*',done);
});
gulp.task('clean-images',function(done){
    clean(config.build + 'images/**/*.*',done);
});

gulp.task('clean-code',function(done){
    var files = [].concat(
        config.temp + '**/*.js',
        config.build + '**/*.html',
        config.build + 'js/**/*.js'
    );
    clean(files,done);
});
gulp.task('templatecache',['clean-code'],function(){
    log('Creating angularjs $templateCache')
    return gulp
            .src(config.htmltemplates)//TODO
            .pipe($.minifyHtml({empty:true}))
            // gulp-angular-templatecache
            // TODO minify
            .pipe($.angularTemplatecache( config.templateCache.file, config.templateCache.options))
            .pipe(gulp.dest(config.temp))
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
gulp.task('inject',['wiredep','styles','templatecache'],function(){
    log('Wire up the bower css and js and our app js into the html');
    return gulp
            .src(config.index)//TODO index.html
            .pipe($.inject(gulp.src(config.css)))
            .pipe(gulp.dest(config.client));//TODO config
});

gulp.task('optimize',['inject'],function(){
    var assets = $.useref.assets({searchPath:'./'})
    log('optimizing the javascript,css,html')
    var templateCache = config.temp + config.templateCache.file;
    log("the templateCache  is :" + $.util.colors.red(templateCache));
    var cssfiler = $.filter('**/*.css');
    var jsfiler = $.filter('**/*.js');
    return gulp
            .src(config.index)
            .pipe($.debug({title:'gulp debug'}))
            .pipe($.plumber())
            .pipe($.inject(gulp.src(templateCache,{read:false}),{starttag:'<!-- inject:templates:js -->',endtag:'<!-- endinject -->'}))
            .pipe(assets)
            .pipe(cssfiler)
            .pipe($.csso())
            .pipe(cssfiler.restore())
            .pipe(jsfiler)
            .pipe($.uglify())
            .pipe(jsfiler.restore())
            .pipe($.debug({title:'assets debug'}))
            .pipe(assets.restore())
            .pipe($.useref())
            .pipe(gulp.dest(config.build))
});
gulp.task('serve-build',['optimize'],function(){
    serve(false);
});
gulp.task('serve-dev',['inject'],function(){
    serve(true);
});
function serve (isDev) {
    //var dev = isDev;
    var options = {
        script: config.nodeServer, //TODO pp.js
        delayTmme: 1,
        env: {
            //TODO 读取app.js中的变量
            //"PORT": port? port : 7203,
            //"NODE_ENV":isDev? 'dev' : 'build'
            "PORT": 7203,
            "NODE_ENV":isDev ? 'dev' : 'build'
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
            startBrowserSync(isDev);
        })
        .on('crash',function(){
            log('*** nodemon crashed: script crashed for some reason');
        })
        .on('exit',function(){
            log('*** nodemon exited clearly');
        })


}
gulp.task('help',$.taskListing);
gulp.task('default',['help']);
gulp.task('fonts',['clean-fonts'],function(){
    log('Copying fonts');
    return gulp.src(config.fonts)
     .pipe(gulp.dest(config.build + 'fonts'))
});
gulp.task('images',['clean-images'],function(){
    log('Copying and compressing the images');
    return gulp.src(config.images)
            .pipe($.imagemin({optimizationLevel:4}))
            .pipe(gulp.dest(config.build + 'images'))
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
function startBrowserSync(isDev) {
    if(args.nosync || browserSync.active) {
        return;
    }
    var port = 7203;
    log("starting browser-sync on port :" + $.util.colors.blue(port));
    if(isDev) {
        gulp.watch([config.less],['styles'])
        // TODO change the less files invoke a refresh rather than reload,this is a big issue.
            .on('change',function(event){
                changeEvent(event);
        });
    } else {
        gulp.watch([config.less,config.js,config.html],['optimize',browserSync.reload])
            .on('change',function(event){
                changeEvent(event);
        });
    }
    var options = {
        proxy: "localhost:" + port,
        port: 3000,
        files: isDev? [
            //config.client + '**/*.*',
            //'!' + config.less,
            config.temp + '**/*.css'
        ]:[],
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
    console.dir(options);
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

