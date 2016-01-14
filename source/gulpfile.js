'use strict';

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var minify = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var minifyHTML = require('gulp-minify-html');

var conf = {
    css: {
        wrkPath: 'assets/*.css',
        optPath: '../compiled/assets'
    },
    js: {
        wrkPath: [
            'bower_components/easeljs/lib/easeljs-0.8.1.combined.js',
            'bower_components/TweenJS/lib/tweenjs-0.6.1.combined.js',
            'bower_components/fastclick/lib/fastclick.js',
            'bower_components/jquery/dist/jquery.js',
            'bower_components/fontfaceobserver/fontfaceobserver.js',
            'assets/index.js'
        ],
        optPath: '../compiled/assets',
        optName: 'index.js'
    },
    img: {
        wrkPath: 'assets/*.png',
        optPath: '../compiled/assets'
    },
    html: {
        wrkPath: 'assets/*.html',
        optPath: '../compiled'
    }
};

gulp.task('css', function() {
    return gulp.src(conf.css.wrkPath)
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: ['> 1%']
        }))
        .pipe(minify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(conf.css.optPath));
});

gulp.task('js', function() {
    return gulp.src(conf.js.wrkPath)
        .pipe(sourcemaps.init())
        .pipe(concat(conf.js.optName))
        .pipe(uglify({
            mangle: false
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(conf.js.optPath));
});

gulp.task('img', function() {
    return gulp.src(conf.img.wrkPath)
        .pipe(gulp.dest(conf.img.optPath));
});

gulp.task('html', function() {
    return gulp.src(conf.html.wrkPath)
        .pipe(minifyHTML({
            empty: true
        }))
        .pipe(gulp.dest(conf.html.optPath));
});

gulp.task('watch', function() {
    gulp.watch(conf.css.wrkPath, ['css']);
    gulp.watch(conf.js.wrkPath, ['js']);
    gulp.watch(conf.img.wrkPath, ['img']);
    gulp.watch(conf.img.wrkPath, ['html']);
});

gulp.task('default', ['css', 'js', 'img', 'html']);
