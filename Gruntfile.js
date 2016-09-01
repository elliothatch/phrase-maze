module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		env : {
			dev : {
				NODE_ENV : 'development',
			},
			test : {
				NODE_ENV : 'test',
			}
		},
		jshint: {
			all: ['Gruntfile.js', 'server/src**/*.js', 'server/test/**/*.js']
		},

		mochaTest: {
			test: {
				options: {
					reporter: 'spec',
					require: 'coverage/blanket'
				},
				src: ['server/test/**/*.js']
			},
			coverage: {
				options: {
					reporter: 'html-cov',
					quiet: true,
					captureFile: 'logs/coverage.html'
				},
				src: ['server/test/**/*.js']
			},
			lcov: {
				options: {
					reporter: 'mocha-lcov-reporter',
					quiet: true,
					captureFile: 'logs/lcov.info'
				},
				src: ['server/test/**/*.js']
			},
			'travis-cov': {
				options: {
					reporter: 'travis-cov'
				},
				src: ['server/test/**/*.js']
			}
		},

		jsdoc: {
			dist: {
				src: ['server/src/**/*.js', 'server/test/**/*.js'],
				options: {
					destination: 'doc'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-env');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-jsdoc');

	// Default task(s)
	// TODO: dev task
	grunt.registerTask('test', ['env:test', 'jshint', 'mochaTest']);
	grunt.registerTask('default', ['test']);

};
