var changed    = require('gulp-changed');
var gulp       = require('gulp');
var imagemin   = require('gulp-imagemin');

gulp.task('images', function() {
	var dest = './www/build/images';

	return gulp.src('./www/img/**')
		.pipe(changed(dest)) // Ignore unchanged files
		.pipe(imagemin()) // Optimize
		.pipe(gulp.dest(dest));
});
