import i18n from "i18next";
import { reactI18nextModule } from "react-i18next";

import en from './en.json';
import zh from './zh.json';

// the translations
const resources = {
  en: {
    translation: en
  },
  zh: {
    translation: zh
  }
};

i18n
  .use(reactI18nextModule)
  .init({
    resources,
    lng: "en",

    keySeparator: false,

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
