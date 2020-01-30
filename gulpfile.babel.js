'use strict';

const path = require('path');

import webpack          from 'webpack';
import webpackStream    from 'webpack-stream';
import gulp             from 'gulp';
import gulpif           from 'gulp-if';
import browsersync      from 'browser-sync';
import autoprefixer     from 'gulp-autoprefixer';
import pug              from 'gulp-pug';
import pugbem           from 'gulp-pugbem';
import stylus           from 'gulp-stylus';
import gcmq             from 'gulp-group-css-media-queries';
import mincss           from 'gulp-clean-css';
import rename           from 'gulp-rename';
import clean            from 'gulp-clean'
import replaceName      from 'gulp-replace-name';
import imagemin         from 'gulp-imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminZopfli   from 'imagemin-zopfli';
import imageminMozjpeg  from 'imagemin-mozjpeg';
import imageminWebp     from 'imagemin-webp';
import webp             from 'gulp-webp';
import favicons         from 'gulp-favicons';
import plumber          from 'gulp-plumber';
import debug            from 'gulp-debug';
import yargs            from 'yargs';
import named            from 'vinyl-named';


const webpackConfig = require('./webpack.config.js'),
	argv = yargs.argv,
	production = !!argv.production,
	paths = {
		views: {
			src: [
				'./src/views/pages/*/*.pug',
				'./src/views/pages/*.pug',
			],
			basedir: path.resolve(__dirname, 'src'),
			dist: './build/',
			watch: [
				'./src/components/**/*.pug',
				'./src/views/**/*.pug'
			]
		},
		styles: {
			src: [
				'./src/styles/pages/*/*.styl',
				'./src/styles/pages/*.styl'
			],
			build: './build/styles/',
			watch: [
				'./src/components/**/*.styl',
				'./src/styles/**/*.styl'
			]
		},
		scripts: {
			src: ['./src/js/main.js'],
			build: './build/js/',
			watch: [
				'./src/components/**/*.js',
				'./src/js/**/*.js'
			]
		},
		images: {
			src: [
				'./src/images/**/*.{jpg,jpeg,png,gif,svg}'
			],
			build: './build/images/',
			watch: './src/images/**/*.{jpg,jpeg,png,gif,svg}'
		},
		webp: {
			src: './src/images/**/*.webp.{jpg,jpeg,png}',
			build: './build/images/',
			watch: './src/images/**/*.webp.{jpg,jpeg,png}'
		},
		fonts: {
			src: './src/fonts/**/*.{ttf,otf,woff,woff2,eot}',
			build: './build/fonts/',
			watch: './src/fonts/**/*.{ttf,otf,woff,woff2}'
		},
		favicons: {
			src: './src/images/favicon.{jpg,jpeg,png,gif,ico}',
			build: './build/images/favicons/'
		}
	};

webpackConfig.mode = production ? 'production' : 'development';
webpackConfig.devtool = production ? false : 'cheap-eval-source-map';

export const server = () => {
	browsersync.init({
		server: './build/',
		notify: true
	});
	
	gulp.watch(paths.views.watch, views);
	gulp.watch(paths.styles.watch, styles);
	gulp.watch(paths.scripts.watch, scripts);
	gulp.watch(paths.images.watch, images);
	gulp.watch(paths.webp.watch, webpimages);
};

export const cleanFiles = () => gulp.src('./dist/*', {read: false})
.pipe(clean())
.pipe(debug({
	'title': 'Cleaning...'
}));

export const views = () => gulp.src(paths.views.src)
.pipe(pug({
	plugins: [pugbem],
	basedir: paths.views.basedir,
	pretty: true
}))
.pipe(rename({
	dirname: ''
}))
.pipe(gulp.dest(paths.views.dist))
.on('end', browsersync.reload);

export const styles = () => gulp.src(paths.styles.src)
.pipe(plumber())
.pipe(stylus({
	'include css': true
}))
.pipe(gulpif(production, autoprefixer({
	browsers: ['last 12 versions', '> 0.1%', 'ie 8', 'ie 7']
})))
.pipe(gcmq())
.pipe(gulpif(production, mincss({
	compatibility: 'ie8', level: 2
})))
.pipe(rename({
	suffix: '.min',
	dirname: ''
}))
.pipe(plumber.stop())
.pipe(gulp.dest(paths.styles.build))
.pipe(debug({
	'title': 'CSS files'
}))
.pipe(browsersync.stream());

export const scripts = () => gulp.src(paths.scripts.src)
.pipe(named())
.pipe(webpackStream(webpackConfig, webpack))
.pipe(gulp.dest(paths.scripts.build))
.on('end', browsersync.reload);

export const images = () => gulp.src(paths.images.src)
.pipe(replaceName(/(jpe?g|png)$/, 'webp'))
.pipe(gulpif(production, imagemin([
	imageminPngquant({
		speed: 5,
		quality: 75
	}),
	imageminZopfli({
		more: true
	}),
	imageminMozjpeg({
		progressive: true,
		quality: 70
	}),
	imagemin.svgo({
		plugins: [
			{removeViewBox: false},
			{removeUnusedNS: false},
			{removeUselessStrokeAndFill: false},
			{cleanupIDs: false},
			{removeComments: true},
			{removeEmptyAttrs: true},
			{removeEmptyText: true},
			{collapseGroups: true}
		]
	})
])))
.pipe(gulp.dest(paths.images.build))
.pipe(debug({
	'title': 'Images'
}))
.on('end', browsersync.reload);

export const webpimages = () => gulp.src(paths.webp.src)
.pipe(replaceName(/webp\./, ''))
.pipe(webp(gulpif(production, imageminWebp({
	lossless: true,
	quality: 90,
	alphaQuality: 90
}))))
.pipe(gulp.dest(paths.webp.build))
.pipe(debug({
	'title': 'WebP images'
}));

export const fonts = () => gulp.src(paths.fonts.src)
.pipe(gulp.dest(paths.fonts.build))
.pipe(debug({
	'title': 'Fonts'
}));

export const favs = () => gulp.src(paths.favicons.src)
.pipe(favicons({
	icons: {
		appleIcon: true,
		favicons: true,
		online: false,
		appleStartup: false,
		android: false,
		firefox: false,
		yandex: false,
		windows: false,
		coast: false
	}
}))
.pipe(gulp.dest(paths.favicons.build))
.pipe(debug({
	'title': 'Favicons'
}));


export const development = gulp.series(
	gulp.parallel(cleanFiles, views, styles, scripts, images, webpimages, fonts, favs),
	gulp.parallel(server)
);

export const prod = gulp.series(cleanFiles, views, styles, scripts, images, webpimages, fonts, favs);

export default development;