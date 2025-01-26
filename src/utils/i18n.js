import { createI18n } from 'vue-i18n';
import en from '../language/en.json';
import ja from '../language/ja.json';
import ko from '../language/ko.json';
import zh_CN from '../language/zh-CN.json';
import zh_TW from '../language/zh-TW.json';

const messages = {
  en,
  ja,
  ko,
  'zh-CN': zh_CN,
  'zh-TW': zh_TW,
};

const defaultLocale = JSON.parse(localStorage.getItem('settings'))?.['language'] || 'zh_CN';

const i18n = createI18n({
  locale: defaultLocale,
  fallbackLocale: 'zh_CN',
  messages,
});

export default i18n;