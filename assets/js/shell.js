(function(){
  'use strict';

  /* ---------- Service worker registration (installable + offline) ---------- */
  // sw.js lives at the site root, so it must always be registered with a
  // root-relative URL (and root scope) — a plain 'sw.js' resolves against
  // the *current page*, which is wrong for anything under /pages/ and
  // would give the worker a scope too narrow to control the whole site.
  if('serviceWorker' in navigator){
    window.addEventListener('load', function(){
      var isSubPage = document.body.getAttribute('data-page') !== 'home' &&
        window.location.pathname.indexOf('/pages/') !== -1;
      var swUrl = isSubPage ? '../sw.js' : 'sw.js';
      navigator.serviceWorker.register(swUrl, { scope: isSubPage ? '../' : './' }).catch(function(err){
        console.warn('[NoviQue] Service worker registration failed:', err);
      });
    });
  }

  /* ---------- Active nav / tab highlighting ---------- */
  // Every page sets <body data-page="home|services|portfolio|..."> so the
  // shell can mark the matching top-nav link and bottom-tab item active
  // without any page needing to hardcode "active" classes itself.
  var currentPage = document.body.getAttribute('data-page') || 'home';
  document.querySelectorAll('[data-nav-page]').forEach(function(el){
    if(el.getAttribute('data-nav-page') === currentPage){
      el.classList.add('active');
    }
  });

  /* ---------- Currency switcher (INR default, optional USD approx) ---------- */
  // Usage in markup:
  //   <span class="price-amount"><b data-price-inr="8000">₹8,000</b><span>/ project</span>
  //     <span class="fx-approx" data-fx-for="8000"></span></span>
  // Any element with [data-price-inr] gets its text swapped between the
  // INR figure and an approximate USD figure; elements with [data-fx-for]
  // show the "not shown" currency as a small approx note underneath.
  var CURRENCY_KEY = 'novique_currency'; // 'INR' | 'USD'
  var INR_PER_USD = 87; // approximate, for display only — see note in UI
  function getCurrency(){
    try { return localStorage.getItem(CURRENCY_KEY) || 'INR'; } catch(e){ return 'INR'; }
  }
  function setCurrency(cur){
    try { localStorage.setItem(CURRENCY_KEY, cur); } catch(e){}
  }
  function formatINR(n){ return '₹' + Number(n).toLocaleString('en-IN'); }
  function formatUSD(n){ return '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 }); }

  function applyCurrency(){
    var cur = getCurrency();
    document.querySelectorAll('.currency-toggle button').forEach(function(btn){
      btn.classList.toggle('active', btn.getAttribute('data-currency') === cur);
    });
    document.querySelectorAll('[data-price-inr]').forEach(function(el){
      var inr = parseFloat(el.getAttribute('data-price-inr'));
      if(isNaN(inr)) return;
      if(cur === 'USD'){
        el.textContent = formatUSD(inr / INR_PER_USD) + '*';
      } else {
        el.textContent = formatINR(inr);
      }
    });
    document.querySelectorAll('[data-fx-for]').forEach(function(el){
      var inr = parseFloat(el.getAttribute('data-fx-for'));
      if(isNaN(inr)) return;
      if(cur === 'USD'){
        el.textContent = 'approx. ' + formatINR(inr);
      } else {
        el.textContent = 'approx. ' + formatUSD(inr / INR_PER_USD);
      }
      el.style.display = '';
    });
  }

  document.querySelectorAll('.currency-toggle button').forEach(function(btn){
    btn.addEventListener('click', function(){
      setCurrency(btn.getAttribute('data-currency'));
      applyCurrency();
    });
  });
  applyCurrency();

  /* ---------- PWA install prompt (cross-platform) ----------
     beforeinstallprompt only ever fires on Chromium browsers
     (Chrome/Edge/Samsung Internet/Brave) on Android + desktop.
     Safari (iOS/iPadOS/macOS) and Firefox never fire it, so without
     a manual fallback those users never see any install path at all.
     This block detects platform/browser and always shows the right
     instructions, everywhere. */
  var deferredInstallPrompt = null;
  var banner = document.getElementById('installBanner');
  var installBtn = document.getElementById('installBannerInstall');
  var dismissBtn = document.getElementById('installBannerDismiss');
  var DISMISS_KEY = 'novique_install_dismissed';

  var ua = window.navigator.userAgent || '';
  var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isSafari = /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(ua);
  var isAndroid = /Android/.test(ua);
  var isFirefox = /Firefox|FxiOS/.test(ua);
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  function dismissed(){
    try { return localStorage.getItem(DISMISS_KEY) === '1'; } catch(err){ return false; }
  }
  function setDismissed(){
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch(err){}
  }

  /* Rewrites the banner's copy + actions for browsers that will never
     fire beforeinstallprompt, so there is always a real, correct path
     to installing instead of a dead "Install" button. */
  function renderManualBanner(){
    if(!banner) return;
    var textEl = banner.querySelector('.install-banner-text');
    var installBtnEl = document.getElementById('installBannerInstall');
    if(isIOS && isSafari){
      if(textEl) textEl.innerHTML = '<b>Install NoviQue</b>Tap <i class="fa-solid fa-arrow-up-from-bracket" aria-hidden="true"></i> Share, then "Add to Home Screen".';
      if(installBtnEl) installBtnEl.style.display = 'none';
    } else if(isFirefox){
      if(textEl) textEl.innerHTML = '<b>Install NoviQue</b>Open the browser menu and choose "Install" or "Add to Home Screen".';
      if(installBtnEl) installBtnEl.style.display = 'none';
    } else {
      if(textEl) textEl.innerHTML = '<b>Install NoviQue</b>Open the browser menu (&#8942;) and choose "Install app" or "Add to Home Screen".';
      if(installBtnEl) installBtnEl.style.display = 'none';
    }
  }

  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    deferredInstallPrompt = e;
    if(banner && !dismissed() && !isStandalone){
      banner.classList.add('show');
    }
  });

  if(installBtn){
    installBtn.addEventListener('click', function(){
      if(!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.finally(function(){
        deferredInstallPrompt = null;
        if(banner) banner.classList.remove('show');
        setDismissed();
      });
    });
  }
  if(dismissBtn){
    dismissBtn.addEventListener('click', function(){
      if(banner) banner.classList.remove('show');
      setDismissed();
    });
  }

  window.addEventListener('appinstalled', function(){
    if(banner) banner.classList.remove('show');
    deferredInstallPrompt = null;
    setDismissed();
  });

  /* On browsers that will never fire beforeinstallprompt, show the
     manual banner on a short delay (after the visitor has actually
     seen the page) instead of waiting forever for an event that's
     never coming. */
  if(!isStandalone && !dismissed() && banner){
    if(isIOS && isSafari){
      renderManualBanner();
      setTimeout(function(){ banner.classList.add('show'); }, 1800);
    } else if(isFirefox){
      renderManualBanner();
      setTimeout(function(){ banner.classList.add('show'); }, 1800);
    }
  }

  /* Expose for the Store page's per-app install buttons */
  window.NoviqueShell = {
    getDeferredInstallPrompt: function(){ return deferredInstallPrompt; },
    isStandalone: function(){ return isStandalone; },
    isIOSSafari: function(){ return isIOS && isSafari; },
    isFirefox: function(){ return isFirefox; },
    isAndroid: function(){ return isAndroid; },
    getCurrency: getCurrency,
    formatINR: formatINR,
    formatUSD: formatUSD,
    INR_PER_USD: INR_PER_USD
  };

})();
