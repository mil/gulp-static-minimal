#!/usr/bin/env node
var gulp = require('gulp');
var $ = {
  _: require('underscore'),
  rename: require('gulp-rename'),

  connect: require('gulp-connect'),
  autoprefixer: require('autoprefixer-core'),
  sourcemaps: require('gulp-sourcemaps'),
  sass: require('gulp-sass'),
  postcss: require('gulp-postcss'),
  rimraf: require('rimraf'),
  swig: require('gulp-swig'),
  swig_vendor: require('swig'),

  path: require('path')
};

var cfg = {
  site_src: 'src',
  site_dist: 'dist'
};

var util = {
 fs_in: function(path)  {
    return cfg.site_src + "/" + (path || '');
  },
  fs_out: function(path) {
    return cfg.site_dist + "/" + (path || '');
  }
};


gulp.task("reload", function() {
  return gulp.src("*").pipe($.connect.reload());
});

gulp.task('webserver', function() {
  return $.connect.server({
    root: util.fs_out(),
    port: 5000,
    livereload: true,
    host: '0.0.0.0'
  });
});

gulp.task('clean', function() {
  $.rimraf.sync(util.fs_out());
});

gulp.task('sass', [], function() {
  gulp
    .src(util.fs_in('_scss/all.scss'))
    .pipe($.sourcemaps.init())
    .pipe($.sass())
    .on('error', function(error) {
      console.log('Sass Error', error);
    })
    .pipe($.postcss([ $.autoprefixer({browsers: ['last 2 version']}) ]))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(util.fs_out()));
});

gulp.task('html', [], function() {
  gulp
    .src(util.fs_in('_index.swig.html'))
    .pipe($.swig({
      defaults: {
        cache: false,
        loader: $.swig_vendor.loaders.fs(
          $.path.join(__dirname, util.fs_in())
        )
      }
    }))
    .pipe($.rename('index.html'))
    .pipe(gulp.dest(util.fs_out()));
});

gulp.task('watch', function() {
  $._.each({
    html: [
      '_index.swig.html',
      '_partials/*',
    ],
    sass: [
      '_scss/*'
    ]
  }, function(watch_paths, task_name) {
    gulp.watch($._.map(watch_paths, util.fs_in), [ task_name, 'reload' ]);
  });
});

gulp.task('default', ['clean', 'sass', 'html', 'webserver', 'watch']);
