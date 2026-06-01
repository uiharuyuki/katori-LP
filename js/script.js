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

// 直近に書き込んだ値を覚えておき、変化した時だけDOMへ反映する（冗長な再描画を防ぐ）
let lastClipRatio = -1;
let lastTextMove = -1;
let coverHidden = null;     // true=非表示, false=表示
let willChangeOn = false;   // will-change を現在付与しているか

// 現在のスクロール量に応じてアニメーションを反映する。
// scroll / resize の両方から呼び出して状態を一致させる。
function applyScrollAnimation() {
    if (!coverPage) return;

    const scrollPosition = window.scrollY;

    // テキストの移動（値が変わった時だけ書き込み）
    const activeTextScroll = Math.max(0, scrollPosition - config.TEXT_START_SCROLL);
    const textScrollRatio = Math.min(1, activeTextScroll / config.TEXT_ANIMATION_RANGE);
    const textMove = Math.round(textScrollRatio * config.TEXT_MOVE_DISTANCE);
    if (scrollingContent && textMove !== lastTextMove) {
        // ★ 移動量0（＝最上部）では transform を外す。translateY(0) でも transform が
        //   付いていると常時GPUレイヤーに昇格し、全画面fixedレイヤーが1枚増える。
        //   iOS(DPR3)では合成レイヤーの枚数がメモリ急騰＝強制リロードの一因になる。
        scrollingContent.style.transform = textMove === 0 ? '' : `translateY(-${textMove}px)`;
        lastTextMove = textMove;
    }

    // 円形クリップの進捗
    const activeClipScroll = Math.max(0, scrollPosition - config.CLIP_START_SCROLL);
    const clipScrollRatio = Math.min(1, activeClipScroll / config.CLIP_ANIMATION_RANGE);

    // ★ will-change はリビール中（0 < ratio < 1）だけ付与し、それ以外は解除する。
    //   全画面fixed＋動画入りレイヤーを常時GPU昇格させ続けると、iOS等で
    //   メモリが急騰し強制リロードを誘発するため。
    const animating = clipScrollRatio > 0 && clipScrollRatio < 1;
    if (animating !== willChangeOn) {
        coverPage.style.willChange = animating ? 'clip-path' : 'auto';
        willChangeOn = animating;
    }

    // clip-path は進捗が変化した時だけ書き込み（毎フレームの再ラスタライズを抑制）
    if (clipScrollRatio !== lastClipRatio) {
        if (clipScrollRatio === 0) {
            // ★ 最上部では clip-path 自体を外す。
            //   進捗0の円は画面対角線より大きく「何も切り抜いていない」が、
            //   iOS WebKit は再生中の動画を clip-path 越しに毎フレーム合成し続け、
            //   GPU/メモリが急騰して強制リロードを誘発する。clip を none にすると
            //   見た目は同一のまま、その負荷がなくなる。
            coverPage.style.clipPath = 'none';
        } else {
            const currentRadius = config.INITIAL_RADIUS - (config.radiusRange * clipScrollRatio);
            coverPage.style.clipPath = `circle(${currentRadius}px at 50% 0%)`;
        }
        lastClipRatio = clipScrollRatio;
    }

    // 表示/非表示の切り替えも状態が変わった時だけ
    const hidden = clipScrollRatio === 1;
    if (hidden !== coverHidden) {
        coverPage.style.pointerEvents = hidden ? 'none' : 'auto';
        coverPage.style.opacity = hidden ? '0' : '1';
        coverHidden = hidden;
        // カバーが隠れている間（＝トップを抜けている間）はカルーセル動画を
        // 停止してデコードを止める。戻ってきたらアクティブな動画を再生する。
        // 境界を跨いだ時に一度だけ実行されるため、再生/停止のトグル連発は起きない。
        toggleCoverVideos(!hidden);
    }
}

// カルーセル動画の再生/停止をまとめて制御する
const coverVideos = document.querySelectorAll('.video--top');
function toggleCoverVideos(shouldPlay) {
    if (!coverVideos.length) return;
    coverVideos.forEach((v) => {
        if (shouldPlay) {
            if (v.classList.contains('active')) {
                const pr = v.play();
                if (pr && typeof pr.catch === 'function') pr.catch(() => {});
            }
        } else if (!v.paused) {
            v.pause();
        }
    });
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

// -------------------------- セクション動画の遅延再生 --------------------------
// トップ閲覧中、画面外のセクション動画(・1/2/3)まで autoplay で同時デコード
// されるとメモリを圧迫し、ブラウザの強制リロードを誘発する。
// そこで autoplay を外し、「初めて画面内に入った時に一度だけ再生開始」する。
// ★ 一度再生したら監視を解除し、以降は停止/再開しない（＝スクロールでの
//    再生・停止トグルによるメモリ乱高下＝churnを起こさない）。
// ※ モバイルではセクション動画は CSS で display:none のため発火せず、
//    元の背景画像(JPG)表示のまま。トップのカルーセルだけが再生される。
(() => {
    const sectionVideos = document.querySelectorAll('.・1--video, .・2--video, .・3--video');
    if (!sectionVideos.length) return;

    const playOnce = (video) => {
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch(() => {}); // 再生拒否は無視
    };

    if (!('IntersectionObserver' in window)) {
        sectionVideos.forEach(playOnce); // 非対応環境は従来どおり全再生
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            playOnce(entry.target);
            obs.unobserve(entry.target); // 一度きり。以降は監視しない（churn防止）
        });
    }, { threshold: 0.25 });

    sectionVideos.forEach((video) => observer.observe(video));
})();

// -------------------------- バックグラウンド時は動画停止 --------------------------
// タブ/アプリが非表示になった後も動画をデコードし続けると、iOS が「メモリを
// 使い過ぎたページ」として復帰時にリロードしやすくなる。非表示中は停止する。
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        coverVideos.forEach((v) => { if (!v.paused) v.pause(); });
    } else if (!coverHidden) {
        toggleCoverVideos(true); // 復帰時、トップ表示中ならアクティブ動画を再生
    }
});
