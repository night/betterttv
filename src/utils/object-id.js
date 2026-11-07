import {DateTime} from 'luxon';

const OBJECT_ID_REGEX = /^[0-9a-f]{24}$/;

// an object id's leading four bytes are its creation time
export function getObjectIdTimestamp(objectId) {
  if (!OBJECT_ID_REGEX.test(objectId)) {
    return null;
  }

  return DateTime.fromSeconds(parseInt(objectId.slice(0, 8), 16));
}
