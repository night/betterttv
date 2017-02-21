const button = `
<a id="bvl-button" title="Better Viewer List" class="button button--icon-only float-left">
  <figure>
    <svg version="1.1" viewbox="0 0 16 16" width="16px" height="16px" class="svg-betterviewerlist">
      <path clip-rule="evenodd" d="M6,15v-2h8v2H6z M6,9h8v2H6V7z M6,5h8v2H6V3z M6,1h8v2H6V3z M2,13h2v2H2V11z M2,9h2v2H2V7z M2,5h2v2H2V3z M2,1h2v2H2V11z"></path>
    </svg>
  </figure>
</a>`;

const panel = `
<div id="bvl-panel" class="chatters-view">
  <div class="drag_handle chat-header"><a class="button button--icon-only close-button chat-header__button chat-header__button--left">
      <svg viewbox="0 0 16 16" width="16px" height="16px" class="svg-close">
        <path clip-rule="evenodd" d="M6.4,8 L1.8,3.3 L1,2.5 L2.5,1 L3.3,1.8 L8,6.4 L12.67,1.8 L13.4,1 L15,2.5 L14.2,3.3 L9.5,8 L14.2,12.67 L15,13.4 L13.4,15 L12.67,14.2 L8,9.5 L3.3,14.2 L2.5,15 L1,13.4 L1.8,12.67 L6.4,8 Z" fill-rule="evenodd"></path>
      </svg></a><a class="button button--icon-only refresh-button chat-header__button chat-header__button--right">
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewbox="0 0 16 16" width="16" height="16">
        <path id="spin" d="M2.083,9H0.062H0v5l1.481-1.361C2.932,14.673,5.311,16,8,16c4.08,0,7.446-3.054,7.938-7h-2.021 c-0.476,2.838-2.944,5-5.917,5c-2.106,0-3.96-1.086-5.03-2.729L5.441,9H2.083z"></path>
        <g transform="translate(16, 16) rotate(180)">
          <use xlink:href="#spin"></use>
        </g>
      </svg></a>
    <p class="room-title">Viewer List</p>
  </div>
  <div class="status"></div>
  <input type="text" autocomplete="off" placeholder="Filter Viewers" class="filter text"/>
  <div class="viewer-count"></div>
  <svg viewbox="0 0 16 16" width="16" height="16" class="bvl-resizer">
    <path clip-rule="evenodd" d="M12,12h2v2H12V11z M12,8h2v2H12V11z M12,4h2v2H12V11z M8,8h2v2H8V11z M8,12h2v2H8V11z M4,12h2v2H4V11z"></path>
  </svg>
</div>`;

module.exports = {
    button,
    panel
};
