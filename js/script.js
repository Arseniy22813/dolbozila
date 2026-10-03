const TOTAL = 11;

const track    = document.getElementById('carousel-track');
const tvScreen = document.querySelector('.tv-oval');
const carousel = document.querySelector('.carousel');

const IMG_PATH = './video/';

/* ===== 1. Строим обложки с картинками ===== */

for (let i = 0; i < TOTAL; i++) {
    const el = document.createElement('div');
    el.className = 'thumb';
    el.dataset.index = i;

    const img = document.createElement('img');
    img.src = `${IMG_PATH}${i + 1}.jpg`;
    img.alt = `Эпизод ${i + 1}`;
    img.loading = 'lazy';

    el.appendChild(img);
    track.appendChild(el);
}

/* ===== 2. Активная обложка и телевизор ===== */

let active = 0;

function setActive(index) {
    active = index;

    
    tvScreen.innerHTML = '';
    const img = document.createElement('img');
    img.src = `${IMG_PATH}${index + 1}.jpg`;
    img.alt = `Эпизод ${index + 1}`;
    img.className = 'tv-image';
    tvScreen.appendChild(img);

    
    [...track.children].forEach((el, i) => {
        el.classList.toggle('is-active', i === index);
    });
}

/* ===== 3. Карусель: перетаскивание, без зацикливания ===== */

let offset = 0;
let startX = 0;
let startOffset = 0;
let dragging = false;
let wasDragged = false;
let step = 0;
let maxOffset = 0;

function measure() {
    const first = track.children[0];
    if (!first) return;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    step = first.offsetWidth + gap;

    const visible = carousel.clientWidth;
    const full = step * TOTAL - gap;

    maxOffset = Math.min(0, visible - full);
}

function applyTransform() {
    if (offset > 0) offset = 0;
    if (offset < maxOffset) offset = maxOffset;
    track.style.transform = `translateX(${offset}px)`;
}

function onDown(x) {
    dragging = true;
    wasDragged = false;
    startX = x;
    startOffset = offset;
    track.style.transition = 'none';
}

function onMove(x) {
    if (!dragging) return;
    const dx = x - startX;
    if (Math.abs(dx) > 5) wasDragged = true;
    offset = startOffset + dx;
    applyTransform();
}

function onUp() {
    if (!dragging) return;
    dragging = false;
    track.style.transition = 'transform 0.25s';
    offset = Math.round(offset / step) * step;
    if (offset > 0) offset = 0;
    if (offset < maxOffset) offset = maxOffset;
    applyTransform();
}

// Мышь
track.addEventListener('mousedown', e => onDown(e.clientX));
window.addEventListener('mousemove', e => onMove(e.clientX));
window.addEventListener('mouseup', onUp);

// Тач
track.addEventListener('touchstart', e => onDown(e.touches[0].clientX), { passive: true });
track.addEventListener('touchmove',  e => onMove(e.touches[0].clientX), { passive: true });
track.addEventListener('touchend',   onUp);

// Колесо
track.addEventListener('wheel', e => {
    e.preventDefault();
    offset -= e.deltaY + e.deltaX;
    offset = Math.round(offset / step) * step;
    applyTransform();
}, { passive: false });

/* ===== 4. Клик по обложке ===== */

track.addEventListener('click', (e) => {
    if (wasDragged) return;
    const thumb = e.target.closest('.thumb');
    if (!thumb) return;
    const index = Number(thumb.dataset.index);
    setActive(index);
    scrollToActive(index);
});

/* ===== 5. Стрелки ===== */

const prevBtn = document.querySelector('.tv-arrow--prev');
const nextBtn = document.querySelector('.tv-arrow--next');

function stepActive(delta) {
    let next = active + delta;
    if (next < 0) next = 0;
    if (next > TOTAL - 1) next = TOTAL - 1;
    if (next === active) return;

    setActive(next);
    scrollToActive(next);
}

function scrollToActive(index) {
    const visible = carousel.clientWidth;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;

    const itemLeft  = index * step;
    const itemRight = itemLeft + step - gap;

    const viewLeft  = -offset;
    const viewRight = viewLeft + visible;

    if (itemLeft < viewLeft) {
        offset = -itemLeft;
    } else if (itemRight > viewRight) {
        offset = -(itemRight - visible);
    } else {
        return; 
    }

    if (offset > 0) offset = 0;
    if (offset < maxOffset) offset = maxOffset;

    track.style.transition = 'transform 0.25s';
    applyTransform();
}

prevBtn.addEventListener('click', () => stepActive(-1));
nextBtn.addEventListener('click', () => stepActive(1));



window.addEventListener('resize', () => {
    measure();
    offset = Math.round(offset / step) * step;
    applyTransform();
});

measure();
applyTransform();
setActive(0);