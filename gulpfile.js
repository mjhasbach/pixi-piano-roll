var gulp = require('gulp'),
    path = require('path'),
    umd = require('gulp-umd'),
    babel = require('gulp-babel'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    runSequence = require('run-sequence');

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
                    {name: 'teoria'}
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

gulp.task('watch', function() {
    gulp.watch(path.join(libDir, '*.js'), ['ES6ToES5UMD']);
});

gulp.task('default', function(cb) {
    runSequence('ES6ToES5UMD', 'minify', cb);
});