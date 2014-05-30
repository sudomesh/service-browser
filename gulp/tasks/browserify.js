
var browserify   = require('browserify');
var gulp         = require('gulp');
var handleErrors = require('../util/handleErrors');
var source       = require('vinyl-source-stream');
var process      = require('process');

//process.env.BROWSERIFYSHIM_DIAGNOSTICS=1;

var hbsfy = require('hbsfy').configure({
  extensions: ['html']
});

gulp.task('browserify', ['images', 'less'], function(){
	return browserify({
      transform: ['hbsfy', 'cssify'],
			entries: ['./www/js/app.js'],
		})
		.bundle({debug: true})
		.on('error', handleErrors)
		.pipe(source('app.js'))
		.pipe(gulp.dest('./www/build/'));
});


