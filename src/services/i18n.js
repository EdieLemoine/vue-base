import router from '@/services/router';
import store from '@/store';
import defaultMessages from '@/translations/nl_NL';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/nl';
import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);
Vue.use(require('vue-moment'), {
  moment,
});

export const DEFAULT_LANGUAGE = 'nl_NL';

const loadedLanguages = [DEFAULT_LANGUAGE];
export const availableLanguages = [
  DEFAULT_LANGUAGE,
  'en_GB',
];

const i18n = new VueI18n({
  cc: getCountryCode(DEFAULT_LANGUAGE),
  locale: DEFAULT_LANGUAGE,
  // fallback locale for missing strings (if any)
  fallbackLocale: DEFAULT_LANGUAGE,
  // don't log warnings on production
  silentTranslationWarn: process.env.NODE_ENV === 'prod',
  messages: {
    [DEFAULT_LANGUAGE]: defaultMessages,
  },
});

// Manually add list of available languages to i18n object
i18n.availableLanguages = availableLanguages;

// don't forget to add new languages to MomentLocalesPlugin in webpack.prod.conf.js
Vue.moment().locale(getLCID(DEFAULT_LANGUAGE));
axios.defaults.headers.common['Accept-Language'] = DEFAULT_LANGUAGE;

/*
 * Set language
 *
 * @param {string} lang — ISO country code
 */
function setLanguage(lang) {
  const cc = getCountryCode(lang);
  i18n.locale = lang;
  i18n.cc = cc;
  setMomentLanguage(getLCID(lang));

  router.push({query: {lang: lang}});

  axios.defaults.headers.common['Accept-Language'] = lang;
  document.querySelector('html').setAttribute('lang', lang);

  // re-fetch tracking information for status translations
  if (router.currentRoute.name === 'TrackTrace') {
    store.dispatch('FETCH_TRACKING_INFORMATION', Object.assign(router.currentRoute.params, {language: lang}));
  }

  return lang;
}

function setMomentLanguage(lang) {
  import(`moment/locale/${lang}`).then(() => {
    Vue.moment().locale(lang);
  });
}

/*
 * The loadLanguageAsync function is what we will actually use to change the languages. Loading the new files is done
 * via the import function, which is generously provided by Webpack and it allows us to load files dynamically, and
 * because it uses promises we can easily wait for the loading to finish.
 *
 * @param {string} lang — ISO country code
 */
export function loadLanguageAsync(lang = DEFAULT_LANGUAGE) {
  if (i18n.locale !== lang) {
    if (!loadedLanguages.includes(lang)) {
      return import(`@/translations/${lang}`).then((messages) => {
        i18n.setLocaleMessage(lang, messages.default);
        loadedLanguages.push(lang);

        return setLanguage(lang);
      });
    }
    return Promise.resolve(setLanguage(lang));
  }
  return Promise.resolve(lang);
}

function getCountryCode(localeCode) {
  return localeCode.substring(3, 5).toLowerCase();
}

function getLCID(localeCode) {
  localeCode = localeCode.toLowerCase().replace(/_/, '-');
  const lcid = localeCode.substring(0, 2);
  const count = localeCode.split(lcid).length - 1;
  return count > 1 ? lcid : localeCode;
}

export default i18n;
