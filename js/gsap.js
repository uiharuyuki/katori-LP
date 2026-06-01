



// --------------------------------- section - nav
    gsap.registerPlugin(ScrollToPlugin) 
    function getSamePageAnchor (link) { if ( link.protocol !== window.location.protocol || link.host !== window.location.host || link.pathname !== window.location.pathname || link.search !== window.location.search ) { return false;} return link.hash;}
    function scrollToHash(hash, e) { const elem = hash ? document.querySelector(hash) : false; if(elem) { if(e) e.preventDefault(); gsap.to(window, {scrollTo: elem});} }
    document.querySelectorAll('a[href]').forEach(a => { a.addEventListener('click', e => { scrollToHash(getSamePageAnchor(a), e); }); }); scrollToHash(window.location.hash);
// --------------------------------- section - nav

// --------------------------------- バーガーメニュー
const trigger = document.querySelector('.menu-trigger');
const menu = document.querySelector('.circle-menu');
const menuItems = document.querySelectorAll('.circle-menu a');
let isOpen = false; 
trigger.addEventListener('click', () => { 
    isOpen = !isOpen; 
    if (isOpen) {
        trigger.classList.add('active'); 
        menu.classList.add('active');
        gsap.fromTo(menu, { clipPath: "circle(0px at calc(100% - 50px) 50px)" }, { duration: 0.6, clipPath: "circle(150% at calc(100% - 50px) 50px)", ease: "power2.inOut" });
        gsap.to(menuItems, { duration: 0.5, opacity: 1, y: 0, stagger: 0.1, delay: 0.3 }); 
    } else { 
        trigger.classList.remove('active');
        gsap.to(menuItems, { duration: 0.3, opacity: 0, y: 20 });
        gsap.to(menu, { duration: 0.6, clipPath: "circle(0px at calc(100% - 50px) 50px)", ease: "power2.inOut", delay: 0.2, onComplete: () => { menu.classList.remove('active');}});
    }
});
menuItems.forEach((link) => {
    link.addEventListener('click', () => {
        if (isOpen) {
            isOpen = false;
            trigger.classList.remove('active');
            gsap.to(menuItems, { duration: 0.3, opacity: 0, y: 20 });
            gsap.to(menu, { 
                duration: 0.6, 
                clipPath: "circle(0px at calc(100% - 50px) 50px)", 
                ease: "power2.inOut", 
                delay: 0.2, 
                onComplete: () => { menu.classList.remove('active');}
            });
        }
    });
});
// --------------------------------- バーガーメニュー

// --------------------------------- スクロール連動アニメーション (フェードアウト)
gsap.registerPlugin(ScrollTrigger);
gsap.to(".scroll-indicator", {
    opacity: 0,
    duration: 1.5,
    scrollTrigger: { trigger: ".scroll-indicator", start: "top 85%", end: "top 50%", scrub: true, }});
// --------------------------------- スクロール連動アニメーション (フェードアウト)

// --------------------------------- スクロール連動アニメーション (円形video)
// PC画面のみ適用（1025px以上）
// gsap.matchMedia() を使うことで、リロードせずに画面幅の変化へ追従する。
// PC幅になると登録され、PC幅を外れると自動でクリーンアップ(pin等も解除)される。
const mm = gsap.matchMedia();

mm.add("(min-width: 1025px)", () => {
    gsap.to("#・1", {
        scale: 3.55,
        scrollTrigger: {
            trigger: ".container--1",
            scrub: 1,
            pin: true,
            start: "top 10%",
            end: "+=800",
            ease: "none"
        },
    });

    gsap.to("#・2", {
        scale: 1.6,
        scrollTrigger: {
            trigger: ".container--2",
            scrub: 0.8,
            pin: true,
            start: "top 10%",
            end: "+=400",
            ease: "none"
        },
    });

    gsap.to("#・3", {
        scale: 1.6,
        scrollTrigger: {
            trigger: ".container--3",
            scrub: 0.8,
            pin: true,
            start: "top 10%",
            end: "+=400",
            ease: "none"
        },
    });
});
// --------------------------------- スクロール連動アニメーション (円形video)