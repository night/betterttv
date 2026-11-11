import {create} from 'zustand';
import {fetchLegendaryEmoteSeason} from '@/modules/emote_menu/utils/twitch-legendary-emotes';
import {getCurrentChannel} from '@/utils/channel';

const useLegendaryEmotesStore = create(() => ({
  season: null,
}));

let lastSeasonFetch = null;

// refreshed whenever the emote menu opens so owned counts and unopened chests stay current
export async function updateLegendaryEmoteSeason() {
  const currentFetch = {};
  lastSeasonFetch = currentFetch;

  // drop a season left over from another channel right away instead of showing it until the
  // fetch resolves
  const {season} = useLegendaryEmotesStore.getState();
  if (season != null && season.channelId !== getCurrentChannel()?.id) {
    useLegendaryEmotesStore.setState({season: null});
  }

  const newSeason = await fetchLegendaryEmoteSeason();
  if (lastSeasonFetch !== currentFetch) {
    return;
  }

  useLegendaryEmotesStore.setState({season: newSeason});
}

export default useLegendaryEmotesStore;
