import debounce from 'lodash.debounce';
import isEqual from 'lodash.isequal';
import {getExtensionSettings, updateExtensionSettings} from '../../actions/extension.js';
import {openConfirmModal} from '../../common/utils/modal.js';
import {FlagSettings} from '../../constants.js';
import formatMessage from '../../i18n/index.js';
import settings from '../../settings.js';
import socketClient, {EventNames} from '../../socket-client.js';
import storage from '../../storage.js';
import useAuthStore from '../../stores/auth.js';
import HTTPError from '../../utils/http-error.js';
import {isUserPro} from '../../utils/pro.js';
import SafeEventEmitter from '../../utils/safe-event-emitter.js';

const CLOUD_BACKUP_SETTINGS_STORAGE_KEY = 'cloudBackupSettings';

let unlistenSettingsChange = null;
let unlistenSocketChange = null;
let pendingVersion = null;
let ignoringInternalSettingChanges = false;

class CloudBackup extends SafeEventEmitter {
  constructor() {
    super();

    this.settings = storage.get(CLOUD_BACKUP_SETTINGS_STORAGE_KEY);

    if (this.settings == null) {
      this.settings = {enabled: false, version: 0};
    }

    this.versionMismatch = false;
    this._handleInternalSettingsChangeDebounced = debounce(this._handleInternalSettingsChange.bind(this), 1000);

    this.load();

    useAuthStore.subscribe(
      (state) => state.user?.pro ?? false,
      () => this.load()
    );
  }

  updateBackupSettings(newSettings) {
    newSettings = {...this.settings, ...newSettings};

    if (newSettings.enabled != null && newSettings.enabled !== this.settings.enabled) {
      this.load(newSettings);
    }

    this.settings = newSettings;
    this.emit('changed', this.settings);
    storage.set(CLOUD_BACKUP_SETTINGS_STORAGE_KEY, this.settings);
  }

  async load(newSettings) {
    let {enabled} = newSettings ?? this.settings;

    const {user: currentUser} = useAuthStore.getState();
    if (!isUserPro(currentUser)) {
      enabled = false;
    }

    if (!enabled && unlistenSettingsChange != null) {
      unlistenSettingsChange?.();
      unlistenSettingsChange = null;
    }

    if (!enabled && unlistenSocketChange != null) {
      unlistenSocketChange?.();
      unlistenSocketChange = null;
    }

    if (!enabled) {
      return;
    }

    if (unlistenSettingsChange == null) {
      unlistenSettingsChange = settings.on('changed', this.handleInternalSettingsChange.bind(this));
    }

    if (unlistenSocketChange == null) {
      unlistenSocketChange = socketClient.on(EventNames.SETTINGS_UPDATE, ({version, settings: newSettings}) => {
        this._replaceLocalWithServer(newSettings, version);
      });
    }

    try {
      const {settings: currentSettings, version: currentVersion} = await getExtensionSettings();
      this._replaceLocalWithServer(currentSettings, currentVersion);
    } catch (error) {
      if (error instanceof HTTPError && error.status === 403) {
        this.updateBackupSettings({enabled: false});
      }

      if (error instanceof HTTPError && error.status === 404) {
        await this._handleInternalSettingsChange();
      }

      throw error;
    }
  }

  handleVersionMismatch(expectedVersion) {
    openConfirmModal({
      title: formatMessage({defaultMessage: 'Settings Update Error'}),
      description: formatMessage({
        defaultMessage: 'Your settings have diverged from the cloud. Would you like to overwrite the server?',
      }),
      onConfirm: async () => {
        this.updateBackupSettings({version: expectedVersion});
        await this._handleInternalSettingsChange();
      },
      onCancel: () => this.updateBackupSettings({enabled: false}),
      labels: {
        confirm: formatMessage({defaultMessage: 'Overwrite'}),
        cancel: formatMessage({defaultMessage: 'Cancel'}),
      },
    });
  }

  _replaceLocalWithServer(serverSettings, newVersion) {
    if (newVersion === pendingVersion) {
      return;
    }

    try {
      const currentSettings = settings.getSettings();

      if (currentSettings.version !== serverSettings.version) {
        return;
      }

      ignoringInternalSettingChanges = true;

      for (let [key, value] of Object.entries(serverSettings)) {
        if (key === 'version') {
          continue;
        }

        if (FlagSettings.includes(key)) {
          [value] = value;
        }

        let currentValue = currentSettings[key];
        if (FlagSettings.includes(key)) {
          [currentValue] = currentValue;
        }

        if (isEqual(currentValue, value)) {
          continue;
        }

        settings.set(key, value);
      }

      this.updateBackupSettings({version: newVersion});
    } finally {
      ignoringInternalSettingChanges = false;
    }
  }

  handleInternalSettingsChange() {
    if (!ignoringInternalSettingChanges) {
      this._handleInternalSettingsChangeDebounced();
    }
  }

  async _handleInternalSettingsChange(newSettings) {
    if (ignoringInternalSettingChanges) {
      return;
    }

    if (newSettings == null) {
      newSettings = settings.getSettings();
    }

    pendingVersion = this.settings.version + 1;

    try {
      const {version} = await updateExtensionSettings({
        settings: newSettings,
        version: pendingVersion,
      });

      this.updateBackupSettings({version});
    } catch (error) {
      pendingVersion = null;

      if (error instanceof HTTPError && error.status === 403) {
        this.updateBackupSettings({enabled: false});
      }

      if (error instanceof HTTPError && error.data?.message === 'Version mismatch') {
        const {expected: expectedVersion} = error.data;
        this.handleVersionMismatch(expectedVersion);
      }

      throw error;
    }
  }
}

export default new CloudBackup();
