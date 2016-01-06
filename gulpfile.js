// Borrowed from the most excellent Holeshot frontend framework by Don Jones (https://github.com/newelement)
'use strict';

var gulp          = require('gulp'),
	
	autoprefixer  = require('gulp-autoprefixer'),
	browserSync   = require('browser-sync'),
	compass       = require('gulp-compass'),
	concat        = require('gulp-concat'),
	gulpif        = require('gulp-if'),
	gutil         = require('gulp-util'),
	htmlhint      = require("gulp-htmlhint"),
	imagemin      = require('gulp-imagemin'),
	jshint        = require('gulp-jshint'),
	modernizr     = require('gulp-modernizr'),
	notify        = require('gulp-notify'),
	plumber       = require('gulp-plumber'),
	rename        = require("gulp-rename"),
	sourcemaps    = require('gulp-sourcemaps'),
	svgmin        = require('gulp-svgmin'),
	uglify        = require('gulp-uglify'),
	useref        = require('gulp-useref'),
	
	reload        = browserSync.reload,
	config        = require('./config.json'),
    dest          = ( config.dest.length )? config.dest : '.',
    assets        = ( config.assets.length )? '/'+config.assets : '',
    bsOptions     = ( config.hostname.length )? { proxy : config.hostname, online: true } : { server: { baseDir: "./src/" } };	
	

// Gulp plumber error handler
var onError = function(err) {
	//console.log(err); // Commenting out because it's mostly annoying. Enable as needed.
	//this.emit('end');
};


// Removes unicode and ANSI from notify messages
var colorReplace = function( input, replace ) {
    
    var replaceColors = {
            "0;31" : "{r",
            "1;31" : "{R",
            "0;32" : "{g",
            "1;32" : "{G",
            "0;33" : "{y",
            "1;33" : "{Y",
            "0;34" : "{b",
            "1;34" : "{B",
            "0;35" : "{m",
            "1;35" : "{M",
            "0;36" : "{c",
            "1;36" : "{C",
            "0;37" : "{w",
            "1;37" : "{W",
            "1;30" : "{*",
            "0" : "{x"
    };

    if ( replace ){
        for( k in replaceColors ){
            var re = new RegExp( "\\033\\[" + k + "m" );
            input = input.replace( re, replaceColors[ k ] );
        }
    } else {
        input = input.replace( /\033\[[0-9;]*m/g, "" );
        input = input.replace(/[\uE000-\uF8FF]/g, '');
    }

    return input;
};


// Modernizr settings. Feel free to modify as needed.
var modernizrSettings = {
    "options" : [
        "setClasses",
        "addTest",
        "html5shiv"
    ]
};



/*
	IMAGE/SVG TASKS
------------------------------------------------------*/

// Compresses images for production.
gulp.task('images', function() {
	return gulp.src( './src'+assets+'/images/**/*.{jpg,jpeg,png,gif}' )
		.pipe(imagemin())
		.pipe(gulp.dest( dest+assets+'/images' ));
});

// Compresses SVG files for production.
gulp.task('svg', function() {
    return gulp.src('./src'+assets+'/images/**/*.svg')
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(gulp.dest(dest+assets+'/images'))
});




/*
	HTML TASKS
------------------------------------------------------*/

// No more missing closed tags in large html files :-).
gulp.task('html', function() {
	return gulp.src("./src/*.html")
		.pipe(plumber({errorHandler: onError}))
    	.pipe(htmlhint())
		.pipe(htmlhint.failReporter())
		.on('error', notify.onError(function( err ){ 
				return { message: colorReplace(err.message), title : 'HTML Error', sound: "Frog"}; 
			})
		);
});




/*
	JAVASCRIPT TASKS	
------------------------------------------------------*/

// Development JS creation. 
// Checks for errors and concats. Does not minify.
gulp.task('js', function () {
    return gulp.src( ['./src'+assets+'/js/**/*.js', '!./src'+assets+'/js/modernizr.js'] )
   		.pipe(plumber({errorHandler: onError}))
		.pipe(jshint())
		.pipe(jshint.reporter('fail'))
		.pipe(notify(function (file) {
		    if (file.jshint.success) {
		    	return { message : 'JS much excellent success!', title : file.relative, sound: false};
		    }
		
		    var errors = file.jshint.results.map(function (data) {
		       	if (data.error) {
		        	return "(" + data.error.line + ':' + data.error.character + ') ' + data.error.reason;
		        }
		    }).join("\n");
		    return { message : file.relative + " (" + file.jshint.results.length + " errors)\n" + errors, sound: "Frog", emitError : true, title : 'JSHint Error' };
    	}))
    	.pipe(reload({stream: true}));
});

// This does one final error check and creates a map file for production.
gulp.task('build:js', function () {
    return gulp.src( ['./src'+assets+'/js/**/*.js', '!./src'+assets+'/js/modernizr.js'] )
   		.pipe(plumber({errorHandler: onError}))
		.pipe(jshint())
		.pipe(jshint.reporter('fail'))
		.pipe(notify(function (file) {
		    if (file.jshint.success) {
		        return { message : 'JS much excellent success!', title : file.relative, sound: false };
		    }
		
			var errors = file.jshint.results.map(function (data) {
		       	if (data.error) {
					return "(" + data.error.line + ':' + data.error.character + ') ' + data.error.reason;
		       	}
		    }).join("\n");
			return { message : file.relative + " (" + file.jshint.results.length + " errors)\n" + errors, sound: "Frog", emitError: true, title : 'JSHint Error' };
    	}));
});

// modernizr will crawl your css and js to look for any reference to tests. 
// Ex. if you use .svg or .video in your css, modernizer will add the tests for them.
gulp.task('modernizr', function() {
  gulp.src(['./src'+assets+'/js/app.js', './src'+assets+'/css/*.css'])
  	.pipe(plumber({errorHandler: onError}))
    .pipe(modernizr(modernizrSettings))
    .on('error', notify.onError(function( err ){ 
			return { message: colorReplace(err.message), title : 'Modernizr Error', sound: "Frog"}; 
		})
	)
    .pipe(gulp.dest("./src"+assets+"/js/"))
});

// This will copy over to the app/js folder and minimize modernizr for production
gulp.task('build:modernizr', function() {
  gulp.src(['./src'+assets+'/js/modernizr.js'])
  	.pipe(plumber({errorHandler: onError}))
    .pipe(uglify())
    .on('error', notify.onError(function( err ){ 
			return { message: colorReplace(err.message), title : 'Modernizr Error', sound: "Frog"}; 
		})
	)
    .pipe(gulp.dest(dest+assets+"/js/"))
});




/*
	CSS TASKS
------------------------------------------------------*/

// Development CSS creation. 
// Checks for errors and concats. Does not minify.
gulp.task('scss', function() {
	return gulp.src('./src'+assets+'/scss/**/*.scss')
		.pipe(plumber({errorHandler: onError}))
		.pipe(compass({
			css: './src'+assets+'/css',
			sass: './src'+assets+'/scss',
			image: './src'+assets+'/images',
		}))
		.on('error', notify.onError(function( err ){ 
				return { message: colorReplace(err.message), title : 'CSS Error', sound: "Frog"}; 
			})
		)
		.pipe(autoprefixer({browsers: ['last 2 versions', 'ie >= 8', '> 1%']}))
		.pipe(gulp.dest('./src'+assets+'/css'))
		.on('error', notify.onError(function( err ){ 
				return { message: colorReplace(err.message), title : 'CSS Error', sound: "Frog"}; 
			})
		)
		.pipe(notify({ message: 'Styles much compiled success!', title : 'style.css', sound: false }))
		.pipe(reload({stream: true}));
});

// This does one final error check, creates a map file and compresses the css for production.
gulp.task('build:scss', function() {
	return gulp.src('./src'+assets+'/scss/**/*.scss')
		.pipe(plumber({errorHandler: onError}))
		.pipe(compass({
			css: dest+assets+'/css',
			sass: './src'+assets+'/scss',
			sourcemap : true,
			style : 'compressed',
			image: dest+assets+'/images',
		}))
		.on('error', notify.onError(function( err ){ 
				return { message: colorReplace(err.message), title : 'CSS Error', sound: "Frog"}; 
			})
		)
		.pipe(autoprefixer({browsers: ['last 2 versions', 'ie >= 8', '> 1%']}))
		.pipe(gulp.dest(dest+assets+'/css'))
		.on('error', notify.onError(function( err ){ 
				return { message: colorReplace(err.message), title : 'CSS Error', sound: "Frog"}; 
			})
		)
		.pipe(notify({ message: 'Styles much compiled success!', title : 'style.css', sound: false }));
});



/*
	MAIN HTML and JS/CSS BUILDS
------------------------------------------------------*/

// This runs all the tasks for production.
gulp.task('build:app', ['html', 'images', 'svg', 'build:js', 'build:scss', 'build:modernizr'], function () {
   
    var assets = useref.assets();
    
    // Copy over the .htaccess file to the app folder
    gulp.src("./src/.htaccess")
		.pipe(gulp.dest(dest+"/"));
	
	// Copy over the crossdomain.xml file to the app folder
    gulp.src("./src/crossdomain.xml")
		.pipe(gulp.dest(dest+"/"));
	
	// Copy over the humans.txt file to the app folder
    gulp.src("./src/humans.txt")
		.pipe(gulp.dest(dest+"/"));
		
	// Copy over the robots.txt file to the app folder
    gulp.src("./src/robots.txt")
		.pipe(gulp.dest(dest+"/"));
	
	// Copy over your fonts
	gulp.src('./src'+assets+'/fonts/**/*.{ttf,woff,woff2,eof,eot,svg}')
		.pipe(gulp.dest(dest+assets+'/fonts'));
	
	// Copy over the favicons
	gulp.src('./src/favicon.ico')
		.pipe(gulp.dest(dest+'/'));
	gulp.src('./src/favicon.png')
		.pipe(gulp.dest(dest+'/'));
		
	// Copy over any videos
	gulp.src('./src'+assets+'/videos/**/*.{mp4,ogv,ogg,webm}')
		.pipe(gulp.dest(dest+assets+'/videos'));
	
    
    // This reads your included scripts on your html page, concats them and minifies them into one file.
    return gulp.src(['./src/*.html'])
    	.pipe(plumber({errorHandler: onError}))
	    .pipe(assets)
	    .pipe(sourcemaps.init())
		    .pipe( gulpif('*.js', uglify() ))
		    .pipe(assets.restore())
		    .pipe(useref())
	    .pipe(sourcemaps.write('./'))
	    .on('error', notify.onError(function( err ){ 
				return { message: colorReplace(err.message), title : 'Build Error', sound: "Frog"}; 
			})
		)
        .pipe(gulp.dest(dest+'/'));
   
});




/*
	BOWER ASSETS
------------------------------------------------------*/

// Pulls some of the bower assets to the src folders.
// Add/modify as needed.
gulp.task('bower-assets', function(){
	
	// This copies the bower normalize css file over to the scss components folder.
	// If you updated normalize it will get updated in your app src on next [gulp serve].
	gulp.src("./src/bower/normalize.css/normalize.css")
		.pipe(rename("_normalize.scss"))
		.pipe(gulp.dest("./src"+assets+"/scss/components/"));
	
	// Copies over animate.css from bower to scss components folder.
	gulp.src("./src/bower/animate.css/animate.css")
		.pipe(rename("_animate.scss"))
		.pipe(gulp.dest("./src"+assets+"/scss/components/"));
	
	// Sass easing
	gulp.src("./src/bower/sass-easing/_sass-easing.scss")
		.pipe(gulp.dest("./src"+assets+"/scss/components/"));

});




/*
	COMMANDS	
------------------------------------------------------

[gulp dev] - Development task

[gulp build] - Production task

*/

// gulp serve	
gulp.task('dev', ['bower-assets'], function () {
	
	// injectChange = false forces browser refresh.
	// bsOptions.injectChanges = false;
	// Enables the external URLs for browserSync
	// bsOptions.xip = true;
	
    browserSync( bsOptions );
	
	// This first watch causes [gulp serve] to start very slow. Omit if needed.
	// The rest... watch the files and run the task(s).
    gulp.watch(["**/*.php","**/*.html"]).on("change", reload);
    gulp.watch("src"+assets+"/scss/**/*.scss", ['scss']);
    gulp.watch(["src"+assets+"/js/**/*.js", '!./src'+assets+'/js/modernizr.js'], ['js']);
    gulp.watch("src/**/*.html", ['html']);
    gulp.watch(["src"+assets+"/css/style.css", "src"+assets+"/js/app.js"], ['modernizr']);
});


// gulp build
gulp.task('build', ['build:app']);
