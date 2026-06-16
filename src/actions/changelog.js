import api from '@/utils/api';

export async function getChangelog() {
  return api.get('cached/changelog');
}
