// ==UserScript==
// @name         Jandan Slideshow (remake)
// @namespace    https://jandan.net/
// @version      1.0.6
// @description  给煎蛋无聊图添加一个幻灯片浏览，默认按i可以切换显示
// @author       YinHeng (Fixed by Qwen)
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @match        https://jandan.net/*
// @updateURL    https://raw.githubusercontent.com/YinHeng89/Jandan-Script/main/Jandan Slideshow (remake).user.js
// @downloadURL  https://raw.githubusercontent.com/YinHeng89/Jandan-Script/main/Jandan Slideshow (remake).user.js

// ==/UserScript==

/* jshint ignore:start */
var inline_src = (<><![CDATA[
    /* jshint ignore:end */
        /* jshint esnext: false */
        /* jshint esversion: 6 */

        const style = document.createElement('style');
        style.innerHTML = `
    .slide-container {
      display: none;
      width: 100%;
      height: 100%;
      position: fixed;
      box-sizing: border-box;
      margin: 0;
      top: 0;
      padding: 5rem;
      background: rgba(0, 0, 0, 0.9);
      z-index: 320;
    }
    .slide-display-container {
      width: 100%;
      height: 88%;
      justify-content: center;
      align-items: center;
      display: flex;
    }
    .slide-image {
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
    }
    .slide-indicators {
      width: auto;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      margin: 0;
      padding: 0 1rem;
      overflow-x: scroll;
      white-space: nowrap;
    }
    .indicator-col {
      height: 10vh;
      width: auto;
      display: inline-block;
      padding: 0 0.6rem;
      cursor: pointer;
    }
    .indicator-image {
      width: auto;
      height: 100%;
      object-fit: cover;
    }
    .toggle-slide {
      z-index: 400;
      position: fixed;
      right: 1rem;
      top: 1rem;
      background-color: #9BD6DB;
      border-color: transparent;
      border-radius: 100px;
      color: #fff;
      font-size: 14px;
      line-height: 20px;
      padding: 6px 16px;
      text-align: center;
      white-space: nowrap;
      font-weight: bold;
      cursor: pointer;
    }
    .to {
      cursor: pointer;
      width: 40vw;
      height: 100%;
      position: absolute;
      top: 0;
    }
    .to-left {
      left: 0;
    }
    .to-right {
      right: 0;
    }
        `;
        document.head.append(style);

        // 等待图片加载完成后再初始化幻灯片
        function waitForImages() {
            return new Promise((resolve) => {
                const interval = setInterval(() => {
                    const imageContainers = [...document.querySelectorAll('.img-container img.img-min')];
                    if (imageContainers.length > 0 && imageContainers.every(img => img.dataset.src || img.src)) {
                        clearInterval(interval);
                        resolve(imageContainers);
                    }
                }, 100); // 每 100ms 检查一次
            });
        }
        // 添加请求拦截器
        axios.interceptors.request.use(
        (res) => {
            if(res.url.includes("/post/")){
                waitForImages().then(activaeImg)
            }

            return res; // 返回修改后的配置
        }
        );

        function activaeImg(imageContainers){
            // 获取图片链接
            const images = imageContainers.map(img => img.dataset.src || img.src);

            // 创建幻灯片容器
            const slideContainer = document.createElement('div');
            slideContainer.className = 'slide-container';
            const slideIndicatorContainer = document.createElement('div');
            slideIndicatorContainer.className = 'slide-indicators';

            // 创建指示器
            images.forEach((image, index) => {
                const el = document.createElement('div');
                el.className = 'indicator-col';
                el.innerHTML = `<img class="indicator-image" src="${image}">`;
                el.onclick = () => { showIndex(index); };
                slideIndicatorContainer.append(el);
            });

            // 创建图片展示区域
            slideContainer.innerHTML = '<div class="slide-display-container">' +
                images.map((image) => `<img class="slide-image" src="${image}" style="display: none">`).join('') +
                '</div>';
            slideContainer.append(slideIndicatorContainer);

            // 添加到页面
            document.body.append(slideContainer);

            // 设置初始状态为隐藏
            slideContainer.style.display = 'none';

            let currentScrollIndex;
            function showIndex(scrollIndex) {
                const slideImages = slideContainer.querySelectorAll('.slide-image');
                slideImages.forEach((image, index) => {
                    if (index === scrollIndex) { image.style.display = 'flex'; }
                    else { image.style.display = 'none'; }
                });
                currentScrollIndex = scrollIndex;
            }

            // 创建切换按钮
            const toggleSlideBtn = document.createElement('button');
            toggleSlideBtn.className = 'toggle-slide';
            toggleSlideBtn.innerText = '查看幻灯片';
            toggleSlideBtn.onclick = () => {
                if (slideContainer.style.display === 'none') {
                    slideContainer.style.display = 'block';
                } else {
                    slideContainer.style.display = 'none';
                }
            };

            // 左右切换按钮
            const toLeft = document.createElement('div');
            const toRight = document.createElement('div');
            toLeft.className = 'to-left to';
            toRight.className = 'to-right to';
            toLeft.onclick = () => {
                if (currentScrollIndex > 0) {
                    showIndex(currentScrollIndex - 1);
                }
            };
            toRight.onclick = () => {
                if (currentScrollIndex < images.length - 1) {
                    showIndex(currentScrollIndex + 1);
                }
            };
            const slideDisplayContainer = slideContainer.querySelector('.slide-display-container');
            slideDisplayContainer.append(toLeft);
            slideDisplayContainer.append(toRight);

            // 添加到页面
            document.body.append(toggleSlideBtn);
            showIndex(0);

            // 键盘事件监听
            const keyEsc = 27;
            const keyLeft = 37;
            const keyRight = 39;
            const keyInspect = 73;
            document.addEventListener('keydown', (ev) => {
                switch (ev.keyCode) {
                    case keyEsc:
                        slideContainer.style.display = 'none';
                        break;
                    case keyLeft:
                        toLeft.click();
                        break;
                    case keyRight:
                        toRight.click();
                        break;
                    case keyInspect:
                        // 按 i 键切换显示和隐藏状态
                        if (slideContainer.style.display === 'none') {
                            slideContainer.style.display = 'block';
                        } else {
                            slideContainer.style.display = 'none';
                        }
                        break;
                }
            });
        }

        waitForImages().then(activaeImg);

    /* jshint ignore:start */
    ]]></>).toString();
    var c = Babel.transform(inline_src, { presets: [ "es2015", "es2016" ] });
    eval(c.code);
    /* jshint ignore:end */
