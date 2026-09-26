/* Motor de animación determinístico.
   No usa requestAnimationFrame: el renderer llama a window.seek(t) por cada cuadro,
   así el video sale idéntico cuadro a cuadro sin importar la velocidad de la máquina. */
(function () {
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  var ease = {
    lineal: function (t) { return t; },
    salida: function (t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); },        // easeOutExpo
    suave:  function (t) { return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2; }, // easeInOutCubic
    rebote: function (t) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3*Math.pow(t-1,3) + c1*Math.pow(t-1,2); }
  };

  var escenas = [];

  function preparar() {
    var t0 = 0;
    [].forEach.call(document.querySelectorAll('.scene'), function (el) {
      var dur = parseFloat(el.dataset.dur || '3');
      var e = { el: el, ini: t0, dur: dur, elems: [] };
      t0 += dur;
      [].forEach.call(el.querySelectorAll('[data-anim]'), function (n) {
        e.elems.push({
          n: n,
          tipo: n.dataset.anim,
          at: parseFloat(n.dataset.at || '0'),
          dur: parseFloat(n.dataset.d || '0.6'),
          dist: parseFloat(n.dataset.dist || '52')
        });
      });
      escenas.push(e);
    });
    window.DURACION = t0;
  }

  function aplicar(a, p) {
    var n = a.n, o;
    switch (a.tipo) {
      case 'sube':
        o = ease.salida(p);
        n.style.opacity = clamp(p * 1.7, 0, 1);
        n.style.transform = 'translate3d(0,' + ((1 - o) * a.dist).toFixed(2) + 'px,0)';
        break;
      case 'pop':
        o = ease.rebote(p);
        n.style.opacity = clamp(p * 2.2, 0, 1);
        n.style.transform = 'scale(' + (0.84 + 0.16 * o).toFixed(4) + ')';
        break;
      case 'fade':
        n.style.opacity = ease.suave(p).toFixed(3);
        break;
      case 'barra': // pinta el resaltador naranja detrás de una palabra
        n.style.transform = 'scaleX(' + ease.salida(p).toFixed(4) + ')';
        break;
      case 'regla': // regla vertical que baja
        n.style.transform = 'scaleY(' + ease.salida(p).toFixed(4) + ')';
        break;
      case 'linea': // revelado por línea con máscara
        o = ease.salida(p);
        n.style.transform = 'translate3d(0,' + ((1 - o) * 118).toFixed(2) + '%,0)';
        n.style.opacity = clamp(p * 3, 0, 1);
        break;
      case 'deriva': // respiración lenta del fondo, nunca queda estático
        n.style.transform = 'scale(' + (1 + 0.05 * p).toFixed(4) + ')';
        break;
    }
  }

  window.seek = function (t) {
    var i, e, act = null;
    for (i = 0; i < escenas.length; i++) {
      e = escenas[i];
      var dentro = t >= e.ini && (t < e.ini + e.dur || (i === escenas.length - 1 && t >= e.ini));
      e.el.classList.toggle('on', dentro);
      if (dentro) act = e;
    }
    if (!act) return;
    var lt = t - act.ini;
    for (i = 0; i < act.elems.length; i++) {
      var a = act.elems[i];
      var p = a.dur <= 0 ? 1 : clamp((lt - a.at) / a.dur, 0, 1);
      aplicar(a, p);
    }
    var bg = act.el.querySelector('.bg');
    if (bg) aplicar({ n: bg, tipo: 'deriva' }, clamp(lt / act.dur, 0, 1));

    var pr = document.querySelector('#prog i');
    if (pr) pr.style.transform = 'scaleX(' + clamp(t / window.DURACION, 0, 1).toFixed(4) + ')';
    var pw = document.querySelector('#prog');
    if (pw) pw.classList.toggle('dim', /on-light/.test(act.el.className));
  };

  preparar();
  window.seek(0);
  window.LISTO = true;
})();
