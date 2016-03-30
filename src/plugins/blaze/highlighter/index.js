var Overlay = require('./overlay');
var MultiOverlay = require('./multi-overlay');

/**
 * Manages the highlighting of items on an html page, as well as
 * hover-to-inspect.
 */
class Highlighter {
  // _overlay: ?Overlay;
  // _multiOverlay: ?MultiOverlay;
  // _win: Object;
  // _onSelect: (node: DOMNode) => void;
  // _inspecting: boolean;
  // _subs: Array<() => void>;
  // _button: DOMNode;

  constructor(win, onSelect) {
    this._win = win;
    this._onSelect = onSelect;
    this._overlay = null;
    this._multiOverlay = null;
    this._subs = [];
  }

  startInspecting() {
    this._inspecting = true;
    this._subs = [
      //captureSubscription(this._win, 'mouseover', this.onHover.bind(this)),
      captureSubscription(this._win, 'mousedown', this.onMouseDown.bind(this)),
      captureSubscription(this._win, 'click', this.onClick.bind(this)),
    ];
  }

  stopInspecting() {
    this._subs.forEach(unsub => unsub());
    this.hideHighlight();
  }

  remove() {
    this.stopInspecting();
    if (this._button && this._button.parentNode) {
      this._button.parentNode.removeChild(this._button);
    }
  }

  highlight(node, name) {
    this.removeMultiOverlay();
    if (!this._overlay) {
      this._overlay = new Overlay(this._win);
    }
    this._overlay.inspect(node, name);
  }

  highlightMany(nodes) {
    this.removeOverlay();
    if (!this._multiOverlay) {
      this._multiOverlay = new MultiOverlay(this._win);
    }
    this._multiOverlay.highlightMany(nodes);
  }

  hideHighlight() {
    this._inspecting = false;
    this.removeOverlay();
    this.removeMultiOverlay();
  }

  removeOverlay() {
    if (!this._overlay) {
      return;
    }
    this._overlay.remove();
    this._overlay = null;
  }

  removeMultiOverlay() {
    if (!this._multiOverlay) {
      return;
    }
    this._multiOverlay.remove();
    this._multiOverlay = null;
  }

  onMouseDown(evt) {
    if (!this._inspecting) {
      return;
    }
    evt.preventDefault();
    evt.stopPropagation();
    evt.cancelBubble = true;
    this._onSelect(evt.target);
    return;
  }

  onClick(evt) {
    if (!this._inspecting) {
      return;
    }
    this._subs.forEach(unsub => unsub());
    evt.preventDefault();
    evt.stopPropagation();
    evt.cancelBubble = true;
    this.hideHighlight();
  }

  onHover(evt) {
    if (!this._inspecting) {
      return;
    }
    evt.preventDefault();
    evt.stopPropagation();
    evt.cancelBubble = true;
    this.highlight(evt.target);
  }

  injectButton() {
    this._button = makeMagnifier();
    this._button.onclick = this.startInspecting.bind(this);
    this._win.document.body.appendChild(this._button);
  }
}

function captureSubscription(obj, evt, cb) {
  obj.addEventListener(evt, cb, true);
  return () => obj.removeEventListener(evt, cb, true);
}

function makeMagnifier() {
  var button = window.document.createElement('button');
  button.innerHTML = '&#128269;';
  button.style.backgroundColor = 'transparent';
  button.style.border = 'none';
  button.style.outline = 'none';
  button.style.cursor = 'pointer';
  button.style.position = 'fixed';
  button.style.bottom = '10px';
  button.style.right = '10px';
  button.style.fontSize = '30px';
  button.style.zIndex = 10000000;
  return button;
}

module.exports = Highlighter;