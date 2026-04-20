import api from '../utils/api.js';

export async function getExtensionSettings() {
  return api.get('extension/settings', {withAuth: true});
}

export async function updateExtensionSettings({settings, version}) {
  return api.put('extension/settings', {withAuth: true, body: {settings, version}});
}
