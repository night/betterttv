import gql from 'graphql-tag';
import dom from '../../observers/dom.js';
import twitch from '../../utils/twitch.js';
import style from './style.module.css';
import formatMessage from '../../i18n/index.js';
import {loadModuleForPlatforms} from '../../utils/modules.js';
import {PlatformTypes} from '../../constants.js';

const STREAM_PREVIEW_IMAGE_LINK_SELECTOR = '.preview-card-image-link';

const GET_CREATED_AT_GQL_QUERY = gql`
  query BTTVGetChannelStreamCreatedAt($name: String!) {
    channel(name: $name) {
      id
      stream {
        id
        createdAt
      }
    }
  }
`;

export function secondsToLength(s) {
  const days = Math.floor(s / 86400);
  const hours = Math.floor(s / 3600);
  let minutes = Math.floor(s / 60) - days * 1440 - hours * 60;
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  let seconds = s - days * 86400 - hours * 3600 - minutes * 60;
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return formatMessage({defaultMessage: '{hours}:{minutes}:{seconds}'}, {days, hours, minutes, seconds});
}

function handleTimestampPreview(node, createdAt) {
  const startedTime = new Date(createdAt);
  const secondsSince = Math.round((Date.now() - startedTime.getTime()) / 1000);
  const imageContainer = node.children[0];
  const div = document.createElement('div');
  div.textContent = secondsToLength(secondsSince);
  div.classList.add(style.streamUptimePreview);
  imageContainer.appendChild(div);
}

class UptimePreview {
  constructor() {
    dom.on(STREAM_PREVIEW_IMAGE_LINK_SELECTOR, (node, isConnected) => {
      if (!isConnected) {
        return;
      }

      const channelName = node.getAttribute('href').split('/')[1];
      twitch.graphqlQuery(GET_CREATED_AT_GQL_QUERY, {name: channelName}).then(
        ({
          data: {
            channel: {stream},
          },
        }) => handleTimestampPreview(node, stream.createdAt)
      );
    });
  }
}

export default loadModuleForPlatforms([PlatformTypes.TWITCH, () => new UptimePreview()]);
