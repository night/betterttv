import webpack from 'webpack';

const {Compilation, sources} = webpack;

export default class PrefixerPlugin {
  constructor(options = {}) {
    if (options.replaceClassnamePrefixRegex == null) {
      throw new Error('PrefixerPlugin: replaceClassnamePrefixRegex option is required');
    }

    if (options.newClassnamePrefix == null) {
      throw new Error('PrefixerPlugin: newClassnamePrefix option is required');
    }

    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('PrefixerPluginHooks', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'PrefixerPlugin',
          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
        },
        (assets) => {
          for (const [pathname, source] of Object.entries(assets)) {
            const {replaceClassnamePrefixRegex, newClassnamePrefix} = this.options;
            let classnameRegex;

            switch (true) {
              case /.+\.css.*$/.test(pathname):
                classnameRegex = new RegExp(`(?<=(--)|[.])${replaceClassnamePrefixRegex}`, 'g');
                break;
              case /.+\.js.*$/.test(pathname):
                classnameRegex = new RegExp(`(?<=^|[']|[ ])${replaceClassnamePrefixRegex}`, 'gm');
                break;
              default:
                continue;
            }

            const rawSource = source.source();
            const newSource = rawSource.replace(classnameRegex, newClassnamePrefix);

            compilation.updateAsset(pathname, new sources.RawSource(newSource));
          }
        }
      );
    });
  }
}
