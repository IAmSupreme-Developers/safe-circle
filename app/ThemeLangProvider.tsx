'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'
type Lang = 'en' | 'fr' | 'yo' | 'ha' | 'ig'

const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Nav
    nav_cta: 'Get the App',
    // Hero
    hero_badge: 'Trusted by 10,000+ families worldwide',
    hero_headline1: 'When every second',
    tagline: 'matters most.',
    hero_sub: 'SafeCircle combines real-time GPS tracking, community-powered alerts, and AI assistance — so you\'re never alone when someone you love needs help.',
    download: 'Download Free',
    hero_watch: '▶ Watch the story',
    hero_scroll: 'Scroll to explore',
    // Story
    story_label: 'A true story, retold every day',
    story_headline: '44 minutes that changed',
    story_headline2: 'everything for one family.',
    story_sub: 'This is Emma\'s story. Scroll to follow what happened — and how SafeCircle made the difference.',
    // Features
    features_label: 'Everything you need',
    features_headline: 'Built for real emergencies',
    // How it works
    how_label: 'Simple by design',
    how_headline: 'Up and running in minutes',
    // Testimonials
    test_label: 'Real families, real stories',
    test_headline: 'Trusted across Africa and beyond',
    // CTA
    cta_label: 'Join 10,000+ families',
    cta_headline1: 'Your family deserves',
    cta_title: 'to feel safe.',
    cta_sub: 'Join 10,000+ families already using SafeCircle. Free to download. No subscription to get started.',
    cta_google: 'Get it on',
    cta_apple: 'Download on the',
    cta_free: 'Free to download',
    cta_nocard: 'No credit card required',
    cta_offline: 'Works offline',
    cta_platforms: 'iOS & Android',
    // Footer
    footer_tagline: 'Community safety platform for families and neighbourhoods. Built with care.',
    footer_copy: '© 2026 SafeCircle. Built for communities that care.',
  },
  fr: {
    nav_cta: 'Télécharger',
    hero_badge: 'Approuvé par plus de 10 000 familles dans le monde',
    hero_headline1: 'Quand chaque seconde',
    tagline: 'compte vraiment.',
    hero_sub: 'SafeCircle combine le suivi GPS en temps réel, les alertes communautaires et l\'assistance IA — pour que vous ne soyez jamais seul quand un proche a besoin d\'aide.',
    download: 'Télécharger gratuitement',
    hero_watch: '▶ Voir l\'histoire',
    hero_scroll: 'Défiler pour explorer',
    story_label: 'Une vraie histoire, racontée chaque jour',
    story_headline: '44 minutes qui ont tout changé',
    story_headline2: 'pour une famille.',
    story_sub: 'Voici l\'histoire d\'Emma. Faites défiler pour suivre ce qui s\'est passé — et comment SafeCircle a fait la différence.',
    features_label: 'Tout ce dont vous avez besoin',
    features_headline: 'Conçu pour les vraies urgences',
    how_label: 'Simple par conception',
    how_headline: 'Opérationnel en quelques minutes',
    test_label: 'Vraies familles, vraies histoires',
    test_headline: 'Approuvé à travers l\'Afrique et au-delà',
    cta_label: 'Rejoignez 10 000+ familles',
    cta_headline1: 'Votre famille mérite',
    cta_title: 'de se sentir en sécurité.',
    cta_sub: 'Rejoignez plus de 10 000 familles qui utilisent déjà SafeCircle. Gratuit à télécharger.',
    cta_google: 'Disponible sur',
    cta_apple: 'Télécharger sur',
    cta_free: 'Gratuit', cta_nocard: 'Sans carte bancaire', cta_offline: 'Fonctionne hors ligne', cta_platforms: 'iOS & Android',
    footer_tagline: 'Plateforme de sécurité communautaire pour les familles. Conçu avec soin.',
    footer_copy: '© 2026 SafeCircle. Construit pour les communautés qui se soucient.',
  },
  yo: {
    nav_cta: 'Gba Ẹ̀rọ náà',
    hero_badge: 'Ẹbí 10,000+ gbẹ́kẹ̀lé rẹ̀ káàárọ̀',
    hero_headline1: 'Nígbà tí ìṣẹ́jú kọ̀ọ̀kan',
    tagline: 'ṣe pàtàkì jùlọ.',
    hero_sub: 'SafeCircle ń dapọ̀ GPS gidi, ìkìlọ̀ àwùjọ, àti ìrànlọ́wọ́ AI — kí o má ṣe nìkan nígbà tí ẹnì tí o fẹ́ràn nílò ìrànlọ́wọ́.',
    download: 'Gba ọfẹ',
    hero_watch: '▶ Wo ìtàn náà',
    hero_scroll: 'Yípo láti ṣàwárí',
    story_label: 'Ìtàn otitọ, tí a tún sọ lojoojumọ',
    story_headline: 'Ìṣẹ́jú 44 tí ó yí ohun gbogbo padà',
    story_headline2: 'fún ẹbí kan.',
    story_sub: 'Èyí ni ìtàn Emma. Yípo láti tẹ̀lé ohun tí ó ṣẹlẹ̀.',
    features_label: 'Ohun gbogbo tí o nílò',
    features_headline: 'Àgbékalẹ̀ fún àjálù gidi',
    how_label: 'Rọrùn nípasẹ̀ àpẹrẹ',
    how_headline: 'Ṣiṣẹ ní ìṣẹ́jú díẹ̀',
    test_label: 'Àwọn ẹbí gidi, àwọn ìtàn gidi',
    test_headline: 'Gbẹ́kẹ̀lé kárọ̀ Áfríkà àti jù bẹ́ẹ̀ lọ',
    cta_label: 'Darapọ̀ mọ́ ẹbí 10,000+',
    cta_headline1: 'Ẹbí rẹ yẹ',
    cta_title: 'láti lero aabo.',
    cta_sub: 'Darapọ̀ mọ́ àwọn ẹbí 10,000+ tí wọ́n ti ń lo SafeCircle. Ọfẹ láti gba.',
    cta_google: 'Gba lórí', cta_apple: 'Gba lórí',
    cta_free: 'Ọfẹ', cta_nocard: 'Kò nílò káàdì', cta_offline: 'Ṣiṣẹ láìsí íntánẹ́ẹ̀tì', cta_platforms: 'iOS & Android',
    footer_tagline: 'Pẹpẹ aabo àwùjọ fún àwọn ẹbí. Àgbékalẹ̀ pẹ̀lú ìtọ́jú.',
    footer_copy: '© 2026 SafeCircle. Àgbékalẹ̀ fún àwọn àwùjọ tí ó níṣẹ́.',
  },
  ha: {
    nav_cta: 'Sami App',
    hero_badge: 'Iyalai 10,000+ sun amince da shi',
    hero_headline1: 'Lokacin da kowane dakika',
    tagline: 'yana da muhimmanci.',
    hero_sub: 'SafeCircle yana haɗa GPS na ainihi, faɗakarwar al\'umma, da taimakon AI — don ba za ka taɓa kasancewa kaɗai ba.',
    download: 'Zazzage kyauta',
    hero_watch: '▶ Kalli labarin',
    hero_scroll: 'Zube don bincika',
    story_label: 'Labari na gaskiya, ana sake faɗinsa kowace rana',
    story_headline: 'Mintuna 44 da suka canza komai',
    story_headline2: 'ga iyali ɗaya.',
    story_sub: 'Wannan shine labarin Emma. Zube don bin abin da ya faru.',
    features_label: 'Duk abin da kuke bukata',
    features_headline: 'An gina don gaggawa na gaskiya',
    how_label: 'Mai sauƙi ta ƙira',
    how_headline: 'Yana aiki cikin mintuna',
    test_label: 'Iyalai na gaskiya, labarai na gaskiya',
    test_headline: 'An amince da shi a Afirka da waje',
    cta_label: 'Shiga iyalai 10,000+',
    cta_headline1: 'Iyalinka sun cancanci',
    cta_title: 'jin aminci.',
    cta_sub: 'Shiga iyalai 10,000+ da ke amfani da SafeCircle. Kyauta don zazzagewa.',
    cta_google: 'Samu a', cta_apple: 'Zazzage a',
    cta_free: 'Kyauta', cta_nocard: 'Ba kati ba', cta_offline: 'Yana aiki ba tare da intanet ba', cta_platforms: 'iOS & Android',
    footer_tagline: 'Platform na amincin al\'umma ga iyalai. An gina da kulawa.',
    footer_copy: '© 2026 SafeCircle. An gina don al\'ummomi masu kulawa.',
  },
  ig: {
    nav_cta: 'Nweta App',
    hero_badge: 'Ezinụlọ 10,000+ tụkwasịrị obi na ya',
    hero_headline1: 'Mgbe sekọnd ọ bụla',
    tagline: 'dị mkpa karịa.',
    hero_sub: 'SafeCircle jikọtara GPS n\'oge, ọkwa obodo, na enyemaka AI — ka ị ghara ịnọ naanị gị mgbe onye ị hụ n\'anya chọrọ enyemaka.',
    download: 'Budata n\'efu',
    hero_watch: '▶ Lee akụkọ ahụ',
    hero_scroll: 'Mee scroll iji chọpụta',
    story_label: 'Akụkọ eziokwu, a na-akọwa ya kwa ụbọchị',
    story_headline: 'Nkeji 44 gbanwere ihe niile',
    story_headline2: 'maka ezinụlọ otu.',
    story_sub: 'Nke a bụ akụkọ Emma. Mee scroll iji soro ihe mere.',
    features_label: 'Ihe niile ị chọrọ',
    features_headline: 'Ewulitere maka ihe mberede n\'ezie',
    how_label: 'Dị mfe site na nhazi',
    how_headline: 'Na-arụ ọrụ n\'ime nkeji ole na ole',
    test_label: 'Ezinụlọ n\'ezie, akụkọ n\'ezie',
    test_headline: 'A tụkwasịrị obi na ya n\'Africa na gafere',
    cta_label: 'Sonyere ezinụlọ 10,000+',
    cta_headline1: 'Ezinụlọ gị kwesịrị',
    cta_title: 'ịnọ n\'ụlọ.',
    cta_sub: 'Sonyere ezinụlọ 10,000+ na-eji SafeCircle. N\'efu iji budata.',
    cta_google: 'Nweta na', cta_apple: 'Budata na',
    cta_free: 'N\'efu', cta_nocard: 'Ọ dịghị kaadị', cta_offline: 'Na-arụ ọrụ n\'enweghị ịntanetị', cta_platforms: 'iOS & Android',
    footer_tagline: 'Ikpo okwu nchekwa obodo maka ezinụlọ. Ewulitere n\'ịhụnanya.',
    footer_copy: '© 2026 SafeCircle. Ewulitere maka obodo na-ahụ maka.',
  },
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
