/* ============================================
   NOVA CHATBOT WIDGET LOGIC
   Built by and for NoviQue. Version 1.0.
   Uses OpenRouter's chat completions endpoint with a free model.

   API key setup (required for live AI answers):
   1. Copy assets/js/nova-config.example.js to assets/js/nova-config.js
   2. Put your OpenRouter key in nova-config.js's apiKey field
   3. Load nova-config.js in index.html BEFORE this file:
        <script src="assets/js/nova-config.js"></script>
        <script src="assets/js/nova-chatbot.js"></script>
   nova-config.js is listed in .gitignore, so your real key never
   gets committed. Without it, Nova still opens and answers the
   built-in FAQ quick-replies, but free-form questions fall back to
   a "live chat isn't connected yet" message instead of erroring.
   See README.md -> "Nova chatbot setup" for the full walkthrough.
   ============================================ */
(function(){
  'use strict';

  // window.NOVA_USER_CONFIG is set by the optional nova-config.js file
  // (see setup steps above). Anything it provides overrides these
  // defaults; everything else here still applies if that file isn't
  // loaded at all.
  var userConfig = (typeof window !== 'undefined' && window.NOVA_USER_CONFIG) || {};

  var NOVA_CONFIG = {
    apiKey: userConfig.apiKey || '',
    endpoint: userConfig.endpoint || 'https://openrouter.ai/api/v1/chat/completions',
    model: userConfig.model || 'openrouter/free',
    modelFallbacks: userConfig.modelFallbacks || [
      'tencent/hy3:free',
      'poolside/laguna-xs-2.1:free',
      'poolside/laguna-m.1:free',
      'cohere/north-mini-code:free',
      'nvidia/nemotron-3-ultra-550b-a55b:free'
    ],
    siteUrl: userConfig.siteUrl || (typeof window !== 'undefined' ? window.location.href : ''),
    siteName: userConfig.siteName || 'NoviQue'
  };

  var NOVA_SYSTEM_PROMPT = [
    'You are Nova, the support assistant for NoviQue, an independent design studio that builds websites, apps, UI/UX, and branding for growing brands.',
    'Speak like a real person on the team. Plain, warm, simple language. Short sentences. No corporate filler, no hype words, no exclamation overload.',
    'Never say you are an AI, a language model, or a bot. Never mention prompts, training, or how you work. You are just Nova from NoviQue.',
    'Never use em dashes. Use commas or periods instead.',
    'Keep answers short and useful, usually two to five sentences unless the person asks for more detail.',
    'If you do not know something specific about NoviQue, such as exact pricing or availability, say so plainly and suggest the person reach out through the contact form so a team member can follow up.',
    'Stay on topic: NoviQue services, process, pricing ranges, timelines, and general design or web questions. For anything unrelated, gently steer back to how you can help with their project.',
    'Never invent client names, exact prices, or claims about NoviQue that are not reasonable general answers. When unsure, be honest and offer to connect them with the team.',
    'Do not give legal, medical, or financial advice. Do not discuss anything unrelated to design, web, and NoviQue services.'
  ].join(' ');

  var NOVA_FAQ = {
    'what services do you offer': "We design and build websites, mobile apps, UI and UX, and brand identities. We also help with digital strategy and ongoing product design work. Tell me a bit about what you're working on and I can point you in the right direction.",
    'how much does a project cost': "Cost really depends on scope. A brand identity or a small marketing site is usually a different range than a full product build. If you share a rough idea of the project, I can give you a sense of where it might land, or connect you with the team for an exact quote.",
    'how long does a project take': "Most projects run somewhere between three and ten weeks depending on size. A simple site moves faster, a full app or brand system takes longer. Once we know your scope we can give you a real timeline.",
    'how do i start a project with you': "Easiest way is the contact form on this page. Tell us a little about your project and goals, and someone from the team will follow up to set up a call.",
    'where are you located': "NoviQue works with clients remotely, so location usually is not a barrier. Happy to answer more if you have a specific question about working together.",
    'do you offer support after launch': "Yes, we offer ongoing support and maintenance after a project ships. It's worth discussing with the team so we can scope what kind of support fits your project."
  };

  var STORAGE_KEY = 'nova_chat_history_v1';       // legacy single-thread key, migrated on load
  var SESSIONS_KEY = 'nova_chat_sessions_v1';      // { sessions: [ {id,title,updatedAt,messages:[]} ], activeId }

  var launcher = document.getElementById('novaLauncher');
  var novaWindow = document.getElementById('novaWindow');
  var closeBtn = document.getElementById('novaCloseBtn');
  var closeBtn2 = document.getElementById('novaCloseBtn2');
  var menuBtn = document.getElementById('novaMenuBtn');
  var menu = document.getElementById('novaMenu');
  var clearBtn = document.getElementById('novaClearBtn');
  var newChatBtn = document.getElementById('novaNewChatBtn');
  var body = document.getElementById('novaBody');
  var form = document.getElementById('novaForm');
  var input = document.getElementById('novaInput');
  var sendBtn = document.getElementById('novaSend');
  var faqRow = document.getElementById('novaFaq');
  var dot = document.getElementById('novaDot');

  var historyBtn = document.getElementById('novaHistoryBtn');
  var historyMenuBtn = document.getElementById('novaHistoryMenuBtn');
  var historyPanel = document.getElementById('novaHistoryPanel');
  var historyList = document.getElementById('novaHistoryList');
  var historyBack = document.getElementById('novaHistoryBack');
  var historyNewBtn = document.getElementById('novaHistoryNewBtn');

  var history = [];        // active session's messages: [{role, content}]
  var sessions = [];        // all saved sessions
  var activeId = null;
  var isOpen = false;
  var hasOpenedOnce = false;
  var isSending = false;

  function uid(){
    return 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function loadSessions(){
    try{
      var raw = localStorage.getItem(SESSIONS_KEY);
      if(raw){
        var parsed = JSON.parse(raw);
        sessions = parsed.sessions || [];
        activeId = parsed.activeId || null;
      }
    }catch(e){ sessions = []; activeId = null; }

    // One-time migration from the old sessionStorage single-thread format,
    // so anyone with an in-progress chat doesn't lose it.
    if(sessions.length === 0){
      try{
        var legacyRaw = sessionStorage.getItem(STORAGE_KEY);
        if(legacyRaw){
          var legacy = JSON.parse(legacyRaw);
          if(legacy && legacy.length){
            var migrated = { id: uid(), title: deriveTitle(legacy), updatedAt: Date.now(), messages: legacy };
            sessions.push(migrated);
            activeId = migrated.id;
          }
        }
      }catch(e){}
      sessionStorage.removeItem(STORAGE_KEY);
    }

    var active = sessions.find(function(s){ return s.id === activeId; });
    if(active){
      history = active.messages;
    } else {
      startNewSession(false);
    }
  }

  function persistSessions(){
    try{ localStorage.setItem(SESSIONS_KEY, JSON.stringify({ sessions: sessions, activeId: activeId })); }catch(e){}
  }

  function deriveTitle(messages){
    var firstUser = messages.find(function(m){ return m.role === 'user'; });
    if(!firstUser) return 'New conversation';
    var t = firstUser.content.trim().replace(/\s+/g, ' ');
    return t.length > 42 ? t.slice(0, 42).trim() + '…' : t;
  }

  function saveHistory(){
    var active = sessions.find(function(s){ return s.id === activeId; });
    if(!active){
      active = { id: activeId || uid(), title: 'New conversation', updatedAt: Date.now(), messages: history };
      activeId = active.id;
      sessions.unshift(active);
    }
    active.messages = history;
    active.updatedAt = Date.now();
    if(history.some(function(m){ return m.role === 'user'; })){
      active.title = deriveTitle(history);
    }
    // Most-recently-updated first
    sessions.sort(function(a,b){ return b.updatedAt - a.updatedAt; });
    persistSessions();
  }

  function startNewSession(render){
    activeId = uid();
    history = [];
    var fresh = { id: activeId, title: 'New conversation', updatedAt: Date.now(), messages: [] };
    sessions.unshift(fresh);
    persistSessions();
    if(render !== false){
      renderAllHistory();
      faqRow.style.display = 'flex';
    }
  }

  function switchToSession(id){
    var s = sessions.find(function(s){ return s.id === id; });
    if(!s) return;
    activeId = id;
    history = s.messages;
    persistSessions();
    renderAllHistory();
    faqRow.style.display = history.length ? 'none' : 'flex';
    closeHistoryPanel();
  }

  function deleteSession(id, evt){
    if(evt) evt.stopPropagation();
    sessions = sessions.filter(function(s){ return s.id !== id; });
    if(id === activeId){
      if(sessions.length){
        activeId = sessions[0].id;
        history = sessions[0].messages;
        renderAllHistory();
      } else {
        startNewSession(true);
      }
    }
    persistSessions();
    renderHistoryList();
  }

  function timeAgo(ts){
    var diff = Date.now() - ts;
    var min = Math.floor(diff/60000);
    if(min < 1) return 'just now';
    if(min < 60) return min + 'm ago';
    var hr = Math.floor(min/60);
    if(hr < 24) return hr + 'h ago';
    var d = Math.floor(hr/24);
    if(d < 7) return d + 'd ago';
    return new Date(ts).toLocaleDateString();
  }

  function renderHistoryList(){
    historyList.innerHTML = '';
    if(sessions.length === 0){
      var empty = document.createElement('div');
      empty.className = 'nova-history-empty';
      empty.innerHTML = '<i class="fa-regular fa-comments" aria-hidden="true"></i>No saved conversations yet.<br>Start chatting and it will show up here.';
      historyList.appendChild(empty);
      return;
    }
    sessions.forEach(function(s, i){
      var lastMsg = s.messages.length ? s.messages[s.messages.length - 1] : null;
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'nova-history-item';
      item.style.animationDelay = (i * 0.04) + 's';
      if(s.id === activeId) item.style.borderColor = 'var(--lime)';
      item.innerHTML =
        '<div class="nova-history-item-icon"><i class="fa-solid fa-message" aria-hidden="true"></i></div>' +
        '<div class="nova-history-item-body">' +
          '<div class="nova-history-item-title"></div>' +
          '<div class="nova-history-item-preview"></div>' +
          '<div class="nova-history-item-meta"><i class="fa-regular fa-clock" aria-hidden="true"></i><span></span></div>' +
        '</div>' +
        '<button type="button" class="nova-history-item-del" aria-label="Delete conversation"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>';
      item.querySelector('.nova-history-item-title').textContent = s.title || 'New conversation';
      item.querySelector('.nova-history-item-preview').textContent = lastMsg ? lastMsg.content : 'No messages yet';
      item.querySelector('.nova-history-item-meta span').textContent = timeAgo(s.updatedAt) + ' · ' + s.messages.length + ' message' + (s.messages.length===1?'':'s');
      item.addEventListener('click', function(){ switchToSession(s.id); });
      item.querySelector('.nova-history-item-del').addEventListener('click', function(e){ deleteSession(s.id, e); });
      historyList.appendChild(item);
    });
  }

  function openHistoryPanel(){
    renderHistoryList();
    historyPanel.classList.add('show');
    historyPanel.setAttribute('aria-hidden', 'false');
    closeMenu();
  }
  function closeHistoryPanel(){
    historyPanel.classList.remove('show');
    historyPanel.setAttribute('aria-hidden', 'true');
  }

  function scrollToBottom(){
    body.scrollTop = body.scrollHeight;
  }

  function renderMessage(role, text, opts){
    opts = opts || {};
    var wrap = document.createElement('div');
    wrap.className = 'nova-msg ' + (role === 'user' ? 'user' : 'bot');

    var avatar = document.createElement('div');
    avatar.className = 'nova-msg-avatar';
    if(role === 'user'){
      avatar.innerHTML = '<i class="fa-solid fa-user" aria-hidden="true"></i>';
    } else {
      avatar.innerHTML = '<i class="fa-solid fa-seedling" aria-hidden="true"></i>';
    }

    var bubble = document.createElement('div');
    bubble.className = 'nova-msg-bubble';

    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
    body.appendChild(wrap);

    if(opts.typewriter){
      typewriterInto(bubble, String(text));
    } else {
      var paras = String(text).split(/\n{2,}/);
      paras.forEach(function(p){
        var pEl = document.createElement('p');
        pEl.textContent = p;
        bubble.appendChild(pEl);
      });
    }

    scrollToBottom();
    return bubble;
  }

  function typewriterInto(bubble, text){
    var paras = String(text).split(/\n{2,}/);
    var pIndex = 0;
    var cIndex = 0;
    var currentP = null;

    function step(){
      if(pIndex >= paras.length){
        var last = bubble.lastElementChild;
        if(last){ last.classList.remove('nova-caret'); }
        return;
      }
      if(!currentP){
        currentP = document.createElement('p');
        currentP.classList.add('nova-caret');
        bubble.appendChild(currentP);
        cIndex = 0;
      }
      var prev = currentP.previousElementSibling;
      if(prev){ prev.classList.remove('nova-caret'); }
      var para = paras[pIndex];
      var charsThisTick = 1;
      cIndex += charsThisTick;
      currentP.textContent = para.slice(0, cIndex);
      scrollToBottom();

      if(cIndex >= para.length){
        pIndex += 1;
        currentP.classList.remove('nova-caret');
        currentP = null;
        if(pIndex < paras.length){
          setTimeout(step, 60);
        }
        return;
      }
      setTimeout(step, 14);
    }
    step();
  }

  function renderAllHistory(){
    body.innerHTML = '';
    if(history.length === 0){
      renderMessage('assistant', "Hey, I'm Nova from NoviQue. Ask me about our services, pricing, or how to get started, or type your own question below.");
      return;
    }
    history.forEach(function(m){
      renderMessage(m.role, m.content);
    });
  }

  function showTyping(){
    var wrap = document.createElement('div');
    wrap.className = 'nova-typing';
    wrap.id = 'novaTypingIndicator';
    wrap.innerHTML = '<div class="nova-msg-avatar"><i class="fa-solid fa-seedling" aria-hidden="true"></i></div><div class="nova-typing-dots"><span></span><span></span><span></span></div>';
    body.appendChild(wrap);
    scrollToBottom();
  }

  function hideTyping(){
    var el = document.getElementById('novaTypingIndicator');
    if(el){ el.remove(); }
  }

  function normalize(str){
    return str.toLowerCase().trim().replace(/[?.!]/g, '');
  }

  function getFaqAnswer(question){
    var key = normalize(question);
    if(NOVA_FAQ[key]){ return NOVA_FAQ[key]; }
    for(var k in NOVA_FAQ){
      if(NOVA_FAQ.hasOwnProperty(k) && (key.indexOf(k) !== -1 || k.indexOf(key) !== -1)){
        return NOVA_FAQ[k];
      }
    }
    return null;
  }

  function openWindow(){
    isOpen = true;
    hasOpenedOnce = true;
    novaWindow.classList.add('open');
    novaWindow.setAttribute('aria-hidden', 'false');
    launcher.classList.add('open');
    launcher.setAttribute('aria-expanded', 'true');
    dot.classList.remove('show');
    if(history.length === 0){ renderAllHistory(); }
    setTimeout(function(){ input.focus(); }, 150);
  }

  function closeWindow(){
    isOpen = false;
    novaWindow.classList.remove('open');
    novaWindow.setAttribute('aria-hidden', 'true');
    launcher.classList.remove('open');
    launcher.setAttribute('aria-expanded', 'false');
    closeMenu();
  }

  function toggleWindow(){
    if(isOpen){ closeWindow(); } else { openWindow(); }
  }

  function openMenu(){
    menu.classList.add('show');
    menuBtn.setAttribute('aria-expanded', 'true');
  }
  function closeMenu(){
    menu.classList.remove('show');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
  function toggleMenu(e){
    e.stopPropagation();
    if(menu.classList.contains('show')){ closeMenu(); } else { openMenu(); }
  }

  function clearChat(){
    history = [];
    saveHistory();
    renderAllHistory();
    closeMenu();
    faqRow.style.display = 'flex';
  }

  function autoResize(){
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 96) + 'px';
  }

  function setSending(state){
    isSending = state;
    sendBtn.disabled = state;
    input.disabled = state;
    sendBtn.classList.toggle('sending', state);
  }

  function addUserMessage(text){
    history.push({ role: 'user', content: text });
    renderMessage('user', text);
    saveHistory();
  }

  function addBotMessage(text, opts){
    history.push({ role: 'assistant', content: text });
    renderMessage('assistant', text, opts);
    saveHistory();
  }

  function fallbackReply(reason){
    if(reason === 'not-configured'){
      return "Nova's live chat isn't connected yet, so I can only answer the quick questions above for now. For anything else, the contact form is the fastest way to reach the team.";
    }
    return "I couldn't reach the assistant service just now. Please try again in a moment, or reach out through the contact form and the team will get back to you directly.";
  }

  function isApiKeyConfigured(){
    var key = NOVA_CONFIG.apiKey && NOVA_CONFIG.apiKey.trim();
    return !!key && key.indexOf('YOUR_') !== 0 && key !== '';
  }

  function requestChatCompletion(model, messages){
    var key = NOVA_CONFIG.apiKey.trim();
    return fetch(NOVA_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key,
        'HTTP-Referer': NOVA_CONFIG.siteUrl,
        'X-Title': NOVA_CONFIG.siteName
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 500,
        temperature: 0.6
      })
    }).then(function(res){
      if(!res.ok){
        return res.text().then(function(bodyText){
          // Surface the real reason in the console so failures are diagnosable
          // instead of silently falling through to the next model.
          console.error('[Nova] ' + model + ' failed with status ' + res.status + ': ' + bodyText);
          throw new Error('Request failed with status ' + res.status);
        });
      }
      return res.json();
    }).then(function(data){
      var reply = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if(!reply){
        console.error('[Nova] ' + model + ' returned an empty response', data);
        throw new Error('Empty response');
      }
      return reply.trim();
    });
  }

  function callOpenRouter(userText){
    if(!isApiKeyConfigured()){
      return Promise.resolve(fallbackReply('not-configured'));
    }

    var messages = [{ role: 'system', content: NOVA_SYSTEM_PROMPT }];
    var recent = history.slice(-10);
    recent.forEach(function(m){
      messages.push({ role: m.role, content: m.content });
    });

    // Try the primary model first, then walk the configured fallbacks in order.
    // Only surface the generic "couldn't reach" message once every option has failed.
    var modelsToTry = [NOVA_CONFIG.model].concat(NOVA_CONFIG.modelFallbacks || []);
    var attempt = 0;

    function tryNext(){
      if(attempt >= modelsToTry.length){
        console.error('[Nova] All models failed (' + modelsToTry.join(', ') + '). Showing fallback reply to user.');
        return fallbackReply();
      }
      var model = modelsToTry[attempt];
      attempt += 1;
      return requestChatCompletion(model, messages).catch(function(err){
        console.warn('[Nova] Model ' + model + ' failed, trying next. Reason: ' + err.message);
        return tryNext();
      });
    }

    return tryNext();
  }

  function handleSend(text){
    text = text.trim();
    if(!text || isSending){ return; }

    faqRow.style.display = 'none';
    addUserMessage(text);
    input.value = '';
    autoResize();
    setSending(true);
    showTyping();

    var faqAnswer = getFaqAnswer(text);
    if(faqAnswer){
      setTimeout(function(){
        hideTyping();
        addBotMessage(faqAnswer, { typewriter: true });
        setSending(false);
      }, 500);
      return;
    }

    callOpenRouter(text).then(function(reply){
      hideTyping();
      addBotMessage(reply, { typewriter: true });
      setSending(false);
    });
  }

  launcher.addEventListener('click', toggleWindow);
  closeBtn.addEventListener('click', closeWindow);
  closeBtn2.addEventListener('click', closeWindow);
  menuBtn.addEventListener('click', toggleMenu);
  clearBtn.addEventListener('click', clearChat);

  newChatBtn.addEventListener('click', function(){
    startNewSession(true);
    closeMenu();
  });
  historyBtn.addEventListener('click', openHistoryPanel);
  historyMenuBtn.addEventListener('click', function(){
    openHistoryPanel();
    closeMenu();
  });
  historyBack.addEventListener('click', closeHistoryPanel);
  historyNewBtn.addEventListener('click', function(){
    startNewSession(true);
    closeHistoryPanel();
  });

  document.addEventListener('click', function(e){
    if(!menu.contains(e.target) && !menuBtn.contains(e.target)){
      closeMenu();
    }
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      if(menu.classList.contains('show')){ closeMenu(); }
      else if(isOpen){ closeWindow(); }
    }
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    handleSend(input.value);
  });

  input.addEventListener('keydown', function(e){
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      handleSend(input.value);
    }
  });

  input.addEventListener('input', autoResize);

  faqRow.addEventListener('click', function(e){
    var btn = e.target.closest('button[data-q]');
    if(!btn) return;
    handleSend(btn.getAttribute('data-q'));
  });

  loadSessions();
  if(history.length > 0){
    dot.classList.add('show');
  }

})();
