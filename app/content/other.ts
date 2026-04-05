import type { Content } from './types'
import en from './en'

// Yoruba, Hausa, Igbo — use English content structure with translated titles/descs
const yo: Content = {
  navLinks: [
    { label: 'Àwọn Ẹ̀yà', section: 'features' },
    { label: 'Ìtàn', section: 'story' },
    { label: 'Bí Ó Ṣe Ń Ṣiṣẹ', section: 'how-it-works' },
    { label: 'Àwùjọ', section: 'community' },
  ],
  chapters: en.chapters.map((c, i) => ({ ...c, title: ['Ipe tó yí ohun gbogbo padà.', 'Tẹ kan. Ipò rẹ̀ tó kẹ̀yìn.', 'Àwùjọ fèsì.', 'Ẹgbẹ́ ìwádìí, tí a ṣètò.', 'A rí Emma láìsí ewu.'][i], body: c.body })),
  features: en.features.map((f, i) => ({ ...f, title: ['Ìtọpinpin GPS Gidi', 'Ìkìlọ̀ Àgbègbè Ọlọ́gbọ́n', 'Olùrànlọ́wọ́ AI', 'Àwọn Ìfunni Àwùjọ', 'Ẹgbẹ́ Ìwádìí', 'Àṣírí Nípasẹ̀ Àpẹrẹ'][i] })),
  steps: en.steps.map((s, i) => ({ ...s, title: ['Gba & Forúkọsilẹ̀', 'Forúkọsilẹ̀ Ẹ̀rọ Ìtọpinpin', 'Fa Àwọn Àgbègbè Aabo', 'Darapọ̀ Mọ́ Àwùjọ', 'Jẹ́ kí AI Ràn Ọ́ Lọ́wọ́'][i] })),
  footerColumns: [
    { title: 'Ọjà', links: [{ label: 'Àwọn Ẹ̀yà', href: '#features' }, { label: 'Bí Ó Ṣe Ń Ṣiṣẹ', href: '#how-it-works' }, { label: 'Iye Owó', href: '#' }, { label: 'Changelog', href: '#' }] },
    { title: 'Àwùjọ', links: [{ label: 'Blog', href: '#' }, { label: 'Forum', href: '#' }, { label: 'Àwọn Alábàárọ̀', href: '#' }, { label: 'Open Source', href: 'https://github.com' }] },
    { title: 'Òfin', links: [{ label: 'Ìlànà Àṣírí', href: '#' }, { label: 'Àwọn Ìlànà Iṣẹ́', href: '#' }, { label: 'Kuki', href: '#' }, { label: 'GDPR', href: '#' }] },
  ],
}

const ha: Content = {
  navLinks: [
    { label: 'Fasali', section: 'features' },
    { label: 'Labari', section: 'story' },
    { label: 'Yadda Yake Aiki', section: 'how-it-works' },
    { label: 'Al\'umma', section: 'community' },
  ],
  chapters: en.chapters.map((c, i) => ({ ...c, title: ['Kiran da ya canza komai.', 'Danna ɗaya. Wurinta na ƙarshe.', 'Al\'umma ta amsa.', 'Ƙungiyar bincike, an tsara ta.', 'An sami Emma lafiya.'][i], body: c.body })),
  features: en.features.map((f, i) => ({ ...f, title: ['Bin Didigi GPS na Ainihi', 'Faɗakarwar Yanki Mai Hankali', 'Mataimaki na AI', 'Ciyarwar Al\'umma', 'Ƙungiyar Bincike', 'Sirri ta Ƙira'][i] })),
  steps: en.steps.map((s, i) => ({ ...s, title: ['Zazzage & Yi Rajista', 'Yi Rajista da Mai Bin Didigi', 'Zana Yankunan Aminci', 'Shiga Al\'umma', 'Bar AI Ya Taimaka'][i] })),
  footerColumns: [
    { title: 'Samfuri', links: [{ label: 'Fasali', href: '#features' }, { label: 'Yadda Yake Aiki', href: '#how-it-works' }, { label: 'Farashi', href: '#' }, { label: 'Changelog', href: '#' }] },
    { title: 'Al\'umma', links: [{ label: 'Blog', href: '#' }, { label: 'Forum', href: '#' }, { label: 'Abokan Hulɗa', href: '#' }, { label: 'Open Source', href: 'https://github.com' }] },
    { title: 'Doka', links: [{ label: 'Manufar Sirri', href: '#' }, { label: 'Sharuɗɗan Amfani', href: '#' }, { label: 'Kukis', href: '#' }, { label: 'GDPR', href: '#' }] },
  ],
}

const ig: Content = {
  navLinks: [
    { label: 'Atụmatụ', section: 'features' },
    { label: 'Akụkọ', section: 'story' },
    { label: 'Otu O Si Arụ Ọrụ', section: 'how-it-works' },
    { label: 'Obodo', section: 'community' },
  ],
  chapters: en.chapters.map((c, i) => ({ ...c, title: ['Oku nke gbanwere ihe niile.', 'Pịa otu. Ọnọdụ ya ikpeazụ.', 'Obodo zaghachi.', 'Otu ọchụchọ, edoziri.', 'A hụrụ Emma n\'ụlọ.'][i], body: c.body })),
  features: en.features.map((f, i) => ({ ...f, title: ['Nchaso GPS N\'oge', 'Ọkwa Mpaghara Ọgụgụ Isi', 'Onye Enyemaka AI', 'Nke Obodo', 'Otu Ọchụchọ', 'Nzuzo Site N\'Nhazi'][i] })),
  steps: en.steps.map((s, i) => ({ ...s, title: ['Budata & Debanye Aha', 'Debanye Ihe Nchaso', 'Ese Mpaghara Nchekwa', 'Sonyere Obodo', 'Kwe AI Ka O Nyere Aka'][i] })),
  footerColumns: [
    { title: 'Ngwaahịa', links: [{ label: 'Atụmatụ', href: '#features' }, { label: 'Otu O Si Arụ Ọrụ', href: '#how-it-works' }, { label: 'Ọnụ Ahịa', href: '#' }, { label: 'Changelog', href: '#' }] },
    { title: 'Obodo', links: [{ label: 'Blog', href: '#' }, { label: 'Forum', href: '#' }, { label: 'Ndị Mmekọ', href: '#' }, { label: 'Open Source', href: 'https://github.com' }] },
    { title: 'Iwu', links: [{ label: 'Iwu Nzuzo', href: '#' }, { label: 'Ọnọdụ Ọrụ', href: '#' }, { label: 'Kuki', href: '#' }, { label: 'GDPR', href: '#' }] },
  ],
}

export { yo, ha, ig }
