(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-0f88c136"],{"0790":function(t,n,o){"use strict";o.d(n,"b",(function(){return i})),o.d(n,"a",(function(){return r})),o.d(n,"c",(function(){return a}));
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0
THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.
See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var e=function(t,n){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,n){t.__proto__=n}||function(t,n){for(var o in n)n.hasOwnProperty(o)&&(t[o]=n[o])},e(t,n)};function i(t,n){function o(){this.constructor=t}e(t,n),t.prototype=null===n?Object.create(n):(o.prototype=n.prototype,new o)}function r(t,n,o,e){return new(o||(o=Promise))((function(i,r){function a(t){try{s(e.next(t))}catch(n){r(n)}}function c(t){try{s(e["throw"](t))}catch(n){r(n)}}function s(t){t.done?i(t.value):new o((function(n){n(t.value)})).then(a,c)}s((e=e.apply(t,n||[])).next())}))}function a(t,n){var o,e,i,r,a={label:0,sent:function(){if(1&i[0])throw i[1];return i[1]},trys:[],ops:[]};return r={next:c(0),throw:c(1),return:c(2)},"function"===typeof Symbol&&(r[Symbol.iterator]=function(){return this}),r;function c(t){return function(n){return s([t,n])}}function s(r){if(o)throw new TypeError("Generator is already executing.");while(a)try{if(o=1,e&&(i=2&r[0]?e["return"]:r[0]?e["throw"]||((i=e["return"])&&i.call(e),0):e.next)&&!(i=i.call(e,r[1])).done)return i;switch(e=0,i&&(r=[2&r[0],i.value]),r[0]){case 0:case 1:i=r;break;case 4:return a.label++,{value:r[1],done:!1};case 5:a.label++,e=r[1],r=[0];continue;case 7:r=a.ops.pop(),a.trys.pop();continue;default:if(i=a.trys,!(i=i.length>0&&i[i.length-1])&&(6===r[0]||2===r[0])){a=0;continue}if(3===r[0]&&(!i||r[1]>i[0]&&r[1]<i[3])){a.label=r[1];break}if(6===r[0]&&a.label<i[1]){a.label=i[1],i=r;break}if(i&&a.label<i[2]){a.label=i[2],a.ops.push(r);break}i[2]&&a.ops.pop(),a.trys.pop();continue}r=n.call(t,a)}catch(c){r=[6,c],e=0}finally{o=i=0}if(5&r[0])throw r[1];return{value:r[0]?r[1]:void 0,done:!0}}}},"26f2":function(t,n,o){"use strict";function e(t){"requestIdleCallback"in window?window.requestIdleCallback(t):setTimeout(t,32)}function i(t){return!!t.shadowRoot&&!!t.attachShadow}function r(t){var n=t.closest("ion-item");return n?n.querySelector("ion-label"):null}function a(t,n,o,e,r){if(t||i(n)){var a=n.querySelector("input.aux-input");a||((a=n.ownerDocument.createElement("input")).type="hidden",a.classList.add("aux-input"),n.appendChild(a)),a.disabled=r,a.name=o,a.value=e||""}}function c(t,n,o){return Math.max(t,Math.min(n,o))}function s(t){return t.timeStamp||Date.now()}function l(t){if(t){var n=t.changedTouches;if(n&&n.length>0){var o=n[0];return{x:o.clientX,y:o.clientY}}if(void 0!==t.pageX)return{x:t.pageX,y:t.pageY}}return{x:0,y:0}}function u(t,n){var o="rtl"===t.document.dir;switch(n){case"start":return o;case"end":return!o;default:throw new Error('"'+n+'" is not a valid value for [side]. Use "start" or "end" instead.')}}function d(t,n){var o=t._original||t;return{_original:t,emit:b(o.emit.bind(o),n)}}function b(t,n){var o;return void 0===n&&(n=0),function(){for(var e=[],i=0;i<arguments.length;i++)e[i]=arguments[i];clearTimeout(o),o=setTimeout.apply(void 0,[t,n].concat(e))}}o.d(n,"a",(function(){return e})),o.d(n,"b",(function(){return s})),o.d(n,"c",(function(){return i})),o.d(n,"d",(function(){return r})),o.d(n,"e",(function(){return a})),o.d(n,"f",(function(){return d})),o.d(n,"g",(function(){return u})),o.d(n,"h",(function(){return c})),o.d(n,"i",(function(){return b})),o.d(n,"j",(function(){return l}))},6620:function(t,n,o){"use strict";o.r(n),o.d(n,"IonButton",(function(){return c})),o.d(n,"IonIcon",(function(){return p}));var e,i=o("7018"),r=o("77a5"),a=o("26f2"),c=function(){function t(){var t=this;this.inToolbar=!1,this.buttonType="button",this.disabled=!1,this.routerDirection="forward",this.strong=!1,this.type="button",this.onFocus=function(){t.ionFocus.emit()},this.onBlur=function(){t.ionBlur.emit()}}return t.prototype.componentWillLoad=function(){this.inToolbar=!!this.el.closest("ion-buttons")},t.prototype.onClick=function(t){if("button"===this.type)Object(r["b"])(this.win,this.href,t,this.routerDirection);else if(Object(a["c"])(this.el)){var n=this.el.closest("form");if(n){t.preventDefault();var o=this.win.document.createElement("button");o.type=this.type,o.style.display="none",n.appendChild(o),o.click(),o.remove()}}},Object.defineProperty(t.prototype,"hasIconOnly",{get:function(){return!!this.el.querySelector('ion-icon[slot="icon-only"]')},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"rippleType",{get:function(){return(void 0===this.fill||"clear"===this.fill)&&this.hasIconOnly&&this.inToolbar?"unbounded":"bounded"},enumerable:!0,configurable:!0}),t.prototype.hostData=function(){var t,n=this,o=n.buttonType,e=n.disabled,i=n.expand,a=n.hasIconOnly,c=n.shape,s=n.size,l=n.strong,u=this.fill;return void 0===u&&(u=this.inToolbar?"clear":"solid"),{"aria-disabled":e?"true":null,class:Object.assign({},Object(r["c"])(n.color),(t={},t[""+this.mode]=!0,t[o]=!0,t[o+"-"+i]=void 0!==i,t[o+"-"+s]=void 0!==s,t[o+"-"+c]=void 0!==c,t[o+"-"+u]=!0,t[o+"-strong"]=l,t["button-has-icon-only"]=a,t["button-disabled"]=e,t["ion-activatable"]=!0,t["ion-focusable"]=!0,t))}},t.prototype.render=function(){var t=void 0===this.href?"button":"a";return Object(i["b"])(t,Object.assign({},"button"===t?{type:this.type}:{href:this.href},{class:"button-native",disabled:this.disabled,onFocus:this.onFocus,onBlur:this.onBlur}),Object(i["b"])("span",{class:"button-inner"},Object(i["b"])("slot",{name:"icon-only"}),Object(i["b"])("slot",{name:"start"}),Object(i["b"])("slot",null),Object(i["b"])("slot",{name:"end"})),"md"===this.mode&&Object(i["b"])("ion-ripple-effect",{type:this.rippleType}))},Object.defineProperty(t,"is",{get:function(){return"ion-button"},enumerable:!0,configurable:!0}),Object.defineProperty(t,"encapsulation",{get:function(){return"shadow"},enumerable:!0,configurable:!0}),Object.defineProperty(t,"properties",{get:function(){return{buttonType:{type:String,attr:"button-type",mutable:!0},color:{type:String,attr:"color"},disabled:{type:Boolean,attr:"disabled",reflectToAttr:!0},el:{elementRef:!0},expand:{type:String,attr:"expand",reflectToAttr:!0},fill:{type:String,attr:"fill",reflectToAttr:!0,mutable:!0},href:{type:String,attr:"href"},mode:{type:String,attr:"mode"},routerDirection:{type:String,attr:"router-direction"},shape:{type:String,attr:"shape",reflectToAttr:!0},size:{type:String,attr:"size",reflectToAttr:!0},strong:{type:Boolean,attr:"strong"},type:{type:String,attr:"type"},win:{context:"window"}}},enumerable:!0,configurable:!0}),Object.defineProperty(t,"events",{get:function(){return[{name:"ionFocus",method:"ionFocus",bubbles:!0,cancelable:!0,composed:!0},{name:"ionBlur",method:"ionBlur",bubbles:!0,cancelable:!0,composed:!0}]},enumerable:!0,configurable:!0}),Object.defineProperty(t,"listeners",{get:function(){return[{name:"click",method:"onClick"}]},enumerable:!0,configurable:!0}),Object.defineProperty(t,"style",{get:function(){return".sc-ion-button-md-h{--overflow:hidden;--ripple-color:currentColor;--border-width:initial;--border-color:initial;--border-style:initial;--box-shadow:none;display:inline-block;width:auto;color:var(--color);font-family:var(--ion-font-family,inherit);text-align:center;text-decoration:none;text-overflow:ellipsis;white-space:nowrap;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;vertical-align:top;vertical-align:-webkit-baseline-middle;pointer-events:auto;-webkit-font-kerning:none;font-kerning:none}.button-disabled.sc-ion-button-md-h{pointer-events:none}.button-disabled.sc-ion-button-md-h   .button-native.sc-ion-button-md{cursor:default;opacity:.5;pointer-events:none}.button-solid.sc-ion-button-md-h{--background:var(--ion-color-primary,#3880ff);--background-focused:var(--ion-color-primary-shade,#3171e0);--color:var(--ion-color-primary-contrast,#fff);--color-activated:var(--ion-color-primary-contrast,#fff);--color-focused:var(--ion-color-primary-contrast,#fff)}.button-solid.ion-color.sc-ion-button-md-h   .button-native.sc-ion-button-md{background:var(--ion-color-base);color:var(--ion-color-contrast)}.button-solid.ion-color.ion-focused.sc-ion-button-md-h   .button-native.sc-ion-button-md{background:var(--ion-color-shade)}.button-outline.sc-ion-button-md-h{--border-color:var(--ion-color-primary,#3880ff);--background:transparent;--color:var(--ion-color-primary,#3880ff);--color-focused:var(--ion-color-primary,#3880ff)}.button-outline.ion-color.sc-ion-button-md-h   .button-native.sc-ion-button-md{border-color:var(--ion-color-base);background:transparent;color:var(--ion-color-base)}.button-outline.ion-focused.ion-color.sc-ion-button-md-h   .button-native.sc-ion-button-md{background:rgba(var(--ion-color-base-rgb),.1);color:var(--ion-color-base)}.button-clear.sc-ion-button-md-h{--border-width:0;--background:transparent;--color:var(--ion-color-primary,#3880ff)}.button-clear.ion-color.sc-ion-button-md-h   .button-native.sc-ion-button-md{background:transparent;color:var(--ion-color-base)}.button-clear.ion-focused.ion-color.sc-ion-button-md-h   .button-native.sc-ion-button-md{background:rgba(var(--ion-color-base-rgb),.1);color:var(--ion-color-base)}.button-clear.activated.ion-color.sc-ion-button-md-h   .button-native.sc-ion-button-md{background:transparent}.button-block.sc-ion-button-md-h{display:block}.button-block.sc-ion-button-md-h   .button-native.sc-ion-button-md{margin-left:0;margin-right:0;display:block;width:100%;clear:both;contain:content}.button-block.sc-ion-button-md-h   .button-native.sc-ion-button-md:after{clear:both}.button-full.sc-ion-button-md-h{display:block}.button-full.sc-ion-button-md-h   .button-native.sc-ion-button-md{margin-left:0;margin-right:0;display:block;width:100%;contain:content}.button-full.sc-ion-button-md-h:not(.button-round)   .button-native.sc-ion-button-md{border-radius:0;border-right-width:0;border-left-width:0}.button-native.sc-ion-button-md{border-radius:var(--border-radius);-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;margin-left:0;margin-right:0;margin-top:0;margin-bottom:0;padding-left:var(--padding-start);padding-right:var(--padding-end);padding-top:var(--padding-top);padding-bottom:var(--padding-bottom);font-family:inherit;font-size:inherit;font-style:inherit;font-weight:inherit;letter-spacing:inherit;text-decoration:inherit;text-overflow:inherit;text-transform:inherit;text-align:inherit;white-space:inherit;color:inherit;display:block;position:relative;width:100%;height:100%;-webkit-transition:var(--transition);transition:var(--transition);border-width:var(--border-width);border-style:var(--border-style);border-color:var(--border-color);outline:none;background:var(--background);line-height:1;-webkit-box-shadow:var(--box-shadow);box-shadow:var(--box-shadow);contain:layout style;cursor:pointer;opacity:var(--opacity);overflow:var(--overflow);z-index:0;-webkit-box-sizing:border-box;box-sizing:border-box;-webkit-appearance:none;-moz-appearance:none;appearance:none}@supports ((-webkit-margin-start:0) or (margin-inline-start:0)) or (-webkit-margin-start:0){.button-native.sc-ion-button-md{padding-left:unset;padding-right:unset;-webkit-padding-start:var(--padding-start);padding-inline-start:var(--padding-start);-webkit-padding-end:var(--padding-end);padding-inline-end:var(--padding-end)}}.button-native.sc-ion-button-md::-moz-focus-inner{border:0}.ion-focused.sc-ion-button-md-h   .button-native.sc-ion-button-md{background:var(--background-focused);color:var(--color-focused)}.activated.sc-ion-button-md-h   .button-native.sc-ion-button-md{background:var(--background-activated);color:var(--color-activated)}.button-inner.sc-ion-button-md{display:-ms-flexbox;display:flex;-ms-flex-flow:row nowrap;flex-flow:row nowrap;-ms-flex-negative:0;flex-shrink:0;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;width:100%;height:100%}.sc-ion-button-md-s > ion-icon{font-size:1.4em;pointer-events:none}.sc-ion-button-md-s > ion-icon[slot=start]{margin-left:-.3em;margin-right:.3em;margin-top:0;margin-bottom:0}@supports ((-webkit-margin-start:0) or (margin-inline-start:0)) or (-webkit-margin-start:0){.sc-ion-button-md-s > ion-icon[slot=start]{margin-left:unset;margin-right:unset;-webkit-margin-start:-.3em;margin-inline-start:-.3em;-webkit-margin-end:.3em;margin-inline-end:.3em}}.sc-ion-button-md-s > ion-icon[slot=end]{margin-left:.3em;margin-right:-.2em;margin-top:0;margin-bottom:0}@supports ((-webkit-margin-start:0) or (margin-inline-start:0)) or (-webkit-margin-start:0){.sc-ion-button-md-s > ion-icon[slot=end]{margin-left:unset;margin-right:unset;-webkit-margin-start:.3em;margin-inline-start:.3em;-webkit-margin-end:-.2em;margin-inline-end:-.2em}}.sc-ion-button-md-s > ion-icon[slot=icon-only]{font-size:1.8em}ion-ripple-effect.sc-ion-button-md{color:var(--ripple-color)}.sc-ion-button-md-h{--border-radius:4px;--padding-top:0;--padding-bottom:0;--padding-start:1.1em;--padding-end:1.1em;--transition:box-shadow 280ms cubic-bezier(.4,0,.2,1),background-color 15ms linear,color 15ms linear;margin-left:2px;margin-right:2px;margin-top:4px;margin-bottom:4px;height:36px;font-size:14px;font-weight:500;letter-spacing:.06em;text-transform:uppercase}@supports ((-webkit-margin-start:0) or (margin-inline-start:0)) or (-webkit-margin-start:0){.sc-ion-button-md-h{margin-left:unset;margin-right:unset;-webkit-margin-start:2px;margin-inline-start:2px;-webkit-margin-end:2px;margin-inline-end:2px}}.button-solid.sc-ion-button-md-h{--background-activated:var(--background);--box-shadow:0 3px 1px -2px rgba(0,0,0,0.2),0 2px 2px 0 rgba(0,0,0,0.14),0 1px 5px 0 rgba(0,0,0,0.12)}.button-solid.activated.sc-ion-button-md-h{--box-shadow:0 5px 5px -3px rgba(0,0,0,0.2),0 8px 10px 1px rgba(0,0,0,0.14),0 3px 14px 2px rgba(0,0,0,0.12)}.button-outline.sc-ion-button-md-h{--border-width:2px;--border-style:solid;--box-shadow:none;--background-activated:transparent;--background-focused:rgba(var(--ion-color-primary-rgb,56,128,255),0.1);--color-activated:var(--ion-color-primary,#3880ff)}.button-outline.activated.ion-color.sc-ion-button-md-h   .button-native.sc-ion-button-md{background:transparent}.button-clear.sc-ion-button-md-h{--opacity:1;--background-activated:transparent;--background-focused:rgba(var(--ion-color-primary-rgb,56,128,255),0.1);--color-activated:var(--ion-color-primary,#3880ff);--color-focused:var(--ion-color-primary,#3880ff)}.button-round.sc-ion-button-md-h{--border-radius:64px;--padding-top:0;--padding-start:26px;--padding-end:26px;--padding-bottom:0}.button-large.sc-ion-button-md-h{--padding-top:0;--padding-start:1em;--padding-end:1em;--padding-bottom:0;height:2.8em;font-size:20px}.button-small.sc-ion-button-md-h{--padding-top:0;--padding-start:0.9em;--padding-end:0.9em;--padding-bottom:0;height:2.1em;font-size:13px}.button-strong.sc-ion-button-md-h{font-weight:700}.sc-ion-button-md-s > ion-icon[slot=icon-only]{padding-left:0;padding-right:0;padding-top:0;padding-bottom:0}@media (any-hover:hover){.button-outline.sc-ion-button-md-h:hover   .button-native.sc-ion-button-md{background:rgba(var(--ion-color-primary-rgb,56,128,255),.04)}.button-outline.ion-color.sc-ion-button-md-h:hover   .button-native.sc-ion-button-md{background:rgba(var(--ion-color-base-rgb),.04)}.button-clear.sc-ion-button-md-h:hover   .button-native.sc-ion-button-md{background:rgba(var(--ion-color-primary-rgb,56,128,255),.04)}.button-clear.ion-color.sc-ion-button-md-h:hover   .button-native.sc-ion-button-md{background:rgba(var(--ion-color-base-rgb),.04)}}"},enumerable:!0,configurable:!0}),Object.defineProperty(t,"styleMode",{get:function(){return"md"},enumerable:!0,configurable:!0}),t}();function s(){if(!e){var t=window;t.Ionicons=t.Ionicons||{},e=t.Ionicons.map=t.Ionicons.map||new Map}return e}function l(t,n,o,e){return n="ios"===(n=(n||"md").toLowerCase())?"ios":"md",o&&"ios"===n?t=o.toLowerCase():e&&"md"===n?t=e.toLowerCase():t&&(t=t.toLowerCase(),/^md-|^ios-|^logo-/.test(t)||(t=n+"-"+t)),"string"!=typeof t||""===t.trim()||""!==t.replace(/[a-z]|-|\d/gi,"")?null:t}function u(t){return"string"==typeof t&&d(t=t.trim())?t:null}function d(t){return t.length>0&&/(\/|\.)/.test(t)}function b(t){if(1===t.nodeType){if("script"===t.nodeName.toLowerCase())return!1;for(var n=0;n<t.attributes.length;n++){var o=t.attributes[n].value;if("string"==typeof o&&0===o.toLowerCase().indexOf("on"))return!1}for(n=0;n<t.childNodes.length;n++)if(!b(t.childNodes[n]))return!1}return!0}var p=function(){function t(){this.isVisible=!1,this.lazy=!1}return t.prototype.componentWillLoad=function(){var t=this;this.waitUntilVisible(this.el,"50px",(function(){t.isVisible=!0,t.loadIcon()}))},t.prototype.componentDidUnload=function(){this.io&&(this.io.disconnect(),this.io=void 0)},t.prototype.waitUntilVisible=function(t,n,o){var e=this;if(this.lazy&&this.win&&this.win.IntersectionObserver){var i=this.io=new this.win.IntersectionObserver((function(t){t[0].isIntersecting&&(i.disconnect(),e.io=void 0,o())}),{rootMargin:n});i.observe(t)}else o()},t.prototype.loadIcon=function(){var t=this;if(!this.isServer&&this.isVisible){var n=this.getUrl();n?m(this.doc,n,"s-ion-icon").then((function(n){return t.svgContent=n})):console.error("icon was not resolved")}if(!this.ariaLabel){var o=l(this.getName(),this.mode,this.ios,this.md);o&&(this.ariaLabel=o.replace("ios-","").replace("md-","").replace(/\-/g," "))}},t.prototype.getName=function(){return void 0!==this.name?this.name:this.icon&&!d(this.icon)?this.icon:void 0},t.prototype.getUrl=function(){var t=u(this.src);return t||((t=l(this.getName(),this.mode,this.ios,this.md))?this.getNamedUrl(t):(t=u(this.icon))||null)},t.prototype.getNamedUrl=function(t){return s().get(t)||this.resourcesUrl+"svg/"+t+".svg"},t.prototype.hostData=function(){var t,n,o=this.mode||"md",e=this.flipRtl||this.ariaLabel&&this.ariaLabel.indexOf("arrow")>-1&&!1!==this.flipRtl;return{role:"img",class:Object.assign((t={},t[""+o]=!0,t),v(this.color),(n={},n["icon-"+this.size]=!!this.size,n["flip-rtl"]=e&&"rtl"===this.doc.dir,n))}},t.prototype.render=function(){return Object(i["b"])("div",!this.isServer&&this.svgContent?{class:"icon-inner",innerHTML:this.svgContent}:{class:"icon-inner"})},Object.defineProperty(t,"is",{get:function(){return"ion-icon"},enumerable:!0,configurable:!0}),Object.defineProperty(t,"encapsulation",{get:function(){return"shadow"},enumerable:!0,configurable:!0}),Object.defineProperty(t,"properties",{get:function(){return{ariaLabel:{type:String,attr:"aria-label",reflectToAttr:!0,mutable:!0},color:{type:String,attr:"color"},doc:{context:"document"},el:{elementRef:!0},flipRtl:{type:Boolean,attr:"flip-rtl"},icon:{type:String,attr:"icon",watchCallbacks:["loadIcon"]},ios:{type:String,attr:"ios"},isServer:{context:"isServer"},isVisible:{state:!0},lazy:{type:Boolean,attr:"lazy"},md:{type:String,attr:"md"},mode:{type:String,attr:"mode"},name:{type:String,attr:"name",watchCallbacks:["loadIcon"]},resourcesUrl:{context:"resourcesUrl"},size:{type:String,attr:"size"},src:{type:String,attr:"src",watchCallbacks:["loadIcon"]},svgContent:{state:!0},win:{context:"window"}}},enumerable:!0,configurable:!0}),Object.defineProperty(t,"style",{get:function(){return".sc-ion-icon-h{display:inline-block;width:1em;height:1em;contain:strict;fill:currentColor;-webkit-box-sizing:content-box!important;box-sizing:content-box!important}.icon-inner.sc-ion-icon, svg.sc-ion-icon{display:block;height:100%;width:100%}.flip-rtl.sc-ion-icon-h   .icon-inner.sc-ion-icon{-webkit-transform:scaleX(-1);transform:scaleX(-1)}.icon-small.sc-ion-icon-h{font-size:18px!important}.icon-large.sc-ion-icon-h{font-size:32px!important}.ion-color.sc-ion-icon-h{color:var(--ion-color-base)!important}.ion-color-primary.sc-ion-icon-h{--ion-color-base:var(--ion-color-primary,#3880ff)}.ion-color-secondary.sc-ion-icon-h{--ion-color-base:var(--ion-color-secondary,#0cd1e8)}.ion-color-tertiary.sc-ion-icon-h{--ion-color-base:var(--ion-color-tertiary,#f4a942)}.ion-color-success.sc-ion-icon-h{--ion-color-base:var(--ion-color-success,#10dc60)}.ion-color-warning.sc-ion-icon-h{--ion-color-base:var(--ion-color-warning,#ffce00)}.ion-color-danger.sc-ion-icon-h{--ion-color-base:var(--ion-color-danger,#f14141)}.ion-color-light.sc-ion-icon-h{--ion-color-base:var(--ion-color-light,#f4f5f8)}.ion-color-medium.sc-ion-icon-h{--ion-color-base:var(--ion-color-medium,#989aa2)}.ion-color-dark.sc-ion-icon-h{--ion-color-base:var(--ion-color-dark,#222428)}"},enumerable:!0,configurable:!0}),t}(),f=new Map;function m(t,n,o){var e=f.get(n);return e||(e=fetch(n,{cache:"force-cache"}).then((function(t){return h(t.status)?t.text():Promise.resolve(null)})).then((function(n){return g(t,n,o)})),f.set(n,e)),e}function h(t){return t<=299}function g(t,n,o){if(n){var e=t.createDocumentFragment(),i=t.createElement("div");i.innerHTML=n,e.appendChild(i);for(var r=i.childNodes.length-1;r>=0;r--)"svg"!==i.childNodes[r].nodeName.toLowerCase()&&i.removeChild(i.childNodes[r]);var a=i.firstElementChild;if(a&&"svg"===a.nodeName.toLowerCase()&&(o&&a.setAttribute("class",o),b(a)))return i.innerHTML}return""}function v(t){var n;return t?((n={"ion-color":!0})["ion-color-"+t]=!0,n):null}},"77a5":function(t,n,o){"use strict";o.d(n,"a",(function(){return c})),o.d(n,"b",(function(){return l})),o.d(n,"c",(function(){return r})),o.d(n,"d",(function(){return i}));var e=o("0790");function i(t,n){return null!==n.closest(t)}function r(t){var n;return"string"==typeof t&&t.length>0?((n={"ion-color":!0})["ion-color-"+t]=!0,n):void 0}function a(t){return void 0!==t?(Array.isArray(t)?t:t.split(" ")).filter((function(t){return null!=t})).map((function(t){return t.trim()})).filter((function(t){return""!==t})):[]}function c(t){var n={};return a(t).forEach((function(t){return n[t]=!0})),n}var s=/^[a-z][a-z0-9+\-.]*:/;function l(t,n,o,i){return e["a"](this,void 0,void 0,(function(){var r;return e["c"](this,(function(e){switch(e.label){case 0:return null==n||"#"===n[0]||s.test(n)?[3,2]:(r=t.document.querySelector("ion-router"))?(null!=o&&o.preventDefault(),[4,r.componentOnReady()]):[3,2];case 1:return e.sent(),[2,r.push(n,i)];case 2:return[2,!1]}}))}))}}}]);
//# sourceMappingURL=chunk-0f88c136.5f9f44eb.js.map