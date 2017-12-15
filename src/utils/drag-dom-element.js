function dragDomElement(el, selector) {
    if (!el) return;
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();

        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        el.style.top = (el.offsetTop - pos2) + 'px';
        el.style.left = (el.offsetLeft - pos1) + 'px';
    }

    function dragMouseDown(e) {
        e = e || window.event;
        if (e.button !== 0) return;

        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    let dragEl = el;
    if (selector && document.querySelector(selector)) {
        dragEl = document.querySelector(selector);
    }

    dragEl.onmousedown = dragMouseDown;
    dragEl.style.userSelect = 'none';
    dragEl.style.cursor = 'move';
    el.style.zIndex = '9999';
    el.style.position = 'absolute';
}

module.exports = dragDomElement;
