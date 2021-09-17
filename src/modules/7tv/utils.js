import $ from 'jquery';
import querystring from 'querystring';
import HTTPError from '../../utils/http-error.js';
import Emote from '../emotes/emote.js';

const API_ENDPOINT = 'https://api.7tv.app/v2/';

export function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: `${API_ENDPOINT}${path}${options.qs ? `?${querystring.stringify(options.qs)}` : ''}`,
      method: 'GET',
      dataType: options.dataType || 'json',
      data: options.body ? JSON.stringify(options.body) : undefined,
      timeout: 30000,
      success: (data) => resolve(data),
      error: ({status, responseJSON}) => reject(new HTTPError(status, responseJSON)),
    });
  });
}

export function create7tvEmote({id, owner, name, urls, mime}, provider) {
  const channel = owner ? {id: owner.id, displayName: owner.display_name, name: owner.login} : null;
  const images = urls.reduce((acc, [scale, url]) => ({...acc, [`${scale}x`]: url}), {});

  return new Emote({
    id,
    provider,
    channel,
    code: name,
    images,
    // imageType: 'png' | 'gif' | 'wepb'
    imageType: mime.slice(6),
  });
}
