module.exports = function () {

    return {
      files: [
        'config/**/*.json',
        'src/**/*.ts',
        {pattern: 'src/**/*.spec.ts', ignore: true},
      ],

      tests: [
        'src/**/**.spec.ts'
      ],

      testFramework: 'jasmine',

      env: {

        type: 'node',
        params: {
          env: 'NODE_ENV=test'
        }
        // More options are described here
        // http://wallabyjs.com/docs/integration/node.html
      }
    };
  };