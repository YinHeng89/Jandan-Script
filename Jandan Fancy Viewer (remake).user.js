// ==UserScript==
// @name         Jandan Fancy Viewer (remake)
// @namespace    https://jandan.net/
// @version      1.0.5
// @description  使用 Fancybox 查看煎蛋评论区大图，支持分页动态加载和 mp4 视频预览
// @author       YinHeng (Fixed by Qwen)
// @match        http*://*.jandan.net/*
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// @require      https://cdn.jsdelivr.net/npm/@fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.js
// @resource     fancyboxCSS https://cdn.jsdelivr.net/npm/@fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.css
// @updateURL    https://raw.githubusercontent.com/YinHeng89/Jandan-Script/main/Jandan Fancy Viewer (remake).user.js
// @downloadURL  https://raw.githubusercontent.com/YinHeng89/Jandan-Script/main/Jandan Fancy Viewer (remake).user.js
// ==/UserScript==

(function () {
    'use strict';

    // 注入 Fancybox 样式
    if (!document.querySelector('link[href*="fancybox.min.css"]')) {
        GM_addStyle(GM_getResourceText('fancyboxCSS'));
    }

    // 初始化 Fancybox 的函数
    function initFancybox() {
        const viewOrigImgLinks = document.querySelectorAll('.img-container a.img-link:not([data-fancybox])');

        if (viewOrigImgLinks.length === 0) return;

        viewOrigImgLinks.forEach((link) => {
            let origSrc = link.dataset.src;
            if (!origSrc || !/^https?:\/\//.test(origSrc)) return;

            // 设置基本属性
            link.href = '#';
            link.setAttribute('data-fancybox', 'gallery');
            link.setAttribute('data-caption', origSrc);
            link.setAttribute('data-src', origSrc);

            // 根据文件类型设置 Fancybox type
            if (origSrc.endsWith('.mp4')) {
                link.setAttribute('data-type', 'video');
            } else if (origSrc.match(/\.(jpe?g|png|gif|webp)$/i)) {
                link.setAttribute('data-type', 'image');
            }
        });

        // 初始化 Fancybox
        $('.img-container a.img-link').fancybox({
            buttons: [
                'slideShow',
                'fullScreen',
                'thumbs',
                'download',
                'zoom',
                'close'
            ]
        });
    }

    // 初始调用
    initFancybox();

    // 监听动态加载内容（分页）
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if ([...mutation.addedNodes].some(n => n.nodeType === 1 && n.querySelector?.('.img-container a.img-link'))) {
                initFancybox();
                break;
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
