// -------------------------- 円形SCROLLアニメーション --------------------------
const coverPage = document.getElementById('coverPage');
const scrollingContent = document.getElementById('scrollingContent');

// レスポンシブの境界(これ以下をモバイル扱い)
const MOBILE_BREAKPOINT = 1024;

// 画面サイズに依存する値をまとめて算出する。
// リサイズ時はこの関数を呼び直すだけで再計算でき、リロードは不要。
function computeConfig() {
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

    // ---------------------- Animation - px（デバイスに応じて調整）
    const CLIP_START_SCROLL = isMobile ? 800 : 1200;
    const CLIP_ANIMATION_RANGE = isMobile ? 400 : 550;

    // ---------------------- text - px
    const TEXT_START_SCROLL = 0;
    const TEXT_ANIMATION_RANGE = isMobile ? 1200 : 1700;
    const TEXT_MOVE_DISTANCE = isMobile ? 1000 : 1500;

    // 画面対角線を基準にした初期半径
    const INITIAL_RADIUS = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2) / 2 * 2;
    const FINAL_RADIUS = 0;

    return {
        isMobile,
        CLIP_START_SCROLL,
        CLIP_ANIMATION_RANGE,
        TEXT_START_SCROLL,
        TEXT_ANIMATION_RANGE,
        TEXT_MOVE_DISTANCE,
        INITIAL_RADIUS,
        FINAL_RADIUS,
        radiusRange: INITIAL_RADIUS - FINAL_RADIUS,
    };
}

let config = computeConfig();

// 現在のスクロール量に応じてアニメーションを反映する。
// scroll / resize の両方から呼び出して状態を一致させる。
function applyScrollAnimation() {
    if (!coverPage) return;

    const scrollPosition = window.scrollY;

    // テキストの移動
    const activeTextScroll = Math.max(0, scrollPosition - config.TEXT_START_SCROLL);
    const textScrollRatio = Math.min(1, activeTextScroll / config.TEXT_ANIMATION_RANGE);
    const textMove = textScrollRatio * config.TEXT_MOVE_DISTANCE;
    if (scrollingContent) {
        scrollingContent.style.transform = `translateY(-${textMove}px)`;
    }

    // 円形クリップの半径
    const activeClipScroll = Math.max(0, scrollPosition - config.CLIP_START_SCROLL);
    const clipScrollRatio = Math.min(1, activeClipScroll / config.CLIP_ANIMATION_RANGE);
    const currentRadius = config.INITIAL_RADIUS - (config.radiusRange * clipScrollRatio);
    coverPage.style.clipPath = `circle(${currentRadius}px at 50% 0%)`;

    if (clipScrollRatio === 1) {
        coverPage.style.pointerEvents = 'none';
        coverPage.style.opacity = '0';
    } else {
        coverPage.style.pointerEvents = 'auto';
        coverPage.style.opacity = '1';
    }
}

// スクロールは requestAnimationFrame で間引いて負荷を抑える
let scrollTicking = false;
window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
        applyScrollAnimation();
        scrollTicking = false;
    });
}, { passive: true });

// 初期描画
applyScrollAnimation();

// -------------------------- リサイズ対応 --------------------------
// 以前は resize のたびに location.reload() していたが、
// スマホではスクロール時にアドレスバーの開閉で「高さ」が変化して resize が
// 発火し、意図しないリロードが起きていた。
// リロードはやめ、横幅が実際に変わった時だけ値を再計算して再描画する。
// （高さのみの変化＝アドレスバー開閉では何もしない）
let resizeTimer;
let lastWindowWidth = window.innerWidth;

window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        const currentWidth = window.innerWidth;
        if (currentWidth === lastWindowWidth) return; // 高さのみの変化は無視

        lastWindowWidth = currentWidth;
        config = computeConfig();   // 新しい画面サイズで再計算
        applyScrollAnimation();     // 現在のスクロール位置で再描画
    }, 200);
});

// -------------------------- 動画の二重ロード対策 --------------------------
// 同じ動画ファイルを carousel(section1) と各セクション(container--1/2/3)で
// 二重に <video> 化しているため、全部を同時にデコードするとメモリを圧迫し、
// スマホでブラウザが強制リロードする原因になる。
// preload="none" にした上で、「画面内に入った動画だけ再生し、出たら停止」して
// 同時にデコードされる本数を最小限に抑える。
// ※ carousel 内の動画は carousel.js が制御するため、ここでは対象外。
(() => {
    const sectionVideos = document.querySelectorAll('.・1--video, .・2--video, .・3--video');
    if (!sectionVideos.length) return;

    const playSafely = (video) => {
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch(() => {}); // 自動再生拒否は無視
    };

    if (!('IntersectionObserver' in window)) {
        // 非対応環境では従来どおり全て再生（フォールバック）
        sectionVideos.forEach(playSafely);
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting) {
                playSafely(video);
            } else if (!video.paused) {
                video.pause(); // 画面外ではデコードを止めてメモリを解放
            }
        });
    }, { threshold: 0.1 });

    sectionVideos.forEach((video) => observer.observe(video));
})();
