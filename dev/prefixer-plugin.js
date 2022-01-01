import webpack from 'webpack';
import {escapeRegExp} from '../src/utils/regex.js';

const {Compilation, sources} = webpack;

export default class PrefixerPlugin {
  constructor(options = {}) {
    if (options.oldClassNamePrefix == null) {
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
            const {oldClassNamePrefix, newClassnamePrefix} = this.options;
            let classnameRegex;

            if (pathname.endsWith('.css')) {
              classnameRegex = new RegExp(`(\\.|--)(${escapeRegExp(oldClassNamePrefix)})(,|-|{|\\s)`, 'gm');
            } else if (pathname.endsWith('.js')) {
              classnameRegex = new RegExp(`(\\.|'|\`|")(${escapeRegExp(oldClassNamePrefix)})(-|'|"|\`|\\s)`, 'gm');
            }

            if (classnameRegex == null) {
              continue;
            }

            const rawSource = source.source();
            const newSource = rawSource.replace(classnameRegex, (match, p1, _p2, p3) => {
              if (["'", '"', '`'].includes(p1) && p1 !== p3 && p3 !== '-' && /\s/.test(p3)) {
                return match;
              }

              return `${p1}${newClassnamePrefix}${p3}`;
            });

            compilation.updateAsset(pathname, new sources.RawSource(newSource));
          }
        }
      );
    });
  }
}
