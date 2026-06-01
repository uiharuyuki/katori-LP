



(function() {
    'use strict';

    // 要素の取得
    const videos = document.querySelectorAll('.video--top');
    const texts = document.querySelectorAll('.carousel-text');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.arrow-prev');
    const nextBtn = document.querySelector('.arrow-next');
    
    // 設定
    let currentIndex = 0;
    const totalSlides = 3; // 3つのスライド
    let isTransitioning = false;
    let autoPlayInterval = null;
    const autoPlayDelay = 5000; // 自動再生の間隔（ミリ秒）

    // ===========================
    // スライド切り替え関数
    // ===========================
    function changeSlide(newIndex) {
        // トランジション中または同じインデックスの場合は処理しない
        if (isTransitioning || newIndex === currentIndex) return;
        
        isTransitioning = true;

        // 前のスライドを非アクティブに
        videos[currentIndex].classList.remove('active');
        texts[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');

        // 新しいスライドをアクティブに
        currentIndex = newIndex;
        videos[currentIndex].classList.add('active');
        
        // 動画の再生を開始
        videos[currentIndex].currentTime = 0;
        videos[currentIndex].play();

        // テキストとドットを少し遅延してアクティブに（スムーズな切り替え効果）
        setTimeout(() => {
            texts[currentIndex].classList.add('active');
            dots[currentIndex].classList.add('active');
        }, 300);

        // トランジション完了
        setTimeout(() => {
            isTransitioning = false;
        }, 1000);
    }

    // ===========================
    // ドットクリックイベント
    // ===========================
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.dataset.index);
            changeSlide(index);
            stopAutoPlay(); // 手動操作時は自動再生を停止
        });
    });

    // ===========================
    // 矢印ボタンクリックイベント
    // ===========================
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const newIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            changeSlide(newIndex);
            stopAutoPlay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const newIndex = (currentIndex + 1) % totalSlides;
            changeSlide(newIndex);
            stopAutoPlay();
        });
    }

    // ===========================
    // キーボード操作（左右キー）
    // ===========================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && prevBtn) {
            prevBtn.click();
        } else if (e.key === 'ArrowRight' && nextBtn) {
            nextBtn.click();
        }
    });

    // ===========================
    // スワイプ操作（モバイル対応）
    // ===========================
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50; // スワイプ判定の閾値
        if (touchStartX - touchEndX > swipeThreshold && nextBtn) {
            // 左スワイプ（次へ）
            nextBtn.click();
        } else if (touchEndX - touchStartX > swipeThreshold && prevBtn) {
            // 右スワイプ（前へ）
            prevBtn.click();
        }
    }

    // ===========================
    // 自動再生機能
    // ===========================
    function startAutoPlay() {
        stopAutoPlay(); // 既存のタイマーをクリア
        autoPlayInterval = setInterval(() => {
            if (nextBtn) {
                const newIndex = (currentIndex + 1) % totalSlides;
                changeSlide(newIndex);
            }
        }, autoPlayDelay);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }

    // ===========================
    // マウスホバーで自動再生を制御
    // ===========================
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopAutoPlay);
        carouselContainer.addEventListener('mouseleave', startAutoPlay);
    }

    // ===========================
    // 初期化
    // ===========================
    function init() {
        // 最初の動画を再生
        if (videos[0]) {
            videos[0].play();
        }

        // 自動再生を開始（必要に応じてコメントアウト解除）
        // startAutoPlay();
    }

    // DOMContentLoaded後に初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();