import { getRequestConfig } from 'next-intl/server';

/**
 * Минимальная конфигурация next-intl.
 * Пока используем одну локаль без словарей — этого достаточно,
 * чтобы плагин/провайдер не падали. Сообщения добавим, когда понадобится i18n.
 */
export default getRequestConfig(async () => {
  return {
    locale: 'en',
    messages: {},
  };
});
