import{F as s,S as t,i as e,s as a,e as c,c as l,b as n,g as o,m as i,h as r,v as u,t as d,d as p,j as h,G as f,C as m,H as v,n as k,a as b,f as y,r as E,I as j,B as x,J as I}from"./client.05ee8443.js";function g(t,{delay:e=0,duration:a=400,easing:c=s}={}){const l=+getComputedStyle(t).opacity;return{delay:e,duration:a,easing:c,css:s=>"opacity: "+s*l}}function A(s){let t,e=s[2]&&C(s);return{c(){t=c("div"),e&&e.c(),this.h()},l(s){t=l(s,"DIV",{class:!0});var a=n(t);e&&e.l(a),a.forEach(o),this.h()},h(){i(t,"class","textHolder svelte-spbkjm")},m(s,a){r(s,t,a),e&&e.m(t,null)},p(s,a){s[2]?e?(e.p(s,a),4&a&&u(e,1)):(e=C(s),e.c(),u(e,1),e.m(t,null)):e&&(e.d(1),e=null)},i(s){u(e)},o:k,d(s){s&&o(t),e&&e.d()}}}function C(s){let t,e,a;return{c(){t=c("p"),e=d(s[2]),this.h()},l(a){t=l(a,"P",{class:!0});var c=n(t);e=p(c,s[2]),c.forEach(o),this.h()},h(){i(t,"class","svelte-spbkjm")},m(s,a){r(s,t,a),h(t,e)},p(s,t){4&t&&f(e,s[2])},i(s){a||m(()=>{a=v(t,g,{}),a.start()})},o:k,d(s){s&&o(t)}}}function D(s){let t,e,a,m,v,j,x,I,g=s[0].toLocaleUpperCase()+"",C=s[1]&&A(s);return{c(){t=c("div"),e=c("div"),a=c("div"),m=c("h6"),v=d(g),j=b(),C&&C.c(),this.h()},l(s){t=l(s,"DIV",{class:!0});var c=n(t);e=l(c,"DIV",{class:!0});var i=n(e);a=l(i,"DIV",{class:!0});var r=n(a);m=l(r,"H6",{class:!0});var u=n(m);v=p(u,g),u.forEach(o),r.forEach(o),i.forEach(o),j=y(c),C&&C.l(c),c.forEach(o),this.h()},h(){i(m,"class","robotic noselect svelte-spbkjm"),i(a,"class","svelte-spbkjm"),i(e,"class","button svelte-spbkjm"),i(t,"class","parent svelte-spbkjm")},m(c,l){r(c,t,l),h(t,e),h(e,a),h(a,m),h(m,v),h(t,j),C&&C.m(t,null),x||(I=E(e,"click",s[3]),x=!0)},p(s,[e]){1&e&&g!==(g=s[0].toLocaleUpperCase()+"")&&f(v,g),s[1]?C?(C.p(s,e),2&e&&u(C,1)):(C=A(s),C.c(),u(C,1),C.m(t,null)):C&&(C.d(1),C=null)},i(s){u(C)},o:k,d(s){s&&o(t),C&&C.d(),x=!1,I()}}}function L(s,t,e){let a=j();let c,{text:l}=t,{defaultAction:n=!1}=t;function o(s){"Enter"===s.key&&a("click")}return x(()=>{n&&(document.addEventListener("keypress",o),setTimeout(()=>{e(2,c="(enter)")},1e4))}),I(()=>{"undefined"!=typeof document&&document.removeEventListener("keypress",o)}),s.$$set=s=>{"text"in s&&e(0,l=s.text),"defaultAction"in s&&e(1,n=s.defaultAction)},[l,n,c,function(){a("click")}]}class V extends t{constructor(s){super(),e(this,s,L,D,a,{text:0,defaultAction:1})}}export{V as R,g as f};