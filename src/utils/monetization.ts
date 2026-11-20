export interface MonetizationConfig {
  gaMeasurementId: string;
  adsenseClientId: string;
  hasGa: boolean;
  hasAdsense: boolean;
}

export function getMonetizationConfig(): MonetizationConfig {
  const gaRaw = (import.meta.env.PUBLIC_GA_MEASUREMENT_ID ?? '').trim();
  const adRaw = (import.meta.env.PUBLIC_ADSENSE_CLIENT_ID ?? '').trim();

  const gaMeasurementId = /^G-[A-Z0-9]+$/i.test(gaRaw) ? gaRaw : '';
  const adsenseClientId = /^ca-pub-\d{10,}$/i.test(adRaw) ? adRaw : '';

  return {
    gaMeasurementId,
    adsenseClientId,
    hasGa: gaMeasurementId.length > 0,
    hasAdsense: adsenseClientId.length > 0,
  };
}