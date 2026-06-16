import api from '@/utils/api';

export async function getExtensionSettings() {
  return api.get('extension/settings');
}

export async function updateExtensionSettings({settings, version}) {
  return api.put('extension/settings', {body: {settings, version}});
}
