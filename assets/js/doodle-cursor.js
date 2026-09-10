(function(){
  'use strict';
  var canDoodle = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!canDoodle) return;

  var cursor = document.getElementById('doodleCursor');
  var ring = document.getElementById('doodleRing');
  if(!cursor || !ring) return;

  document.body.classList.add('doodle-cursor-on');

  var mx = -100, my = -100;   // cursor icon target
  var rx = -100, ry = -100;   // ring position, eased toward mx/my
  var revealed = false;
  var raf = null;

  function setCursorTransform(){
    cursor.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
  }
  function tick(){
    rx += (mx - rx) * 0.22;
    ry += (my - ry) * 0.22;
    var squash = ring.classList.contains('click') ? ' scale(0.82)' : '';
    ring.style.transform = 'translate(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px)' + squash;
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);

  document.addEventListener('mousemove', function(e){
    mx = e.clientX; my = e.clientY;
    if(!revealed){
      revealed = true;
      cursor.classList.remove('hide');
      ring.classList.remove('hide');
      rx = mx; ry = my;
    }
    setCursorTransform();
  }, { passive:true });

  document.addEventListener('mouseleave', function(){
    cursor.classList.add('hide');
    ring.classList.add('hide');
  });
  document.addEventListener('mouseenter', function(){
    if(revealed){ cursor.classList.remove('hide'); ring.classList.remove('hide'); }
  });

  /* Hover states: dashed ring over clickable things, thin caret over text fields */
  var pointerSelector = 'a, button, [role="button"], .btn, summary, select, label[for], input[type="submit"], input[type="checkbox"], input[type="radio"]';
  var textSelector = 'input:not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]';
  document.addEventListener('mouseover', function(e){
    var textEl = e.target.closest(textSelector);
    var pointerEl = !textEl && e.target.closest(pointerSelector);
    ring.classList.toggle('text', !!textEl);
    ring.classList.toggle('pointer', !!pointerEl);
    cursor.classList.toggle('active', !!(textEl || pointerEl));
  }, { passive:true });

  /* Click feedback: ring squash + a little hand-drawn scribble burst */
  var scribbles = [];
  var POOL_SIZE = 4;
  for(var i = 0; i < POOL_SIZE; i++){
    var s = document.createElement('div');
    s.className = 'doodle-scribble';
    s.innerHTML = '<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M4 16 Q10 3 15 16 T27 14" fill="none" stroke="#B6F500" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M16 3 Q21 9 16 16 Q10 22 17 27" fill="none" stroke="#B6F500" stroke-width="2" stroke-linecap="round" opacity="0.75"/>' +
      '</svg>';
    document.body.appendChild(s);
    scribbles.push(s);
  }
  var poolIndex = 0;
  document.addEventListener('mousedown', function(e){
    ring.classList.add('click');
    cursor.classList.add('active');
    var el = scribbles[poolIndex];
    poolIndex = (poolIndex + 1) % POOL_SIZE;
    el.style.setProperty('--dx', e.clientX + 'px');
    el.style.setProperty('--dy', e.clientY + 'px');
    el.classList.remove('pop');
    void el.offsetWidth; // restart the CSS animation
    el.classList.add('pop');
  });
  document.addEventListener('mouseup', function(e){
    ring.classList.remove('click');
    var textEl = e.target.closest(textSelector);
    var pointerEl = !textEl && e.target.closest(pointerSelector);
    cursor.classList.toggle('active', !!(textEl || pointerEl));
  });

  /* If the layout ever flips to a touch/coarse-pointer context (devtools, hybrid
     laptops), bail out cleanly instead of leaving a dead cursor on screen. */
  window.matchMedia('(hover: hover) and (pointer: fine)').addEventListener('change', function(e){
    if(!e.matches){
      cancelAnimationFrame(raf);
      document.body.classList.remove('doodle-cursor-on');
      cursor.classList.add('hide');
      ring.classList.add('hide');
    }
  });
})();
