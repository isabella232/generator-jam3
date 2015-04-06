module.exports = {
  config: {
    assets: 'assets',
    src: 'lib',
    dev: 'dev',
    dist: 'release',
    libs: '',
  },
  licensechecker: {
    options: {
      warn: true,
      outFile: null,
      acceptable: ['MIT', 'MIT/X11', 'BSD', 'ISC'],
      include: ['dependencies', 'devDependencies', 'peerDependencies']
    }
  },
  browserify: {
    'dev': {
      'src': 'index.js',
      'dest': '<%= config.dev %>/bundle.js',
      'options': {
        'debug': true,
        'watch': true,
        'verbose': true,
        'open': true,
        'browserifyOptions': {
          'debug': true
        }
      }
    },
    'dist': {
      'src': 'index.js',
      'dest': '<%= config.dist %>/bundle.js',
      'options': {
        'debug': false,
        'verbose': false
      }
    }
  },
  less: {
    dev: {
      options: {
        compress: true,
        sourceMap: true,
        sourceMapFilename: '<%= config.dev %>/main.css.map',
        sourceMapBasepath: '<%= config.dev %>/'
      },
      files: {
        '<%= config.dev %>/main.css': '<%= config.src %>/less/main.less'
      }
    },
    dist: {
      options: {
        compress: true,
        cleancss: true
      },
      files: {
        '<%= config.dist %>/main.css': '<%= config.src %>/less/main.less'
      }
    }
  },
  texturepacker: {
    src: '<%= config.assets %>/tp',
    options: {
      multipack: true,
      stdout: true,
      texturepath: '../assets/images/tp',
      model: '<%= config.src %>/model/desktopSprite'
    }
  },
  audio: {
    src: '<%= config.dev %>/assets/sounds/',
    options: {
      dest: '<%= config.dev %>/assets/',
      path: '/sounds/',
      model: '<%= config.src %>/model/soundModel.js',
      types: ['mp3', 'm4a', 'ogg'],
      stdout: true
    }
  },
  pngmin: {
    dynamic: {
      options: {
        force: true,
        ext: '.png'
      },
      files: [{
        expand: true,
        cwd: '<%= config.assets %>/images/',
        src: ['*.png', 'tp/*.png'],
        dest: '<%= config.dist %>/assets/images/'
      }]
    }
  },
  copy: {
    dev: {
      files: [{
        expand: true,
        cwd: '<%= config.assets %>/json/',
        src: '**',
        dest: '<%= config.dev %>/assets/json/'
      }, {
        expand: true,
        cwd: '<%= config.assets %>/images/',
        src: ['**'],
        dest: '<%= config.dev %>/assets/images/'
      }, {
        expand: true,
        cwd: '<%= config.assets %>/sounds/',
        src: ['**'],
        dest: '<%= config.dev %>/assets/sounds/'
      }, {
        expand: true,
        cwd: '<%= config.assets %>/videos/',
        src: ['**'],
        dest: '<%= config.dev %>/assets/videos/'
      }, {
        expand: true,
        cwd: '<%= config.assets %>/fonts/',
        src: ['**'],
        dest: '<%= config.dev %>/assets/fonts/'
      }]
    },
    dist: {
      files: [{
        expand: true,
        cwd: '<%= config.dev %>/assets/json/',
        src: '**',
        dest: '<%= config.dist %>/assets/json/'
      }, {
        expand: true,
        cwd: '<%= config.dev %>assets/images/',
        src: ['**'],
        dest: '<%= config.dist %>/assets/images/'
      }, {
        expand: true,
        cwd: '<%= config.dev %>assets/sounds/',
        src: ['**'],
        dest: '<%= config.dist %>/assets/sounds/'
      }, {
        expand: true,
        cwd: '<%= config.dev %>assets/videos/',
        src: ['**'],
        dest: '<%= config.dist %>/assets/videos/'
      }, {
        expand: true,
        cwd: '<%= config.dev %>assets/fonts/',
        src: ['**'],
        dest: '<%= config.dist %>/assets/fonts/'
      }]
    }
  },
  connect: {
    dev: {
      'options': {
        'base': '<%= config.dev %>/',
        'keepalive': false,
        'hostname': '0.0.0.0'
      }
    }
  },
  concat: {
    options: {
      separator: ';\n',
      sourceMap: false
    },
    dev: {
      src: '<%= config.libs %>',
      dest: '<%= config.dev %>/libs.js'
    },
    dist: {
      src: '<%= config.libs %>',
      dest: '<%= config.dist %>/libs.js'
    }
  },
  watch: {
    options: {
      livereload: true
    },
    less: {
      files: ['<%= config.src %>/less/**/*.less'],
      tasks: ['less:dev']
    },
    browserify: {
      files: ['<%= config.src %>/**/*.js', '*.js'],
      tasks: ['browserify:dev']
    },
    assets: {
      files: ['<%= config.assets %>/**/*'],
      tasks: ['copy:dev']
    }
  }
};
