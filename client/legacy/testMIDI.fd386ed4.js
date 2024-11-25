import{_ as t,a as n,b as s,c as a,i as e,d as o,S as i,s as r,U as c,e as f,t as u,f as l,p as d,g as h,h as m,j as p,l as v,k as y,q as g,r as $,m as b,n as k,w,y as I,B as j,P as D,A as E,D as C,F as H,G as x,O as P,Q as R,V as T,J as V,o as M}from"./client.984d516d.js";import{L as B}from"./Loader.f77e2efb.js";import{P as G,n as O}from"./instrument.81572a0c.js";import{b as S,n as K}from"./notes.be99bc8d.js";import{s as L,i as N}from"./storage.4617e2a9.js";import"./webmidi.min.fa3830d4.js";function q(t){var a=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(t){return!1}}();return function(){var e,o=n(t);if(a){var i=n(this).constructor;e=Reflect.construct(o,arguments,i)}else e=o.apply(this,arguments);return s(this,e)}}function A(t){var n,s,a,e,o;return{c:function(){n=f("div"),s=f("h3"),a=u("Setup complete"),e=l(),o=f("img"),this.h()},l:function(t){n=h(t,"DIV",{class:!0});var i=m(n);s=h(i,"H3",{});var r=m(s);a=p(r,"Setup complete"),r.forEach(v),e=y(i),o=h(i,"IMG",{src:!0,alt:!0}),i.forEach(v),this.h()},h:function(){o.src!=="/Tick.png"&&$(o,"src","/Tick.png"),$(o,"alt","tick"),$(n,"class","titleHolder svelte-18khiw")},m:function(t,i){b(t,n,i),k(n,s),k(s,a),k(n,e),k(n,o)},i:M,o:M,d:function(t){t&&v(n)}}}function F(t){var n,s,a,e,o,i;return o=new B({props:{text:"Waiting for middle C"}}),{c:function(){n=f("div"),s=f("h3"),a=u("Play middle C on your MIDI keyboard to test the connection"),e=l(),d(o.$$.fragment),this.h()},l:function(t){n=h(t,"DIV",{class:!0});var i=m(n);s=h(i,"H3",{});var r=m(s);a=p(r,"Play middle C on your MIDI keyboard to test the connection"),r.forEach(v),e=y(i),g(o.$$.fragment,i),i.forEach(v),this.h()},h:function(){$(n,"class","titleHolder svelte-18khiw")},m:function(t,r){b(t,n,r),k(n,s),k(s,a),k(n,e),w(o,n,null),i=!0},i:function(t){i||(E(o.$$.fragment,t),i=!0)},o:function(t){j(o.$$.fragment,t),i=!1},d:function(t){t&&v(n),C(o)}}}function J(t){var n,s,a,e,o,i,r,H,x,P,T=[F,A],V=[];function M(t,n){return t[1]?1:0}return o=M(t),i=V[o]=T[o](t),(x=new G({props:{lessonNotes:new Map([[S("C",4),"expecting"]]),keys:K(S("G",3),S("C",5)),instrument:t[0],sandbox:!0,midiOnly:!0}})).$on("playingNotes",(function(){c(t[2])&&t[2].apply(this,arguments)})),{c:function(){n=f("div"),s=f("h2"),a=u("Test Keyboard"),e=l(),i.c(),r=l(),H=f("div"),d(x.$$.fragment),this.h()},l:function(t){n=h(t,"DIV",{class:!0});var o=m(n);s=h(o,"H2",{});var c=m(s);a=p(c,"Test Keyboard"),c.forEach(v),e=y(o),i.l(o),r=y(o),H=h(o,"DIV",{class:!0});var f=m(H);g(x.$$.fragment,f),f.forEach(v),o.forEach(v),this.h()},h:function(){$(H,"class","pianoHolder svelte-18khiw"),$(n,"class","vert svelte-18khiw")},m:function(t,i){b(t,n,i),k(n,s),k(s,a),k(n,e),V[o].m(n,null),k(n,r),k(n,H),w(x,H,null),P=!0},p:function(s,a){var e=I(a,1)[0],c=o;(o=M(t=s))!==c&&(R(),j(V[c],1,1,(function(){V[c]=null})),D(),(i=V[o])||(i=V[o]=T[o](t)).c(),E(i,1),i.m(n,r));var f={};1&e&&(f.instrument=t[0]),x.$set(f)},i:function(t){P||(E(i),E(x.$$.fragment,t),P=!0)},o:function(t){j(i),j(x.$$.fragment,t),P=!1},d:function(t){t&&v(n),V[o].d(),C(x)}}}function Q(t,n,s){var a,e=H().session;x((function(){s(0,a=O("tester",(function(){console.log("piano loaded")})))}));var o=!1,i=function(t){o||t.detail.includes(S("C",4))&&(s(1,o=!0),L(N.midi),setTimeout((function(){var t=T(e);t&&void 0!==t.redirect?(e.set({}),V(t.redirect)):V("/settings")}),500))};return P((function(){s(2,i=function(){})})),[a,o,i]}var U=function(n){t(c,i);var s=q(c);function c(t){var n;return a(this,c),n=s.call(this),e(o(n),t,Q,J,r,{}),n}return c}();export default U;
