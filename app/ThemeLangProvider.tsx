'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'
type Lang = 'en' | 'fr' | 'yo' | 'ha' | 'ig'

const translations: Record<Lang, Record<string, string>> = {
  en: { tagline: 'Keep your loved ones safe, together.', download: 'Download Free', story_intro: 'A true story, retold every day', cta_title: 'Your family deserves to feel safe.' },
  fr: { tagline: 'Gardez vos proches en sécurité, ensemble.', download: 'Télécharger gratuitement', story_intro: 'Une vraie histoire, racontée chaque jour', cta_title: 'Votre famille mérite de se sentir en sécurité.' },
  yo: { tagline: 'Jẹ ki awọn ololufẹ rẹ wa ni aabo, papọ.', download: 'Gba ọfẹ', story_intro: 'Itan otitọ, ti a tun sọ lojoojumọ', cta_title: 'Ẹbí rẹ yẹ ki o lero aabo.' },
  ha: { tagline: 'Kiyaye ƙaunatattunka lafiya, tare.', download: 'Zazzage kyauta', story_intro: 'Labari na gaskiya, ana sake faɗinsa kowace rana', cta_title: 'Iyalinka sun cancanci jin aminci.' },
  ig: { tagline: 'Debe ndị ị hụ n\'anya gị n\'ọchịchọ, ọnụ.', download: 'Budata n\'efu', story_intro: 'Akụkọ eziokwu, a na-akọwa ya kwa ụbọchị', cta_title: 'Ezinụlọ gị kwesịrị ịnọ n\'ụlọ.' },
}

type Ctx = { theme: Theme; setTheme: (t: Theme) => void; lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string }
const Ctx = createContext<Ctx>({ theme: 'system', setTheme: () => {}, lang: 'en', setLang: () => {}, t: k => k })

export function ThemeLangProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [lang, setLang] = useState<Lang>('en')

  function setTheme(t: Theme) {
    setThemeState(t)
    localStorage.setItem('sc-theme', t)
  }

  useEffect(() => {
    const saved = localStorage.getItem('sc-theme') as Theme | null
    if (saved) setThemeState(saved)
    const savedLang = localStorage.getItem('sc-lang') as Lang | null
    if (savedLang) setLang(savedLang)
  }, [])

  useEffect(() => {
    localStorage.setItem('sc-lang', lang)
  }, [lang])

  useEffect(() => {
    const root = document.documentElement
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    root.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [theme])

  const t = (k: string) => translations[lang][k] ?? translations.en[k] ?? k

  return <Ctx.Provider value={{ theme, setTheme, lang, setLang, t }}>{children}</Ctx.Provider>
}

export const useThemeLang = () => useContext(Ctx)
