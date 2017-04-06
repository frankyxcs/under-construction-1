'use strict';

const
    eslint_conf   = require('./.eslintrc'),
    gulp          = require('gulp'),
    del           = require('del'),
    exec          = require('child_process').exec,
    open          = require('open'),
    eslint        = require('gulp-eslint'),
    concat        = require('gulp-concat'),
    sourcemaps    = require('gulp-sourcemaps'),
    connect       = require('gulp-connect'),
    uglify        = require('gulp-uglify'),
    minifyCss     = require('gulp-clean-css'),
    gutil         = require('gulp-util'),
    flatten       = require('gulp-flatten'),
    minifyHTML    = require('gulp-minify-html'),
    templateCache = require('gulp-angular-templatecache'),
    ngAnnotate    = require('gulp-ng-annotate'),

    CONNECT_SERVER = {
        'port'       : 2646,
        'livereload' : true,
        'fallback'   : 'index.html'
    },

    APP_PREFIX            = 'plingSite',
    SRC_CODE              = [ './app/app-module.js', './app/**/*.js', './app/shared/filters/*.js', './app/shared/directives/*.js', './build/templatecache/app.templates.js' ],
    ASSETS_PATH           = [ 'assets/**/img/*.*', 'assets/**/icons/*.*' ],
    WATCH_RELOAD          = [ 'app/**/*.*', 'assets/**/*.*' ],
    WATCH_RELOAD_TEMPLATE = [ 'index.html', 'conf.json', './app/**/*.html' ],
    FOLDERS_TO_CLEAN      = [ 'build', 'dist', 'release' ],
    CSS_PATHS             = [ './app/**/*.css', './assets/css/*.css' ],
    DIST_PATH             = './dist/',
    CSS_DIST_PATH         = './dist/assets/css',
    ASSETS_DIST_PATH      = './dist/assets/';

// task chain definidtions
gulp.task('default', [ 'all' ]);
gulp.task('all',     [ 'test', 'build' ]);
gulp.task('test',    [ 'eslint' ]);
gulp.task('dev',     [ 'connect', 'watch' ]);
gulp.task('build',   [ 'copy:assets', 'minify:css', 'build:bundle', 'build:min' ]);

/* GULP TASKS */
gulp.task('clean', () => { del(FOLDERS_TO_CLEAN); });

/* ESLint rules: http://eslint.org/docs/rules */
gulp.task('eslint', () => { gulp.src(SRC_CODE).pipe(eslint(eslint_conf)).pipe(eslint.format()); });

// Bundle Files
gulp.task('build:bundle', ['minify:html'], () => {
    gulp
        .src(SRC_CODE)
        .pipe(concat(APP_PREFIX + '.js'))
        .pipe(gulp.dest(DIST_PATH));
});

// Build .min files
gulp.task('build:min', ['minify:html'], () => {
    gulp.src(SRC_CODE)
        .pipe(sourcemaps.init())
          .pipe(concat(APP_PREFIX + '.min.js'))
          .pipe(ngAnnotate())
          .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(DIST_PATH));
});

// Minify CSS
gulp.task('minify:css', () => {
    gulp
        .src(CSS_PATHS)
        .pipe(sourcemaps.init())
        .pipe(concat(APP_PREFIX + '.min.css'))
        .pipe(minifyCss({ 'processImport': false }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(gutil.env.src || CSS_DIST_PATH));
});

// MINIFY HTML
gulp.task('minify:html', () => {

    return gulp
        .src('./app/**/*.html')
            .pipe(minifyHTML({ 'conditionals': true, 'spare': true }))
            .pipe(flatten())
            .pipe(templateCache('app.templates.js', { 'module': 'plingSiteApp.templates', 'standalone': true }))
        .pipe(gulp.dest('./build/templatecache/'));
});

// Copy assets folder
gulp.task('copy:assets', () => { gulp.src(ASSETS_PATH).pipe(gulp.dest(ASSETS_DIST_PATH)); });

// Websocket Http Server
gulp.task('connect', [ 'all' ], () => { connect.server(CONNECT_SERVER); });

// Watch for changes in files
gulp.task('watch', () => {
    gulp.watch(WATCH_RELOAD_TEMPLATE, [ 'reload:template' ]);
    gulp.watch(WATCH_RELOAD, [ 'reload' ]);
});

// Live Reload
gulp.task('reload', [ 'all' ], () => { connect.reload(); });

// Reload CSS & HTML
gulp.task('reload:template', () => { connect.reload(); });

gulp.task('merge', [], (done) => {
    const
        branch       = gutil.env.b || 'master',
        gitCommands  = [
            'git pull origin ' + branch,
            'git fetch upstream',
            'git merge upstream/' + branch + ' ' + branch,
            'git push origin ' + branch
        ];

    let
        errorMessage = 'Erro ao gerar comando pode ter dado merge arrume os merge e execute de novo...';

    if (branch === 'pre-prod') {
        gitCommands.splice(0, 0, 'git checkout pre-prod');
        gitCommands.splice(1, 0, 'git merge master');
        gitCommands.push('git checkout master');
        errorMessage += ' CUIDADO VOCE ESTA NA BRANCH DE PRE-PROD';
    }

    execute(gitCommands, (err) => {
        if (err) return console.error(errorMessage);
        open('https://github.com/plingbr/pling.net.br/compare?expand=1');
        done();
    });
});

function execute(cmds, done, i) {
    i = i || 0;
    console.log(cmds[i]);
    exec(cmds[i], {'cwd': '' }, (err) => {
        if (err) {
            console.error(err); // eslint-disable-line
            return done(err);
        }
        if (i === cmds.length - 1)
            return done();
        execute(cmds, done, ++i);
    });
}