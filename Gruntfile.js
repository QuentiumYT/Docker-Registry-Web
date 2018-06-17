/* eslint-disable strict */

'use strict';

const loadGruntTasks = require('load-grunt-tasks');
const gruntTime = require('time-grunt');
// See http://stackoverflow.com/questions/17080494/using-grunt-server-how-can-i-redirect-all-requests-to-root-url
const modRewrite = require('connect-modrewrite');
const gruntConnectProxy = require('grunt-connect-proxy/lib/utils');

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = (grunt) => {
  // Load grunt tasks automatically
  loadGruntTasks(grunt);

  // Time how long tasks take. Can help when optimizing build times
  gruntTime(grunt);

  grunt.loadNpmTasks('grunt-connect-proxy');

  // Configurable paths for the application
  const appConfig = {
    app: 'app',
    dist: 'dist',
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: appConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['<%= yeoman.app %>/{,*/}*.js'],
        tasks: ['newer:eslint'],
        options: {
          livereload: '<%= connect.options.livereload %>',
        },
      },
      styles: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'autoprefixer'],
      },
      gruntfile: {
        files: ['Gruntfile.js'],
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>',
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
        ],
      },
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: '0.0.0.0',
        livereload: 35729,
      },
      proxies: [
        {
          context: '/v2',
          host: process.env.DOCKER_REGISTRY_HOST,
          port: process.env.DOCKER_REGISTRY_PORT,
          https: false,
          xforward: false,
          headers: {
            'x-custom-added-header': 'custom-value',
          },
        },
      ],
      livereload: {
        options: {
          open: true,
          middleware(connect) {
            const middlewares = [];

            // enable Angular's HTML5 mode
            // http://stackoverflow.com/questions/17080494/using-grunt-server-how-can-i-redirect-all-requests-to-root-url
            middlewares.push(modRewrite(['!^/v2/|\\.html|\\.js|\\.svg|\\.css|\\.png|\\.woff2|\\.woff|\\.ttf|\\.jpg$ /index.html [L]']));

            // Setup the proxy
            middlewares.push(gruntConnectProxy.proxyRequest);

            // Serve static files
            middlewares.push(connect.static('.tmp'));
            middlewares.push(connect().use('/node_modules', connect.static('./node_modules')));
            middlewares.push(connect.static(appConfig.app));

            return middlewares;
          },
        },
      },
      dist: {
        options: {
          open: true,
          base: '<%= yeoman.dist %>',
        },
      },
    },

    babel: {
      options: {
        sourceMap: true,
        presets: ['env'],
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: ['scripts.js'],
          dest: '.tmp/concat/scripts',
        }],
      },
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    eslint: {
      options: {
        configFile: './.eslintrc.json',
      },
      target: ['.'],
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/{,*/}*',
            '!<%= yeoman.dist %>/.git*',
          ],
        }],
      },
      server: '.tmp',
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version'],
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/',
        }],
      },
    },

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%= yeoman.dist %>/{,*/}*.js',
          '<%= yeoman.dist %>/styles/{,*/}*.css',
          '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= yeoman.dist %>/styles/fonts/*',
        ],
      },
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin'],
            },
            post: {},
          },
        },
      },
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        assetsDirs: ['<%= yeoman.dist %>', '<%= yeoman.dist %>/images'],
      },
    },

    // The following *-min tasks will produce minified files in the dist folder
    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/styles/main.css': [
    //         '.tmp/styles/{,*/}*.css'
    //       ]
    //     }
    //   }
    // },
    // uglify: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/scripts/scripts.js': [
    //         '<%= yeoman.dist %>/scripts/scripts.js'
    //       ]
    //     }
    //   }
    // },
    // concat: {
    //   dist: {}
    // },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/images',
        }],
      },
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/images',
        }],
      },
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: true,
          removeCommentsFromCDATA: true,
          removeOptionalTags: true,
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>',
          src: ['*.html', '{,*/}*.html'],
          dest: '<%= yeoman.dist %>',
        }],
      },
    },

    // ng-annotate tries to make the code safe for minification automatically
    // by using the Angular long form for dependency injection.
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/scripts',
          src: ['*.js', '!oldieshim.js'],
          dest: '.tmp/concat/scripts',
        }],
      },
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            '*.html',
            '{,*/}*.html',
            'images/{,*/}*.{webp}',
            'fonts/*',
          ],
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: ['generated/*'],
        }, {
          expand: true,
          cwd: 'node_modules/bootstrap/dist',
          src: 'fonts/*',
          dest: '<%= yeoman.dist %>',
        }],
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css',
      },
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'copy:styles',
      ],
      dist: [
        'copy:styles',
        'imagemin',
        'svgmin',
      ],
    },
  });

  grunt.loadNpmTasks('grunt-babel');

  grunt.registerTask('serve', 'Compile then start a connect web server', (target) => {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    return grunt.task.run([
      'clean:server',
      'concurrent:server',
      'autoprefixer',
      'configureProxies:server',
      'connect:livereload',
      'watch',
    ]);
  });

  grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', (target) => {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run([`serve:${target}`]);
  });

  grunt.registerTask('lint', ['eslint']);

  grunt.registerTask('build', [
    'clean:dist',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'ngAnnotate',
    'babel:dist',
    'copy:dist',
    'cssmin',
    'uglify',
    'filerev',
    'usemin',
    'htmlmin',
  ]);

  grunt.registerTask('default', [
    'newer:eslint',
    'build',
  ]);
};
