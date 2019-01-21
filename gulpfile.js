const gulp = require('gulp');
const eslint = require('gulp-eslint');
const babel = require('gulp-babel');
const jsdoc = require('gulp-jsdoc3');
const connect = require('gulp-connect');
const webpack = require('webpack');
const path = require('path');
const jest = require('gulp-jest').default;

gulp.task('default', () => {
  gulp.start('lint', 'jest', 'babel', 'doc');
});

gulp.task('lint', () => gulp.src(['src/*.js', '!node_modules/**'])
  .pipe(eslint())
  .pipe(eslint.format()));

gulp.task('babel', () => {
  gulp.src('lib/*.js')
    .pipe(babel({
      presets: ['env'],
      plugins: ['transform-object-rest-spread'],
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', () => {
  webpack({
    entry: [
      'babel-polyfill',
      path.join(__dirname, 'lib/factom-harmony-connect-js-sdk'),
    ],
    output: {
      path: './dist/',
      filename: 'bundle.js',
      library: 'FactomSDK',
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            presets: ['env'],
            plugins: ['transform-object-rest-spread'],

          },
        },
        {
          test: /\.json$/,
          loader: 'json-loader',
        },
      ],
    },
    resolve: {
      extensions: ['', '.js'],
    },
  }).run((err, stat) => {
    if (err) {
      // error log for gulp task
      // eslint-disable-next-line no-console
      console.error('Error building application - ', err);
      return;
    }
    const statJson = stat.toJson();
    if (statJson.errors.length > 0) {
      // error log for gulp task
      // eslint-disable-next-line no-console
      console.log('Error building application - ', statJson.errors);
      return;
    }
    // error log for gulp task
    // eslint-disable-next-line no-console
    console.log('Application built successfully !');
  });
});

gulp.task('jest', () => {
  process.env.NODE_ENV = 'test';

  return gulp.src('__tests__').pipe(jest({
    preprocessorIgnorePatterns: [
      '<rootDir>/dist/', '<rootDir>/node_modules/',
    ],
    automock: false,
  }));
});

gulp.task('doc', (cb) => {
  gulp.src(['README.md', 'src/*.js'], { read: false })
    .pipe(jsdoc(cb));
});

gulp.task('webserver', () => {
  connect.server({
    port: 8080,
  });
});
