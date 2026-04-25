export function getEmoteKey(emote) {
  return `${emote.category.id}-${emote.id}`;
}

export function getRowColumnCounts(emoteListRows) {
  return emoteListRows.map((row) => (!Array.isArray(row) ? 0 : row.length));
}

export function getSelectedAtCoords(emoteListRows, coords) {
  const row = emoteListRows[coords.y];
  const cell = row?.[coords.x];
  return cell != null ? cell : null;
}

export function getCoordsOfSelected(emoteListRows, selected) {
  if (selected == null) {
    return null;
  }

  for (let y = 0; y < emoteListRows.length; y++) {
    if (!Array.isArray(emoteListRows[y])) {
      continue;
    }

    for (let x = 0; x < emoteListRows[y].length; x++) {
      if (getEmoteKey(emoteListRows[y][x]) === getEmoteKey(selected)) {
        return {y, x};
      }
    }
  }

  return null;
}

export function getFirstCoords(emoteListRows) {
  if (!Array.isArray(emoteListRows)) {
    return null;
  }

  for (let y = 0; y < emoteListRows.length; y++) {
    if (!Array.isArray(emoteListRows[y])) {
      continue;
    }

    for (let x = 0; x < emoteListRows[y].length; x++) {
      if (emoteListRows[y][x] != null) {
        return {y, x};
      }
    }
  }

  return null;
}

/** First grid cell for an emote whose `category.id` matches `categoryId`, or null. */
export function getFirstCoordsInCategory(emoteListRows, categoryId) {
  if (categoryId == null) {
    return null;
  }

  for (let y = 0; y < emoteListRows.length; y++) {
    if (!Array.isArray(emoteListRows[y])) {
      continue;
    }

    for (let x = 0; x < emoteListRows[y].length; x++) {
      const emote = emoteListRows[y][x];
      if (emote != null && emote.category?.id === categoryId) {
        return {y, x};
      }
    }
  }

  return null;
}
