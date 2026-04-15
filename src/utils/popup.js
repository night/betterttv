import SafeEventEmitter from './safe-event-emitter.js';

const CLOSE_INTERVAL = 1000;

class Popup extends SafeEventEmitter {
  constructor({windowName, expectedOrigin = window.location.origin}) {
    super();
    this.windowName = windowName;
    this.expectedOrigin = expectedOrigin;
  }

  open({url, width = 480, height = 600}) {
    const top = window.screenY + (window.outerHeight - height) / 2;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const windowOptions = `width=${width},height=${height},top=${top},left=${left},location=0,menubar=0,scrollbars=1,status=0,toolbar=0,resizable=1`;

    this.popup = window.open(url, this.windowName, windowOptions);

    if (this.popup == null) {
      return;
    }

    const interval = setInterval(() => {
      if (this.popup == null || this.popup.closed) {
        this.close();
        clearInterval(interval);
      }
    }, CLOSE_INTERVAL);

    window.addEventListener('message', this.handlePopupMessage);
  }

  handlePopupMessage = (event) => {
    if (event.origin !== this.expectedOrigin) {
      return;
    }

    let payload = null;

    try {
      payload = JSON.parse(event.data);
    } catch (_) {
      return;
    }

    if (payload == null) {
      return;
    }

    this.emit(payload.event, payload.data);
  };

  setLocation(url) {
    if (this.popup == null) {
      return;
    }

    this.popup.location.href = url;
  }

  close() {
    if (this.popup == null) {
      return;
    }

    try {
      this.popup.close();
    } catch (_) {}

    this.popup = null;
    window.removeEventListener('message', this.handlePopupMessage);
    this.emit('close');
  }
}

export default Popup;
