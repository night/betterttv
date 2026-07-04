import {PlatformTypes} from '@/constants';
import {importAll, loadModuleForPlatforms} from '@/utils/modules';

export default loadModuleForPlatforms([
  PlatformTypes.TWITCH,
  async () => {
    await importAll(import.meta.glob('./commands/*.js'));
  },
]);
