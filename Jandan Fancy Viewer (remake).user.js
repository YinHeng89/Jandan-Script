// ==UserScript==
// @name         Jandan Fancy Viewer (remake)
// @namespace    https://jandan.net/
// @version      1.0.4
// @description  使用 Fancybox 查看煎蛋评论区大图，支持分页动态加载
// @author       YinHeng (Fixed by Qwen)
// @match        http*://*.jandan.net/*
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.2.5/jquery.fancybox.min.js
// @resource     fancyboxCSS https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.2.5/jquery.fancybox.min.css
// @updateURL    https://raw.githubusercontent.com/YinHeng89/Jandan-Script/main/Jandan Fancy Viewer (remake).user.js
// @downloadURL  https://raw.githubusercontent.com/YinHeng89/Jandan-Script/main/Jandan Fancy Viewer (remake).user.js

// ==/UserScript==

(function() {
    'use strict';

    // 注入 Fancybox 样式
    if (!document.querySelector('link[href*="fancybox.min.css"]')) {
        GM_addStyle(GM_getResourceText('fancyboxCSS'));
    }

    // 初始化 Fancybox 的函数
    function initFancybox() {
        const viewOrigImgLinks = document.querySelectorAll('.img-container a.img-link:not([data-fancybox])');

        if (viewOrigImgLinks.length === 0) {
            console.warn('No new image links found.');
            return;
        }

        viewOrigImgLinks.forEach((link) => {
            const origSrc = link.href;
            if (!origSrc || !/^https?:\/\//.test(origSrc)) {
                console.warn('Invalid image link:', origSrc);
                return;
            }
            link.setAttribute('data-src', origSrc); // 存储原始链接
            link.href = '#'; // 设置占位符
            link.setAttribute('data-fancybox', 'gallery');
            link.setAttribute('data-caption', origSrc);
        });

        // 配置 Fancybox
        const config = {
            arrows: false,
            buttons: [
                'slideShow',
                'fullScreen',
                'thumbs',
                'download',
                'zoom',
                'close'
            ],
            beforeLoad: function(instance, current) {
                current.src = current.opts.$orig.attr('data-src'); // 动态加载图片
            }
        };

        // 初始化 Fancybox
        $('.img-container a.img-link').fancybox(config);
    }

    // 初始调用
    initFancybox();

    // 使用 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                // 检测到新节点被添加，重新初始化 Fancybox
                initFancybox();
            }
        });
    });

    // 配置观察器，监听整个文档的变化
    observer.observe(document.body, {
        childList: true, // 监听子节点的变化
        subtree: true    // 监听所有后代节点的变化
    });
})();
