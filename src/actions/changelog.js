import api from '../utils/api.js';

export async function getChangelog() {
  return api.get('cached/changelog');
}
