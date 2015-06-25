var gulp = require('gulp');
var args = require('yargs').argv;
var $ = require('gulp-load-plugins')({lazy:true});
var config = require('./gulp.config')();
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
gulp.task('styles',function(){
    log("Compiling less to css");
    return gulp
    .src(config.less)//TODO add the config
    .pipe($.less())
    .pipe($.autoprefixer({browsers:['last 2 version','> 5%']}))
    .pipe(gulp.dest(config.temp))
});
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
