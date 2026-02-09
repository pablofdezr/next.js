import type { webpack } from 'next-hybrid/dist/compiled/webpack/webpack'

const EmptyLoader: webpack.LoaderDefinitionFunction = () => 'export default {}'
export default EmptyLoader
