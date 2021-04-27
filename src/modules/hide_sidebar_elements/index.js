import $ from 'jquery';
import watcher from '../../watcher.js';
import settings from '../../settings.js';
import domObserver from '../../observers/dom.js';

let removeFeaturedChannelsListener;
let removeOfflineFollowedChannelsListener;
class HideSidebarElementsModule {
  constructor() {
    settings.add({
      id: 'hideSidebarElements',
      type: 2,
      options: {
        choices: [
          'Recommended Channels',
          'Auto-expand Featured Channels',
          'Friend Recommendations',
          'Offline Followed Channels',
          'Friends List',
        ],
      },
      category: 'ui',
      name: 'Sidebar',
      defaultValue: [0, 2, 3, 4],
      description: 'Edit/remove elements of the left sidebar',
    });

    settings.on('changed.hideSidebarElements', (newValues, prevValues) => {
      this.toggleElements(newValues);
    });

    watcher.on('load', () => {
      this.toggleElements(settings.get('hideSidebarElements'));
    });
  }

  toggleElements(values) {
    this.showFeaturedChannels(values.includes(0));
    this.autoExpandChannels(values.includes(1));
    this.showRecommendedFriends(values.includes(2));
    this.showOfflineFollowedChannels(values.includes(3));
    this.showFriendsList(values.includes(4));
  }

  showFeaturedChannels(show) {
    if (!show) {
      if (removeFeaturedChannelsListener) return;

      removeFeaturedChannelsListener = domObserver.on(
        '.side-nav-section a[data-test-selector="recommended-channel"], .side-nav-section a[data-test-selector="similarity-channel"], .side-nav-section .tw-svg__asset--navchannels, .side-nav-section a[data-test-selector="popular-channel"]',
        (node, isConnected) => {
          if (!isConnected) return;
          $(node).addClass('bttv-hide-featured-channels');
        },
        {useParentNode: true}
      );
      return;
    }

    if (!removeFeaturedChannelsListener) return;

    removeFeaturedChannelsListener();
    removeFeaturedChannelsListener = undefined;
    $('.side-nav-section').removeClass('bttv-hide-featured-channels');
  }

  autoExpandChannels(auto) {
    console.log(auto);
    if (!auto) return;
    setTimeout(() => {
      const $firstChannelLink = $('a.side-nav-card__link[data-a-id="followed-channel-0"]');
      if ($firstChannelLink.length === 0) return;
      $('.side-nav button[data-a-target="side-nav-show-more-button"]').first().trigger('click');
    }, 1000);
  }

  showRecommendedFriends(show) {
    $('body').toggleClass('bttv-hide-recommended-friends', !show);
  }

  showOfflineFollowedChannels(show) {
    if (!show) {
      if (removeOfflineFollowedChannelsListener) return;

      removeOfflineFollowedChannelsListener = domObserver.on(
        '.side-nav-card .side-nav-card__avatar--offline',
        (node, isConnected) => {
          if (!isConnected) return;
          $(node).addClass('bttv-hide-followed-offline');
        },
        {useParentNode: true}
      );
      return;
    }

    if (!removeOfflineFollowedChannelsListener) return;

    removeOfflineFollowedChannelsListener();
    removeOfflineFollowedChannelsListener = undefined;
    $('.side-nav-card').removeClass('bttv-hide-followed-offline');
  }

  showFriendsList(show) {
    $('body').toggleClass('bttv-hide-friends', !show);
  }
}

export default new HideSidebarElementsModule();
