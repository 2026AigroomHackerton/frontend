const LOCALHOST_ORIGIN = 'http://localhost:5173';
const DEPLOYED_ORIGIN = 'https://frontend-pnyn.onrender.com';
const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.8.1/kakao.min.js';
const KAKAO_SCRIPT_ID = 'kakao-js-sdk';

interface KakaoSdk {
  init: (key: string) => void;
  isInitialized: () => boolean;
  Share?: {
    sendDefault: (options: unknown) => void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

export interface KakaoTextShareInput {
  title: string;
  description: string;
}

export async function sendKakaoTextShare(input: KakaoTextShareInput): Promise<void> {
  const kakaoKey = getKakaoJavascriptKey();
  const linkOrigin = getKakaoLinkOrigin();

  console.log('current origin:', window.location.origin);
  console.log('kakao link origin:', linkOrigin);
  console.log('kakao key exists:', Boolean(kakaoKey));
  console.log('kakao key preview:', previewKey(kakaoKey));
  console.log('kakao initialized before init:', window.Kakao?.isInitialized?.());

  const kakao = await loadKakaoSdk(kakaoKey);
  console.log('kakao initialized after init:', kakao.isInitialized());

  if (!kakao.Share?.sendDefault) {
    throw new Error('Kakao SDK Share API is not available.');
  }

  kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: input.title || 'Kakao share',
      description: input.description || 'Kakao share test',
      imageUrl:
        'https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png',
      link: {
        mobileWebUrl: linkOrigin,
        webUrl: linkOrigin,
      },
    },
    buttons: [
      {
        title: 'Open web',
        link: {
          mobileWebUrl: linkOrigin,
          webUrl: linkOrigin,
        },
      },
    ],
  });
}

function getKakaoJavascriptKey(): string | undefined {
  return (
    import.meta.env.VITE_KAKAO_JS_KEY ||
    import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY
  ) as string | undefined;
}

function getKakaoLinkOrigin(): string {
  if (window.location.origin === LOCALHOST_ORIGIN) return LOCALHOST_ORIGIN;
  if (window.location.origin === DEPLOYED_ORIGIN) return DEPLOYED_ORIGIN;
  return window.location.origin;
}

async function loadKakaoSdk(kakaoKey: string | undefined): Promise<KakaoSdk> {
  if (!kakaoKey) {
    throw new Error('VITE_KAKAO_JS_KEY or VITE_KAKAO_JAVASCRIPT_KEY is not set.');
  }

  if (!window.Kakao) {
    await injectKakaoScript();
  }

  const kakao = window.Kakao;
  if (!kakao) {
    throw new Error('Kakao SDK failed to load.');
  }

  if (!kakao.isInitialized()) {
    kakao.init(kakaoKey);
  }

  return kakao;
}

function injectKakaoScript(): Promise<void> {
  const existing = document.getElementById(KAKAO_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return waitForKakaoScript(existing);
  }

  const script = document.createElement('script');
  script.id = KAKAO_SCRIPT_ID;
  script.src = KAKAO_SDK_URL;
  script.async = true;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);

  return waitForKakaoScript(script);
}

function waitForKakaoScript(script: HTMLScriptElement): Promise<void> {
  if (window.Kakao) return Promise.resolve();

  return new Promise((resolve, reject) => {
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('Failed to load Kakao SDK script.')), {
      once: true,
    });
  });
}

function previewKey(key: string | undefined): string {
  if (!key) return '(missing)';
  if (key.length <= 8) return `${key.length} chars`;
  return `${key.slice(0, 4)}...${key.slice(-4)} (${key.length} chars)`;
}
