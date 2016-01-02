'use strict';

var _ = require('lodash'),
  cheerio = require('cheerio'),
  urlM = require("url");

module.exports = function(grunt) {

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Automatically load required Grunt tasks
  require('jit-grunt')(grunt, {
    useminPrepare: 'grunt-usemin',
    ngtemplates: 'grunt-angular-templates',
    cdnify: 'grunt-google-cdn',
    properties: 'grunt-properties-reader',
    injector: 'grunt-asset-injector'
  })({
    customTasksDir: 'tasks'
  });

  // Configurable paths for the application
  var appConfig = {
    app: require('./bower.json').appPath || 'app',
    dist: 'dist',
    lrProps: ['lr.properties', 'lr-override.properties'],
    warDistFolder: 'dist',
    connect: {
      host: 'localhost',
      port: '9000',
      protocol: 'http',
      livereload: 35729
    },
    appName:'ngLiferay-login'
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: appConfig,

    //lr properties file parsing
    properties: {
      lr: '<%=yeoman.lrProps %>',
      enableCache: '<%=lr.enableCache %>'
    },

    createWar: {
      props: {
        themeId: '<%=lr.themeId %>',
        themeName: '<%=lr.themeName %>',
        warName: '<%=lr.themeId %>-theme'
      }
    },
    war: {
      target: {
        options: {
          war_dist_folder: '<%=yeoman.warDistFolder %>',
          war_name: '<%= createWar.props.warName%>'
        },
        files: [{
          expand: true,
          cwd: '.tmpWar/<%= createWar.props.warName%>/',
          src: ['**'],
          dest: ''
        }]
      }
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      injectJS: {
        files: [
          '<%= yeoman.app %>/**/*.js',
          '!<%= yeoman.app %>/**/*.spec.js',
          '!<%= yeoman.app %>/**/*.mock.js',
          '!<%= yeoman.app %>/app/app.js',
          '!<%= yeoman.app %>/app/devNgFixes.js',
          '!<%= yeoman.app %>/app/ngLiferayServices.js'
        ],
        tasks: ['injector:scripts']
      },
      injectCss: {
        files: [
          '<%= yeoman.app %>/**/*.css'
        ],
        tasks: ['injector:css']
      },
      mochaTest: {
        files: ['server/**/*.spec.js'],
        tasks: ['env:test', 'mochaTest']
      },

      //      injectSass: {
      //        files: [
      //          '<%= yeoman.app %>/**/*.{scss,sass}'],
      //        tasks: ['injector:sass']
      //      },
      //      sass: {
      //        files: [
      //          '<%= yeoman.app %>/**/*.{scss,sass}'],
      //        tasks: ['sass', 'autoprefixer']
      //      },
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['<%= yeoman.app %>/js/{,*/}*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      styles: {
        files: ['<%= yeoman.app %>/css/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '.tmp/css/{,*/}*.css',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
      //      ,
      //      copyAll: {
      //        files: ['<%= yeoman.app %>/{,*/}*.html'],
      //        tasks: ['properties', 'serveWar']
      //      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: '<%=yeoman.connect.port %>',
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: '<%=yeoman.connect.host %>',
        livereload: '<%=yeoman.connect.livereload %>'
      },
      livereload: {
        options: {
          open: false,
          middleware: function(connect) {
            return [function cors(req, res, next) {

                //adding cors header so that liferay can access under dev env
                res.setHeader('Access-Control-Allow-Origin', "*");
                res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
                next();
              },
              connect.static('.tmp'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')),
              connect().use(
                '/app/css',
                connect.static('./app/css')),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      test: {
        options: {
          port: 9001,
          middleware: function(connect) {
            return [
              connect.static('.tmp'),
              connect.static('test'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= yeoman.app %>/js/{,*/}*.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/{,*/}*',
            '!<%= yeoman.dist %>/.git{,*/}*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      server: {
        options: {
          map: true
        },
        files: [{
          expand: true,
          cwd: '.tmp/css/',
          src: '{,*/}*.css',
          dest: '.tmp/css/'
        }]
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/css/',
          src: '{,*/}*.css',
          dest: '.tmp/css/'
        }]
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      app: {
        src: ['<%= yeoman.app %>/index.html'],
        ignorePath: /\.\.\//
      },
      test: {
        devDependencies: true,
        src: '<%= karma.unit.configFile %>',
        ignorePath: /\.\.\//,
        fileTypes: {
          js: {
            block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
            detect: {
              js: /'(.*\.js)'/gi
            },
            replace: {
              js: '\'{{filePath}}\','
            }
          }
        }
      }
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
              js: ['concat'],
              css: ['concat']
            },
            post: {}
          }
        }
      }
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/css/{,*/}*.css'],
      js: ['<%= yeoman.dist %>/js/{,*/}*.js'],
      options: {
        assetsDirs: [],
        patterns: {
          js: [
            [/(images\/[^''""]*\.(png|jpg|jpeg|gif|webp|svg))/g, 'Replacing references to images']
          ]
        },
        blockReplacements: {
          css: function(block) {
            var cacheEnabled = grunt.config('properties').enableCache;

            return '<link rel="stylesheet" href="/' + grunt.config('createWar').props.warName + '/' + block.dest +
              (!cacheEnabled ? "?t=" + new Date().getTime() : "") + '"/>';
          },
          js: function(block) {
            var cacheEnabled = grunt.config('properties').enableCache;
            return '<script src="/' + grunt.config('createWar').props.warName + '/' + block.dest +
              (!cacheEnabled ? "?t=" + new Date().getTime() : "") + '"></script>';
          }
        }
      }
    },
    ngtemplates: {
      dist: {
        options: {
          module: '<%=yeoman.appName %>',
          source: function(source) {

            //resolve included images urls relative to theme
            var $ = cheerio.load(source),
              warName = grunt.config('createWar').props.warName;

            $('img').each(function() {
              var $t = $(this),
                u = urlM.parse($t.attr("src"));
              $t.attr("src", '/' + warName + '/' + u.path);
              $t.removeAttr("fallback");
            });

            return $.html();
          },
					concat: "generated"
        },
        cwd: '<%= yeoman.app %>',
        src: 'views/{,*/}*.html',
        dest: '.tmp/templateCache.js'
      }
    },

    // ng-annotate tries to make the code safe for minification automatically
    // by using the Angular long form for dependency injection.
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat/js',
          src: '*.js',
          dest: '.tmp/concat/js'
        }]
      }
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
            'images/{,*/}*.{webp}',
            'css/fonts/{,*/}*.*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/images',
          src: ['generated/*']
        }, {
          expand: true,
          cwd: 'bower_components/bootstrap/dist',
          src: 'fonts/*',
          dest: '<%= yeoman.dist %>'
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/css',
        dest: '.tmp/css/',
        src: '{,*/}*.css'
      },
      copyDefaultWar: {
        expand: true,
        cwd: 'lr_theme',
        dest: '.tmpWar/<%= createWar.props.warName%>/',
        src: ['**'],
        options: {
          process: function(content, srcpath) {
            console.log(srcpath);
            var compiled = _.template(content);
            return compiled(grunt.config('createWar').props);
          }
        }
      },
      distCopyToWar: {
        expand: true,
        cwd: '<%= yeoman.dist %>',
        dest: '.tmpWar/<%= createWar.props.warName%>/',
        src: ['fonts/*', 'images/*', 'css/*', 'js/*']
      },
      indexCopyToPortalNormal: {
        src: '<%= yeoman.dist %>/index.html',
        dest: '.tmpWar/<%= createWar.props.warName%>/templates/portal_normal.vm',
        options: {
          process: function(content, srcpath) {
            //remove devNgFixes.js and ngLiferayServices from index.html
            var $ = cheerio.load(content, {
              decodeEntities: false
            });

            $("script[src='js/devNgFixes.js']").remove();
            $("script[src='js/ngLiferayServices.js']").remove();
            return $.html();
          }
        }
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'copy:styles'
      ],
      test: [
        'copy:styles'
      ],
      dist: [
        'copy:styles'
      ]
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    },
    injector: {
      options: {},
      // Inject application script files into index.html (doesn't include bower)
      scripts: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/app/', '');
            filePath = filePath.replace('/.tmp/', '');
            return '<script src="' + filePath + '"></script>';
          },
          starttag: '<!-- injector:js -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          '<%= yeoman.app %>/index.html': [
            ['{.tmp,<%= yeoman.app %>}/**/*.js',
              '!{.tmp,<%= yeoman.app %>}/js/app.js',
              '!{.tmp,<%= yeoman.app %>}/**/*.spec.js',
              '!{.tmp,<%= yeoman.app %>}/**/*.mock.js',
              '!<%= yeoman.app %>/js/devNgFixes.js',
              '!<%= yeoman.app %>/js/ngLiferayServices.js'
            ]
          ]
        }
      },

      // Inject component scss into app.scss
      //      sass: {
      //        options: {
      //          transform: function (filePath) {
      //            filePath = filePath.replace('/app/', '');
      //            return '@import \'' + filePath + '\';';
      //          },
      //          starttag: '// injector',
      //          endtag: '// endinjector'
      //        },
      //        files: {
      //          '<%= yeoman.app %>/app.scss': [
      //            '<%= yeoman.app %>/**/*.{scss,sass}',
      //            '!<%= yeoman.app %>/app.{scss,sass}'
      //          ]
      //        }
      //      },

      // Inject component css into index.html
      css: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/app/', '');
            filePath = filePath.replace('/.tmp/', '');
            return '<link rel="stylesheet" href="' + filePath + '">';
          },
          starttag: '<!-- injector:css -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          '<%= yeoman.app %>/index.html': [
            '<%= yeoman.app %>/**/*.css'
          ]
        }
      }
    }
  });

  grunt.registerTask('serve', 'Compile then start a connect web server', function(target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'properties',
      'serveWar',
      'clean:server',
      //      'injector:sass',
      'concurrent:server',
      'injector',
      'wiredep',
      'autoprefixer:server',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function(target) {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve:' + target]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'wiredep',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'properties',
    'clean:dist',
    //    'injector:sass',
    'concurrent:dist',
    'injector',
    'wiredep',
    'useminPrepare',
    'autoprefixer',
    'ngtemplates',
    // 'ngAnnotate',
    'concat',
    'copy:dist',

  ]);

  grunt.registerTask('init-war', [
    'properties',
    'createWar',
    'deployWar'
  ]);

  grunt.registerTask('build-service', [
    'properties',
    'buildService'
  ]);

  grunt.registerTask('default', ['serve']);
  /*grunt.registerTask('default', [
        'newer:jshint',
        'test',
        'build'
      ]);*/
};
