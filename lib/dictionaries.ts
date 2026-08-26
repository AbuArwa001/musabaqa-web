import 'server-only'
import type en from '@/dictionaries/en.json'

type Dictionary = typeof en

const dictionaries: Record<string, () => Promise<Dictionary>> = {
  en: () => import('@/dictionaries/en.json').then((m) => m.default),
  ar: () => import('@/dictionaries/ar.json').then((m) => m.default),
}

export type Locale = keyof typeof dictionaries

export const LOCALES: Locale[] = ['en', 'ar']
export const DEFAULT_LOCALE: Locale = 'en'

export const isValidLocale = (locale: string): locale is Locale =>
  locale in dictionaries

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]()
