var gulp = require('gulp'),
    path = require('path'),
    umd = require('gulp-umd'),
    gutil = require('gulp-util'),
    babel = require('gulp-babel'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    runSequence = require('run-sequence'),
    gulpJsdoc2md = require('gulp-jsdoc-to-markdown');

var libDir = 'lib',
    moduleName = 'pixiPianoRoll',
    moduleNameJS = moduleName + '.js';

gulp.task('ES6ToES5UMD', function() {
    var getModuleName = function() {
        return moduleName;
    };

    return gulp.src(path.join(libDir, moduleNameJS))
        .pipe(babel())
        .pipe(umd({
            exports: getModuleName,
            namespace: getModuleName,
            dependencies: function() {
                return [
                    {name: 'pixi.js', global: 'PIXI', param: 'pixi'},
                    {name: 'teoria'},
                    {name: 'musical-scale-colors', global: 'musicalScaleColors', param: 'musicalScaleColors'}
                ];
            }
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('minify', function() {
    return gulp.src(path.join('dist', moduleNameJS))
        .pipe(uglify())
        .pipe(rename(function(file) {
            file.extname = '.min.js';
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('docs', function(){
    return gulp.src('lib/*.js')
        .pipe(gulpJsdoc2md())
        .on('error', function(err){
            gutil.log(gutil.colors.red('documentation generation failed'), err.message);
        })
        .pipe(rename(function(path){
            path.basename = 'README';
            path.extname = '.md';
        }))
        .pipe(gulp.dest('.'));
});

gulp.task('watch', function() {
    gulp.watch(path.join(libDir, '*.js'), ['ES6ToES5UMD']);
});

gulp.task('default', function(cb) {
    runSequence('ES6ToES5UMD', 'minify', 'docs', cb);
});