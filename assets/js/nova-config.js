/* ============================================
   NOVA CHATBOT — LOCAL CONFIG (EXAMPLE)
   ============================================
   This is a template. To enable Nova's live AI answers:

   1. Copy this file to "nova-config.js" in this same folder
      (assets/js/nova-config.js).
   2. Get a free API key at https://openrouter.ai/keys
   3. Paste it into apiKey below.
   4. Every page already loads assets/js/nova-config.js right
      before nova-chatbot.js, with onerror="this.remove()" — so
      if the file isn't present yet, it's silently skipped and
      Nova just falls back to FAQ-only mode. Nothing else to wire up.

   assets/js/nova-config.js is listed in .gitignore, so once you
   create it, git will never track or commit it — your real key
   stays local (or lives only in whatever private deployment
   environment you set it up in). Never remove that .gitignore
   entry and never paste a real key directly into nova-chatbot.js
   or into this example file.

   For a real production deployment, don't put the key in the
   browser at all — proxy requests through a small server-side
   function that holds the key and forwards them to OpenRouter,
   then point `endpoint` below at your own function instead.
   See README.md -> "Nova chatbot setup" for details.
   ============================================ */

window.NOVA_USER_CONFIG = {
  apiKey: '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',
  endpoint: 'https://openrouter.ai/api/v1/chat/completions',
  model: 'inclusionai/ling-3.0-flash-vl',
  modelFallbacks: [
    'tencent/hy3:free',
    'poolside/laguna-xs-2.1:free',
    'poolside/laguna-m.1:free',
    'cohere/north-mini-code:free',
    'nvidia/nemotron-3-ultra-550b-a55b:free'
  ],
  siteUrl: 'https://novique.design',
  siteName: 'NoviQue'
};
