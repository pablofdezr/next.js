let installed: boolean = false

export function loadWebpackHook() {
  if (installed) {
    return
  }
  installed = true

  // hook the Node.js require so that webpack requires are
  // routed to the bundled and now initialized webpack version
  ;(
    require('../server/require-hook') as typeof import('../server/require-hook')
  ).addHookAliases(
    [
      ['webpack', 'next-hybrid/dist/compiled/webpack/webpack-lib'],
      ['webpack/package', 'next-hybrid/dist/compiled/webpack/package'],
      ['webpack/package.json', 'next-hybrid/dist/compiled/webpack/package'],
      ['webpack/lib/webpack', 'next-hybrid/dist/compiled/webpack/webpack-lib'],
      ['webpack/lib/webpack.js', 'next-hybrid/dist/compiled/webpack/webpack-lib'],
      [
        'webpack/lib/node/NodeEnvironmentPlugin',
        'next-hybrid/dist/compiled/webpack/NodeEnvironmentPlugin',
      ],
      [
        'webpack/lib/node/NodeEnvironmentPlugin.js',
        'next-hybrid/dist/compiled/webpack/NodeEnvironmentPlugin',
      ],
      [
        'webpack/lib/BasicEvaluatedExpression',
        'next-hybrid/dist/compiled/webpack/BasicEvaluatedExpression',
      ],
      [
        'webpack/lib/BasicEvaluatedExpression.js',
        'next-hybrid/dist/compiled/webpack/BasicEvaluatedExpression',
      ],
      [
        'webpack/lib/node/NodeTargetPlugin',
        'next-hybrid/dist/compiled/webpack/NodeTargetPlugin',
      ],
      [
        'webpack/lib/node/NodeTargetPlugin.js',
        'next-hybrid/dist/compiled/webpack/NodeTargetPlugin',
      ],
      [
        'webpack/lib/node/NodeTemplatePlugin',
        'next-hybrid/dist/compiled/webpack/NodeTemplatePlugin',
      ],
      [
        'webpack/lib/node/NodeTemplatePlugin.js',
        'next-hybrid/dist/compiled/webpack/NodeTemplatePlugin',
      ],
      [
        'webpack/lib/LibraryTemplatePlugin',
        'next-hybrid/dist/compiled/webpack/LibraryTemplatePlugin',
      ],
      [
        'webpack/lib/LibraryTemplatePlugin.js',
        'next-hybrid/dist/compiled/webpack/LibraryTemplatePlugin',
      ],
      [
        'webpack/lib/SingleEntryPlugin',
        'next-hybrid/dist/compiled/webpack/SingleEntryPlugin',
      ],
      [
        'webpack/lib/SingleEntryPlugin.js',
        'next-hybrid/dist/compiled/webpack/SingleEntryPlugin',
      ],
      [
        'webpack/lib/optimize/LimitChunkCountPlugin',
        'next-hybrid/dist/compiled/webpack/LimitChunkCountPlugin',
      ],
      [
        'webpack/lib/optimize/LimitChunkCountPlugin.js',
        'next-hybrid/dist/compiled/webpack/LimitChunkCountPlugin',
      ],
      [
        'webpack/lib/webworker/WebWorkerTemplatePlugin',
        'next-hybrid/dist/compiled/webpack/WebWorkerTemplatePlugin',
      ],
      [
        'webpack/lib/webworker/WebWorkerTemplatePlugin.js',
        'next-hybrid/dist/compiled/webpack/WebWorkerTemplatePlugin',
      ],
      [
        'webpack/lib/ExternalsPlugin',
        'next-hybrid/dist/compiled/webpack/ExternalsPlugin',
      ],
      [
        'webpack/lib/ExternalsPlugin.js',
        'next-hybrid/dist/compiled/webpack/ExternalsPlugin',
      ],
      [
        'webpack/lib/web/FetchCompileWasmTemplatePlugin',
        'next-hybrid/dist/compiled/webpack/FetchCompileWasmTemplatePlugin',
      ],
      [
        'webpack/lib/web/FetchCompileWasmTemplatePlugin.js',
        'next-hybrid/dist/compiled/webpack/FetchCompileWasmTemplatePlugin',
      ],
      [
        'webpack/lib/web/FetchCompileWasmPlugin',
        'next-hybrid/dist/compiled/webpack/FetchCompileWasmPlugin',
      ],
      [
        'webpack/lib/web/FetchCompileWasmPlugin.js',
        'next-hybrid/dist/compiled/webpack/FetchCompileWasmPlugin',
      ],
      [
        'webpack/lib/web/FetchCompileAsyncWasmPlugin',
        'next-hybrid/dist/compiled/webpack/FetchCompileAsyncWasmPlugin',
      ],
      [
        'webpack/lib/web/FetchCompileAsyncWasmPlugin.js',
        'next-hybrid/dist/compiled/webpack/FetchCompileAsyncWasmPlugin',
      ],
      [
        'webpack/lib/ModuleFilenameHelpers',
        'next-hybrid/dist/compiled/webpack/ModuleFilenameHelpers',
      ],
      [
        'webpack/lib/ModuleFilenameHelpers.js',
        'next-hybrid/dist/compiled/webpack/ModuleFilenameHelpers',
      ],
      ['webpack/lib/GraphHelpers', 'next-hybrid/dist/compiled/webpack/GraphHelpers'],
      [
        'webpack/lib/GraphHelpers.js',
        'next-hybrid/dist/compiled/webpack/GraphHelpers',
      ],
      ['webpack/lib/NormalModule', 'next-hybrid/dist/compiled/webpack/NormalModule'],
      ['webpack-sources', 'next-hybrid/dist/compiled/webpack/sources'],
      ['webpack-sources/lib', 'next-hybrid/dist/compiled/webpack/sources'],
      ['webpack-sources/lib/index', 'next-hybrid/dist/compiled/webpack/sources'],
      ['webpack-sources/lib/index.js', 'next-hybrid/dist/compiled/webpack/sources'],
      ['@babel/runtime', 'next-hybrid/dist/compiled/@babel/runtime/package.json'],
      [
        '@babel/runtime/package.json',
        'next-hybrid/dist/compiled/@babel/runtime/package.json',
      ],
    ].map(
      // Use dynamic require.resolve to avoid statically analyzable since they're only for build time
      ([request, replacement]) => [request, require.resolve(replacement)]
    )
  )
}
