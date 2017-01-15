// Include gulp
const gulp = require('gulp');
const gulpif = require('gulp-if');

// Include Our Plugins
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const nodemon = require('gulp-nodemon');
const browserSync = require('browser-sync');
const sprity = require('sprity');

// Sprite sheet
gulp.task('sprity', function () {
    return sprity.src({
        src: './public/images/cards/*.png',
        style: './public/stylesheets/sprite.scss',
        orientation: 'binary-tree',
    })
        .pipe(gulpif('*.png',
                gulp.dest('./public/images/'),
                gulp.dest('./public/stylesheets/')
        ));
});

// Compile Our Sass
gulp.task('sass', function () {
    return gulp.src('public/stylesheets/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('public/stylesheets/'))
        .pipe(browserSync.stream());
});

gulp.task('reload', function () {
    browserSync.reload();
});


// Watch Files For Changes
gulp.task('watch', function () {
    gulp.watch('public/**/*.scss', ['sass']);
    gulp.watch('views/**/*.jade', ['reload']);
});


const BROWSER_SYNC_RELOAD_DELAY = 2000;

// Nodemon
gulp.task('nodemon', function (cb) {
    // Serve files from the root of this project

    browserSync.init({
        proxy: {
            target: "http://localhost:3000",
            ws: true,
        },
        ghostMode: false,
        files: ["views/**/*.*, public/**/*.*"],
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
gulp.task('default', ['sass', 'watch', 'nodemon']);
