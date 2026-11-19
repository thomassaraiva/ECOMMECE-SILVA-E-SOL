import { StoreSettings } from '../types/ecommerce';

// O que cada formulário do painel envia a StoreService.updateSettings.
// Só entram campos que têm coluna em store_settings.

export interface SettingsForm {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  contactEmail: string;
  instagramHandle: string;
  freeShippingThreshold: number | '';
  returnPolicy: string;
  shippingPolicy: string;
  privacyPolicy: string;
  legalName: string;
  cnpj: string;
  address: string;
}

export function settingsFormToPayload(f: SettingsForm): Partial<StoreSettings> {
  return {
    storeName: f.storeName.trim(),
    tagline: f.tagline.trim(),
    whatsappNumber: f.whatsappNumber.trim().replace(/\D/g, ''),
    contactEmail: f.contactEmail.trim(),
    instagramHandle: f.instagramHandle.trim(),
    freeShippingThreshold: f.freeShippingThreshold === '' ? undefined : Number(f.freeShippingThreshold),
    returnPolicy: f.returnPolicy.trim(),
    shippingPolicy: f.shippingPolicy.trim(),
    privacyPolicy: f.privacyPolicy.trim(),
    legalName: f.legalName.trim(),
    cnpj: f.cnpj.trim(),
    address: f.address.trim(),
  };
}

export interface AboutForm {
  aboutText: string;
  aboutMission: string;
}

export function aboutFormToPayload(f: AboutForm): Partial<StoreSettings> {
  return { aboutText: f.aboutText.trim(), aboutMission: f.aboutMission.trim() };
}
