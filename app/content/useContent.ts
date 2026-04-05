import { useThemeLang } from '../ThemeLangProvider'
import en from './en'
import fr from './fr'
import { yo, ha, ig } from './other'
import type { Content } from './types'

const map: Record<string, Content> = { en, fr, yo, ha, ig }

export function useContent(): Content {
  const { lang } = useThemeLang()
  return map[lang] ?? en
}
