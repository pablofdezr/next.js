const webpack = require('@rspack/core')
const path = require('path')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const DevToolsIgnoreListPlugin = require('./webpack-plugins/devtools-ignore-list-plugin')

function shouldIgnorePath(modulePath) {
  // For consumers, everything will be considered 3rd party dependency if they use
  // the bundles we produce here.
  // In other words, this is all library code and should therefore be ignored.
  return true
}

const pagesExternals = [
  'react',
  'react/package.json',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'react/compiler-runtime',
  'react-dom',
  'react-dom/package.json',
  'react-dom/client',
  'react-dom/server',
  'react-dom/server.browser',
  'react-dom/server.edge',
  'react-server-dom-webpack/client',
  'react-server-dom-webpack/server',
  'react-server-dom-webpack/server.node',
  'react-server-dom-webpack/static',
]

const appExternals = []
const compiledDir = path.join(__dirname, 'dist/compiled')

function makeAppAliases({ experimental, bundler }) {
  const reactChannel = experimental ? '-experimental' : ''

  return {
    react$: path.join(compiledDir, `react${reactChannel}`),
    'react/react.react-server$': path.join(
      compiledDir,
      `react${reactChannel}/react.react-server`
    ),
    'react-dom$': path.join(compiledDir, `react-dom${reactChannel}`),
    'react/jsx-runtime$': path.join(
      compiledDir,
      `react${reactChannel}/jsx-runtime`
    ),
    'react/jsx-dev-runtime$': path.join(
      compiledDir,
      `react${reactChannel}/jsx-dev-runtime`
    ),
    'react/compiler-runtime$': path.join(
      compiledDir,
      `react${reactChannel}/compiler-runtime`
    ),
    'react-dom/client$': path.join(
      compiledDir,
      `react-dom${reactChannel}/client`
    ),
    // optimizations to ignore the legacy APIs in react-dom/server
    'react-dom/server$': path.join(
      __dirname,
      `dist/build/webpack/alias/react-dom-server${reactChannel}.js`
    ),
    'react-dom/static$': path.join(
      compiledDir,
      `react-dom${reactChannel}/static.node`
    ),
    // react-server-dom-webpack alias
    'react-server-dom-turbopack/client$': path.join(
      compiledDir,
      `react-server-dom-turbopack${reactChannel}/client.node`
    ),
    'react-server-dom-turbopack/server$': path.join(
      compiledDir,
      `react-server-dom-turbopack${reactChannel}/server.node`
    ),
    'react-server-dom-turbopack/server.node$': path.join(
      compiledDir,
      `react-server-dom-turbopack${reactChannel}/server.node`
    ),
    'react-server-dom-turbopack/static$': path.join(
      compiledDir,
      `react-server-dom-turbopack${reactChannel}/static.node`
    ),
    'react-server-dom-webpack/client$': path.join(
      compiledDir,
      `react-server-dom-${bundler}${reactChannel}/client.node`
    ),
    'react-server-dom-webpack/server$': path.join(
      compiledDir,
      `react-server-dom-${bundler}${reactChannel}/server.node`
    ),
    'react-server-dom-webpack/server.node$': path.join(
      compiledDir,
      `react-server-dom-${bundler}${reactChannel}/server.node`
    ),
    'react-server-dom-webpack/static$': path.join(
      compiledDir,
      `react-server-dom-${bundler}${reactChannel}/static.node`
    ),
    '@vercel/turbopack-ecmascript-runtime/browser/dev/hmr-client/hmr-client.ts':
      path.join(__dirname, 'dist/client/dev/noop-turbopack-hmr'),
  }
}

const sharedExternals = [
  'styled-jsx',
  'styled-jsx/style',
  '@opentelemetry/api',
  path.join(compiledDir, '@ampproject/toolbox-optimizer'),
  path.join(compiledDir, 'edge-runtime'),
  path.join(compiledDir, '@edge-runtime/ponyfill'),
  path.join(compiledDir, 'undici'),
  path.join(compiledDir, 'raw-body'),
  path.join(__dirname, 'dist/server/capsize-font-metrics.json'),
  'critters',
  path.join(compiledDir, 'node-html-parser'),
  path.join(compiledDir, 'compression'),
  path.join(compiledDir, 'jsonwebtoken'),
  path.join(compiledDir, '@opentelemetry/api'),
  path.join(compiledDir, '@mswjs/interceptors/ClientRequest'),
  path.join(compiledDir, 'ws'),
]

const externalsMap = {
  './web/sandbox': path.join(__dirname, 'dist/server/web/sandbox'),
  'next-hybrid/dist/compiled/next-devtools': `commonjs ${path.join(
    __dirname,
    'dist/next-devtools/dev-overlay.shim.js'
  )}`,
}

const externalsRegexMap = {
  '(.*)trace/tracer$': path.join(__dirname, 'dist/server/lib/trace/tracer'),
}

const bundleTypes = {
  app: {
    'app-page': path.join(
      __dirname,
      'dist/esm/server/route-modules/app-page/module.js'
    ),
    'app-route': path.join(
      __dirname,
      'dist/esm/server/route-modules/app-route/module.js'
    ),
  },
  pages: {
    pages: path.join(
      __dirname,
      'dist/esm/server/route-modules/pages/module.js'
    ),
    'pages-api': path.join(
      __dirname,
      'dist/esm/server/route-modules/pages-api/module.js'
    ),
  },
  server: {
    server: path.join(__dirname, 'dist/esm/server/next-server.js'),
  },
}

/**
 * @param {Object} options
 * @param {boolean} options.dev
 * @param {boolean} options.turbo
 * @param {keyof typeof bundleTypes} options.bundleType
 * @param {boolean} options.experimental
 * @param {Partial<webpack.Configuration>} options.rest
 * @returns {webpack.Configuration}
 */
module.exports = ({ dev, turbo, bundleType, experimental, ...rest }) => {
  const externalHandler = ({ context, request, getResolve }, callback) => {
    ;(async () => {
      if (
        request.match(
          /next[/\\]dist[/\\]compiled[/\\](babel|webpack|source-map|semver|jest-worker|stacktrace-parser|@ampproject\/toolbox-optimizer)/
        )
      ) {
        callback(null, 'commonjs ' + request)
        return
      }

      if (request.match(/(server\/image-optimizer|experimental\/testmode)/)) {
        callback(null, 'commonjs ' + request)
        return
      }

      if (request.match(/\.external(\.js)?$/)) {
        const resolve = getResolve()
        const resolved = await resolve(context, request)
        const relative = path.relative(
          path.join(__dirname, '..'),
          resolved.replace('esm' + path.sep, '')
        )
        callback(null, `commonjs ${relative}`)
      } else {
        const regexMatch = Object.keys(externalsRegexMap).find((regex) =>
          new RegExp(regex).test(request)
        )
        if (regexMatch) {
          return callback(null, 'commonjs ' + externalsRegexMap[regexMatch])
        }
        callback()
      }
    })()
  }

  const bundledReactChannel = experimental ? '-experimental' : ''

  const alias =
    bundleType === 'app'
      ? makeAppAliases({
          experimental,
          bundler: turbo ? 'turbopack' : 'webpack',
        })
      : {}

  return {
    entry: bundleTypes[bundleType],
    target: 'node',
    mode:
      process.env.NEXT_DEBUG_INTERNALS === 'true'
        ? 'development'
        : dev
          ? 'development'
          : 'production',
    output: {
      path: path.join(__dirname, 'dist/compiled/next-server'),
      filename: `[name]${turbo ? '-turbo' : ''}${
        experimental ? '-experimental' : ''
      }.runtime.${dev ? 'dev' : 'prod'}.js`,
      libraryTarget: 'commonjs2',
    },
    devtool: 'source-map',
    optimization:
      process.env.NEXT_DEBUG_INTERNALS === 'true'
        ? undefined
        : {
            moduleIds: 'named',
            minimize: true,
            concatenateModules: true,
            minimizer: [
              new webpack.SwcJsMinimizerRspackPlugin({
                minimizerOptions: {
                  mangle:
                    dev || process.env.NEXT_SERVER_NO_MANGLE ? false : true,
                },
              }),
            ],
          },
    plugins: [
      new DevToolsIgnoreListPlugin({ shouldIgnorePath }),
      new webpack.DefinePlugin({
        'typeof window': JSON.stringify('undefined'),
        'process.env.NEXT_MINIMAL': JSON.stringify('true'),
        'this.serverOptions.experimentalTestProxy': JSON.stringify(false),
        'this.minimalMode': JSON.stringify(true),
        'this.renderOpts.dev': JSON.stringify(dev),
        'renderOpts.dev': JSON.stringify(dev),
        'process.env.NODE_ENV': JSON.stringify(
          dev ? 'development' : 'production'
        ),
        'process.env.__NEXT_EXPERIMENTAL_REACT': JSON.stringify(
          experimental ? true : false
        ),
        'process.env.NEXT_RUNTIME': JSON.stringify('nodejs'),
        'process.turbopack': JSON.stringify(turbo),
        'process.env.TURBOPACK': JSON.stringify(turbo),
      }),
      !!process.env.ANALYZE &&
        new BundleAnalyzerPlugin({
          analyzerPort: calculateUniquePort(
            dev,
            turbo,
            experimental,
            bundleType
          ),
          openAnalyzer: false,
          ...(process.env.CI
            ? {
                analyzerMode: 'static',
                reportFilename: path.join(
                  __dirname,
                  `dist/compiled/next-server/report.${dev ? 'dev' : 'prod'}-${
                    turbo ? 'turbo' : 'webpack'
                  }-${
                    experimental ? 'experimental' : 'stable'
                  }-${bundleType}.html`
                ),
              }
            : {}),
        }),
    ].filter(Boolean),
    stats: {
      optimizationBailout: true,
    },
    resolve: {
      alias,
    },
    module: {
      rules: [
        { test: /\.m?js$/, loader: `source-map-loader`, enforce: `pre` },
        {
          include: /[\\/]react-server\.node/,
          layer: 'react-server',
        },
        {
          include: /vendored[\\/]rsc[\\/]entrypoints/,
          resolve: {
            conditionNames: ['react-server', '...'],
            alias: {
              react$: path.join(
                __dirname,
                `dist/compiled/react${bundledReactChannel}/react.react-server`
              ),
              [`${path.join(
                __dirname,
                'dist/compiled'
              )}/react${bundledReactChannel}$`]: path.join(
                __dirname,
                `dist/compiled/react${bundledReactChannel}/react.react-server`
              ),
              'react/jsx-runtime$': path.join(
                __dirname,
                `dist/compiled/react${bundledReactChannel}/jsx-runtime.react-server`
              ),
              [`${path.join(
                __dirname,
                'dist/compiled'
              )}/react${bundledReactChannel}/jsx-runtime$`]: path.join(
                __dirname,
                `dist/compiled/react${bundledReactChannel}/jsx-runtime.react-server`
              ),
              'react/jsx-dev-runtime$': path.join(
                __dirname,
                `dist/compiled/react${bundledReactChannel}/jsx-dev-runtime.react-server`
              ),
              [`${path.join(
                __dirname,
                'dist/compiled'
              )}/react${bundledReactChannel}/jsx-dev-runtime$`]: path.join(
                __dirname,
                `dist/compiled/react${bundledReactChannel}/jsx-dev-runtime.react-server`
              ),
              'react/compiler-runtime$': path.join(
                __dirname,
                `dist/compiled/react${bundledReactChannel}/compiler-runtime`
              ),
              [`${path.join(
                __dirname,
                'dist/compiled'
              )}/react${bundledReactChannel}/compiler-runtime$`]: path.join(
                __dirname,
                `dist/compiled/react${bundledReactChannel}/compiler-runtime`
              ),
              'react-dom$': path.join(
                __dirname,
                `dist/compiled/react-dom${bundledReactChannel}/react-dom.react-server`
              ),
              [`${path.join(
                __dirname,
                'dist/compiled'
              )}/react-dom${bundledReactChannel}$`]: path.join(
                __dirname,
                `dist/compiled/react-dom${bundledReactChannel}/react-dom.react-server`
              ),
            },
          },
          layer: 'react-server',
        },
        {
          issuerLayer: 'react-server',
          resolve: {
            conditionNames: ['react-server', '...'],
            alias: {
              react$: path.join(
                __dirname,
                `dist/compiled/react${bundledReactChannel}/react.react-server`
              ),
              [`${path.join(
                __dirname,
                'dist/compiled'
              )}/react${bundledReactChannel}$`]: path.join(
                __dirname,
                `dist/compiled/react${bundledReactChannel}/react.react-server`
              ),
              'react-dom$': path.join(
                __dirname,
                `dist/compiled/react-dom${bundledReactChannel}/react-dom.react-server`
              ),
              [`${path.join(
                __dirname,
                'dist/compiled'
              )}/react-dom${bundledReactChannel}$`]: path.join(
                __dirname,
                `dist/compiled/react-dom${bundledReactChannel}/react-dom.react-server`
              ),
            },
          },
        },
      ],
    },
    externals: [
      ...sharedExternals,
      ...(bundleType === 'pages' ? pagesExternals : appExternals),
      externalsMap,
      externalHandler,
    ],
    ...rest,
  }
}

function calculateUniquePort(dev, turbo, experimental, bundleType) {
  const devOffset = dev ? 1000 : 0
  const turboOffset = turbo ? 200 : 0
  const experimentalOffset = experimental ? 40 : 0
  let bundleTypeOffset

  switch (bundleType) {
    case 'app':
      bundleTypeOffset = 1
      break
    case 'pages':
      bundleTypeOffset = 2
      break
    default:
      bundleTypeOffset = 3
  }

  return 8888 + devOffset + turboOffset + experimentalOffset + bundleTypeOffset
}
