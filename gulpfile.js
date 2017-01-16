"use strict";

// Include gulp
const gulp = require('gulp');

// Include Our Plugins
const nodemon = require('gulp-nodemon');
const browserSync = require('browser-sync');

// Sprite sheet
gulp.task('babel', function () {
    const sourcemaps = require("gulp-sourcemaps");
    const babel = require("gulp-babel");
    const concat = require("gulp-concat");

    return gulp.src("src/clientjs/*.js")
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .on('error', function(e) {
            console.log(e.message);
            console.log(e.codeFrame);
            this.emit('end');
        })
        .pipe(concat("app.js"))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("public/"));
});

// Compile Our Sass
gulp.task('sass', function () {
    const sass = require('gulp-sass');
    const autoprefixer = require('gulp-autoprefixer');

    return gulp.src('src/scss/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('public/'))
        .pipe(browserSync.stream());
});

gulp.task('reload', function () {
    browserSync.reload();
});


// Watch Files For Changes
gulp.task('watch', ['babel', 'sass'], function () {
    gulp.watch('src/scss/**/*.scss', ['sass']);
    gulp.watch('src/clientjs/**/*.js', ['babel', 'reload']);
    gulp.watch('src/views/**/*.jade', ['reload']);
});


const BROWSER_SYNC_RELOAD_DELAY = 2000;

// Nodemon
gulp.task('nodemon', ['watch'], function (cb) {
    // Serve files from the root of this project

    browserSync.init({
        proxy: {
            target: "http://localhost:3000",
            ws: true,
        },
        ghostMode: false,
        files: ["src/**/*.*, dist/**/*.*"],
        port: 7000,
        notify: false
    });

    let started = false;
    return nodemon({
        script: 'bin/www'
    }).on('start', function () {
        // to avoid nodemon being started multiple times
        if (!started) {
            cb();
            started = true;
        }
    }).on('restart', function onRestart() {
        // reload connected browsers after a slight delay
        setTimeout(function reload() {
            browserSync.reload({
                stream: false
            });
        }, BROWSER_SYNC_RELOAD_DELAY);
    });
});

// Default Task
gulp.task('default', ['nodemon']);
