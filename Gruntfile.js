module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		sass: {
			cube: {
				options: {
					compass: true,
					style: 'expanded'
				},

				files: {
					'cube.css': 'cube.scss'
				}
			},

			page: {
				options: {
					compass: true,
					style: 'compressed'
				},

				files: {
					'gh-pages-css/main.css': 'gh-pages-scss/main.scss'
				}
			}
		},

		jshint: {
			files: ['cube.js']
		},

		uglify: {
			cube: {
				files: {
					'cube.min.js': 'cube.js'
				}
			}
		},

		docco: {
			cube: {
				src: ['cube.js'],
				options: {
					output: 'cube-js-docco',
					css: 'docco-css/docco.css'
				}
			}
		},

		watch: {
			html: {
				files: ['*.html'],
				options: { livereload: true }
			},

			css: {
				files: ['*.css', 'gh-pages-css/main.css'],
				options: { livereload: true }
			},

			cubeSass: {
				files: ['cube.scss'],
				tasks: ['sass:cube']
			},

			pageSass: {
				files: ['gh-pages-scss/main.scss'],
				tasks: ['sass:page']
			},

			cubeJs: {
				files: ['cube.js'],
				tasks: ['jshint', 'docco:cube', 'uglify:cube'],
				options: { livereload: true }
			}
		}
	});

	// Load the plugin(s).
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-docco');

	// Task(s).
	grunt.registerTask('default', ['watch']);
};