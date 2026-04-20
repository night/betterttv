import api from '../utils/api.js';

export function getConnections() {
  return api.get('connections', {withAuth: true});
}
