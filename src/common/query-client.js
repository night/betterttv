import {QueryClient} from '@tanstack/react-query';

// shared across BetterTTV's React root so query data (e.g. username effect eligibility) is cached and
// deduped across mounts. window-focus refetching is off since we run inside the Twitch tab.
export default new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
