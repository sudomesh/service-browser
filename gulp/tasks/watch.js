var gulp       = require('gulp');
var livereload = require('gulp-livereload');

gulp.task('watch', function() {
	var server = livereload();

	var reload = function(file) {
		server.changed(file.path);
	};

	gulp.watch('www/js/**', ['browserify']);
	gulp.watch('www/templates/**', ['browserify']);
	gulp.watch('www/css/**', ['less']);
	gulp.watch('www/img/**', ['images']);
	gulp.watch(['build/**']).on('change', reload);
});
