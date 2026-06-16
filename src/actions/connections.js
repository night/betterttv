import api from '@/utils/api';

export function getConnections() {
  return api.get('connections');
}
