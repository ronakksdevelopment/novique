(function(){
  'use strict';

  /* ---------- Path helper: resolve a root-relative path from any page depth ---------- */
  function resolveRoot(path){
    var isSubPage = document.body.getAttribute('data-page') !== 'home' &&
      window.location.pathname.indexOf('/pages/') !== -1;
    return isSubPage ? '../' + path : path;
  }

  /* ---------- Loader ---------- */
  window.addEventListener('load', function(){
    var loader = document.getElementById('loader');
    setTimeout(function(){ loader.classList.add('hidden'); }, 400);
  });

  /* ---------- Hero 3D scene (Spline) with graceful fallback ---------- */
  (function initHero3D(){
    var wrap = document.querySelector('.hero-3d');
    if(!wrap) return;
    var viewer = document.getElementById('heroSpline');
    var fallback = document.getElementById('hero3dFallback');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isNarrow = window.matchMedia('(max-width: 640px)').matches;

    function showFallback(){
      if(viewer) viewer.style.display = 'none';
      if(fallback) fallback.style.display = 'flex';
    }

    if(reduceMotion || isNarrow || !viewer){
      showFallback();
      return;
    }

    // Give the custom element a limited window to register + load;
    // if @splinetool/viewer fails to fetch (network restrictions, ad-blockers, etc.)
    // fall back to the CSS orb scene instead of leaving an empty box.
    var settled = false;
    var failTimer = setTimeout(function(){
      if(!settled){ settled = true; showFallback(); }
    }, 6000);

    viewer.addEventListener('load', function(){
      if(settled) return;
      settled = true;
      clearTimeout(failTimer);
      viewer.classList.add('spline-ready');
    });
    viewer.addEventListener('error', function(){
      if(settled) return;
      settled = true;
      clearTimeout(failTimer);
      showFallback();
    });

    // If the custom element never upgrades (script blocked/unavailable), catch that too.
    customElements.whenDefined('spline-viewer').catch(function(){
      if(!settled){ settled = true; clearTimeout(failTimer); showFallback(); }
    });
  })();

  /* ---------- Navbar scroll state ---------- */
  var navbar = document.getElementById('navbar');
  var backToTop = document.getElementById('backToTop');
  function onScroll(){
    var y = window.scrollY || document.documentElement.scrollTop;
    if(y > 40){ navbar.classList.add('scrolled'); } else { navbar.classList.remove('scrolled'); }
    if(y > 600){ backToTop.classList.add('show'); } else { backToTop.classList.remove('show'); }
  }
  document.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
  backToTop.addEventListener('click', function(){ window.scrollTo({ top:0, behavior:'smooth' }); });

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', function(){
    var isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  navLinks.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click', function(){
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal, .reveal-scale');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function(el){
      if(!el.classList.contains('in-view')) io.observe(el);
    });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in-view'); });
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('.counter');
  function animateCounter(el){
    var target = parseFloat(el.getAttribute('data-target'));
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1800;
    var start = null;
    function step(ts){
      if(!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.floor(eased * target);
      el.textContent = value + suffix;
      if(progress < 1){ requestAnimationFrame(step); } else { el.textContent = target + suffix; }
    }
    requestAnimationFrame(step);
  }
  if('IntersectionObserver' in window){
    var counterIo = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          animateCounter(entry.target);
          counterIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function(c){ counterIo.observe(c); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- Icon pop-in animation on scroll for service and value icons ---------- */
  var iconTargets = document.querySelectorAll('.service-icon, .about-value i, .contact-detail i');
  if('IntersectionObserver' in window){
    var iconIo = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('icon-anim');
          iconIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    iconTargets.forEach(function(el){ iconIo.observe(el); });
  }

  /* ---------- Service card mouse position (no glow, used for subtle border only) ---------- */
  document.querySelectorAll('.service-card').forEach(function(card){
    card.addEventListener('mousemove', function(e){
      var rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
  });

  /* ---------- Portfolio filter ---------- */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var projectCards = document.querySelectorAll('.project-card');
  filterBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      filterBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.getAttribute('data-filter');
      projectCards.forEach(function(card){
        var cat = card.getAttribute('data-category');
        if(filter === 'all' || cat === filter){
          card.classList.remove('hide');
        } else {
          card.classList.add('hide');
        }
      });
    });
  });

  /* ---------- Case study accordion ---------- */
  document.querySelectorAll('[data-case-toggle]').forEach(function(head){
    head.addEventListener('click', function(){
      var item = head.closest('.case-item');
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.case-item.open').forEach(function(el){ el.classList.remove('open'); });
      if(!wasOpen){ item.classList.add('open'); }
    });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('[data-faq-toggle]').forEach(function(q){
    q.addEventListener('click', function(){
      var item = q.closest('.faq-item');
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(el){ el.classList.remove('open'); });
      if(!wasOpen){ item.classList.add('open'); }
    });
  });

  /* ---------- Testimonial carousel ---------- */
  var track = document.getElementById('testiTrack');
  var slides = track ? track.children : [];
  var dotsWrap = document.getElementById('testiDots');
  var current = 0;
  var autoTimer;

  if(track && slides.length){
    for(var i=0; i<slides.length; i++){
      var dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Go to testimonial ' + (i+1));
      if(i===0) dot.classList.add('active');
      (function(idx){
        dot.addEventListener('click', function(){ goToSlide(idx); resetAuto(); });
      })(i);
      dotsWrap.appendChild(dot);
    }

    function goToSlide(idx){
      current = (idx + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dotsWrap.querySelectorAll('button').forEach(function(d, di){
        d.classList.toggle('active', di === current);
      });
    }
    function resetAuto(){
      clearInterval(autoTimer);
      autoTimer = setInterval(function(){ goToSlide(current+1); }, 6000);
    }
    document.getElementById('testiPrev').addEventListener('click', function(){ goToSlide(current-1); resetAuto(); });
    document.getElementById('testiNext').addEventListener('click', function(){ goToSlide(current+1); resetAuto(); });
    resetAuto();
  }

  /* ---------- Contact form ---------- */
  var contactForm = document.getElementById('contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      var successBox = document.getElementById('formSuccess');
      successBox.classList.add('show');
      contactForm.reset();
      resetCustomSelect('fserviceSelect', 'fserviceInput', 'Website Design');
      resetCustomSelect('fbudgetSelect', 'fbudgetInput', 'Under $3,000');
      successBox.scrollIntoView({ behavior:'smooth', block:'nearest' });
    });
  }

  function resetCustomSelect(wrapId, inputId, defaultValue){
    var wrap = document.getElementById(wrapId);
    if(!wrap) return;
    var trigger = wrap.querySelector('.cselect-trigger .cselect-value');
    var input = document.getElementById(inputId);
    var options = wrap.querySelectorAll('.cselect-option');
    trigger.textContent = defaultValue;
    input.value = defaultValue;
    options.forEach(function(opt){
      var isMatch = opt.getAttribute('data-value') === defaultValue;
      opt.classList.toggle('active', isMatch);
      opt.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });
  }

  /* ---------- Newsletter form ---------- */
  var newsletterForm = document.getElementById('newsletterForm');
  if(newsletterForm){
    newsletterForm.addEventListener('submit', function(e){
      e.preventDefault();
      var btn = newsletterForm.querySelector('button');
      var original = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Subscribed';
      newsletterForm.reset();
      setTimeout(function(){ btn.innerHTML = original; }, 2600);
    });
  }

  /* ---------- Custom themed dropdowns (black / green / white) replacing native <select> ---------- */
  var allCselects = document.querySelectorAll('.cselect');
  allCselects.forEach(function(wrap){
    var trigger = wrap.querySelector('.cselect-trigger');
    var valueEl = wrap.querySelector('.cselect-value');
    var panel = wrap.querySelector('.cselect-panel');
    var hiddenInput = wrap.querySelector('input[type="hidden"]');
    var options = wrap.querySelectorAll('.cselect-option');

    function closeThis(){
      wrap.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }
    function openThis(){
      allCselects.forEach(function(w){ if(w !== wrap){ w.classList.remove('open'); w.querySelector('.cselect-trigger').setAttribute('aria-expanded','false'); } });
      wrap.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    trigger.addEventListener('click', function(e){
      e.stopPropagation();
      if(wrap.classList.contains('open')){ closeThis(); } else { openThis(); }
    });

    options.forEach(function(opt){
      opt.addEventListener('click', function(){
        var val = opt.getAttribute('data-value');
        valueEl.textContent = val;
        if(hiddenInput) hiddenInput.value = val;
        options.forEach(function(o){ o.classList.remove('active'); o.setAttribute('aria-selected','false'); });
        opt.classList.add('active');
        opt.setAttribute('aria-selected', 'true');
        closeThis();
      });
    });
  });
  document.addEventListener('click', function(e){
    allCselects.forEach(function(w){
      if(!w.contains(e.target)){
        w.classList.remove('open');
        w.querySelector('.cselect-trigger').setAttribute('aria-expanded','false');
      }
    });
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      allCselects.forEach(function(w){
        w.classList.remove('open');
        w.querySelector('.cselect-trigger').setAttribute('aria-expanded','false');
      });
    }
  });

  /* ---------- Custom right-click context menu (replaces browser default entirely) ---------- */
  var ccm = document.getElementById('customContextMenu');
  var ccmToast = document.getElementById('ccmToast');
  var ccmToastText = document.getElementById('ccmToastText');
  var toastTimer;

  function showToast(msg){
    ccmToastText.textContent = msg;
    ccmToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ ccmToast.classList.remove('show'); }, 2200);
  }

  function positionMenu(x, y){
    var menuWidth = ccm.offsetWidth || 230;
    var menuHeight = ccm.offsetHeight || 320;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var left = x;
    var top = y;
    if(left + menuWidth > vw - 12){ left = vw - menuWidth - 12; }
    if(top + menuHeight > vh - 12){ top = vh - menuHeight - 12; }
    if(left < 12) left = 12;
    if(top < 12) top = 12;
    ccm.style.left = left + 'px';
    ccm.style.top = top + 'px';
  }

  function openMenu(x, y){
    ccm.classList.add('show');
    ccm.setAttribute('aria-hidden', 'false');
    positionMenu(x, y);
  }
  function closeMenu(){
    ccm.classList.remove('show');
    ccm.setAttribute('aria-hidden', 'true');
  }

  document.addEventListener('contextmenu', function(e){
    e.preventDefault();
    openMenu(e.clientX, e.clientY);
  });

  document.addEventListener('click', function(e){
    if(!ccm.contains(e.target)){ closeMenu(); }
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){ closeMenu(); }
  });
  window.addEventListener('scroll', function(){ closeMenu(); }, { passive:true });
  window.addEventListener('resize', function(){ closeMenu(); });

  /* long-press support for touch devices */
  var pressTimer, pressStartX, pressStartY;
  document.addEventListener('touchstart', function(e){
    if(e.touches.length !== 1) return;
    var t = e.touches[0];
    pressStartX = t.clientX; pressStartY = t.clientY;
    pressTimer = setTimeout(function(){
      openMenu(pressStartX, pressStartY);
    }, 550);
  }, { passive:true });
  document.addEventListener('touchmove', function(){ clearTimeout(pressTimer); }, { passive:true });
  document.addEventListener('touchend', function(){ clearTimeout(pressTimer); }, { passive:true });

  ccm.addEventListener('click', function(e){
    var item = e.target.closest('.ccm-item');
    if(!item) return;
    var action = item.getAttribute('data-action');
    switch(action){
      case 'home':
        window.location.href = (document.body.getAttribute('data-page') === 'home') ? '#main' : resolveRoot('index.html');
        if(document.body.getAttribute('data-page') === 'home'){ document.getElementById('main').scrollIntoView({ behavior:'smooth' }); }
        break;
      case 'portfolio':
        window.location.href = resolveRoot('pages/portfolio.html');
        break;
      case 'contact':
        window.location.href = resolveRoot('pages/contact.html');
        break;
      case 'copy-link':
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(window.location.href).then(function(){
            showToast('Link copied to clipboard');
          }).catch(function(){
            showToast('Could not copy link');
          });
        } else {
          showToast('Copy not supported here');
        }
        break;
      case 'reload':
        showToast('Reloading...');
        setTimeout(function(){ window.location.reload(); }, 300);
        break;
      case 'top':
        window.scrollTo({ top:0, behavior:'smooth' });
        break;
    }
    closeMenu();
  });

})();
