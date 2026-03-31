// -------------------------- 円形SCROLLアニメーション --------------------------
const coverPage = document.getElementById('coverPage');
const scrollingContent = document.getElementById('scrollingContent'); 

// レスポンシブ対応の設定
const isMobile = window.innerWidth <= 1024;

// ---------------------- Animation - px（デバイスに応じて調整）
const CLIP_START_SCROLL = isMobile ? 800 : 1200;
const CLIP_ANIMATION_RANGE = isMobile ? 400 : 550;
const MAX_CLIP_SCROLL = CLIP_START_SCROLL + CLIP_ANIMATION_RANGE;
// ---------------------- Animation - px

// ---------------------- text - px
const TEXT_START_SCROLL = 0;
const TEXT_ANIMATION_RANGE = isMobile ? 1200 : 1700;
// ---------------------- text - px

const INITIAL_RADIUS = Math.sqrt(window.innerWidth**2 + window.innerHeight**2) / 2 * 2;
const FINAL_RADIUS = 0;
const radiusRange = INITIAL_RADIUS - FINAL_RADIUS;

window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;
    const activeTextScroll = Math.max(0, scrollPosition - TEXT_START_SCROLL);
    const textScrollRatio = Math.min(1, activeTextScroll / TEXT_ANIMATION_RANGE);
    const textMove = textScrollRatio * (isMobile ? 1000 : 1500);
    
    if (scrollingContent) {
        scrollingContent.style.transform = `translateY(-${textMove}px)`;
    }

    const activeClipScroll = Math.max(0, scrollPosition - CLIP_START_SCROLL);
    const clipScrollRatio = Math.min(1, activeClipScroll / CLIP_ANIMATION_RANGE);
    const currentRadius = INITIAL_RADIUS - (radiusRange * clipScrollRatio);
    coverPage.style.clipPath = `circle(${currentRadius}px at 50% 0%)`;
    
    if (clipScrollRatio === 1) {
        coverPage.style.pointerEvents = 'none';
        coverPage.style.opacity = '0';
    } else {
        coverPage.style.pointerEvents = 'auto';
        coverPage.style.opacity = '1';
    }
});

const updateRadius = () => {
    coverPage.style.clipPath = `circle(${INITIAL_RADIUS}px at 50% 0%)`;
};
updateRadius();

// リサイズ時に再計算
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        location.reload(); // デバイス変更時はリロード
    }, 250);
});