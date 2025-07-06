// 100 most popular languages with their language codes and native names
const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'zh', name: 'Chinese (Simplified)', native: '中文 (简体)' },
  { code: 'zh-tw', name: 'Chinese (Traditional)', native: '中文 (繁體)' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'jv', name: 'Javanese', native: 'Basa Jawa' },
  { code: 'wu', name: 'Wu Chinese', native: '吴语' },
  { code: 'ms', name: 'Malay', native: 'Bahasa Melayu' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'yue', name: 'Cantonese', native: '粵語' },
  { code: 'th', name: 'Thai', native: 'ไทย' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'jin', name: 'Jin Chinese', native: '晋语' },
  { code: 'nan', name: 'Min Nan Chinese', native: '閩南語' },
  { code: 'fa', name: 'Persian', native: 'فارسی' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'pbu', name: 'Pashto', native: 'پښتو' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'xh', name: 'Xhosa', native: 'isiXhosa' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'my', name: 'Burmese', native: 'မြန်မာ' },
  { code: 'uk', name: 'Ukrainian', native: 'Українська' },
  { code: 'su', name: 'Sundanese', native: 'Basa Sunda' },
  { code: 'uz', name: 'Uzbek', native: 'Oʻzbekcha' },
  { code: 'sd', name: 'Sindhi', native: 'سنڌي' },
  { code: 'ro', name: 'Romanian', native: 'Română' },
  { code: 'tl', name: 'Tagalog', native: 'Tagalog' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्' },
  { code: 'he', name: 'Hebrew', native: 'עברית' },
  { code: 'cs', name: 'Czech', native: 'Čeština' },
  { code: 'el', name: 'Greek', native: 'Ελληνικά' },
  { code: 'be', name: 'Belarusian', native: 'Беларуская' },
  { code: 'hu', name: 'Hungarian', native: 'Magyar' },
  { code: 'qu', name: 'Quechua', native: 'Runa Simi' },
  { code: 'sv', name: 'Swedish', native: 'Svenska' },
  { code: 'si', name: 'Sinhala', native: 'සිංහල' },
  { code: 'km', name: 'Khmer', native: 'ភាសាខ្មែរ' },
  { code: 'da', name: 'Danish', native: 'Dansk' },
  { code: 'fi', name: 'Finnish', native: 'Suomi' },
  { code: 'sk', name: 'Slovak', native: 'Slovenčina' },
  { code: 'no', name: 'Norwegian', native: 'Norsk' },
  { code: 'lv', name: 'Latvian', native: 'Latviešu' },
  { code: 'sl', name: 'Slovenian', native: 'Slovenščina' },
  { code: 'et', name: 'Estonian', native: 'Eesti' },
  { code: 'lt', name: 'Lithuanian', native: 'Lietuvių' },
  { code: 'bg', name: 'Bulgarian', native: 'Български' },
  { code: 'hr', name: 'Croatian', native: 'Hrvatski' },
  { code: 'eu', name: 'Basque', native: 'Euskera' },
  { code: 'is', name: 'Icelandic', native: 'Íslenska' },
  { code: 'ga', name: 'Irish', native: 'Gaeilge' },
  { code: 'mt', name: 'Maltese', native: 'Malti' },
  { code: 'af', name: 'Afrikaans', native: 'Afrikaans' },
  { code: 'sq', name: 'Albanian', native: 'Shqip' },
  { code: 'az', name: 'Azerbaijani', native: 'Azərbaycan' },
  { code: 'hy', name: 'Armenian', native: 'Հայերեն' },
  { code: 'ka', name: 'Georgian', native: 'ქართული' },
  { code: 'mk', name: 'Macedonian', native: 'Македонски' },
  { code: 'sr', name: 'Serbian', native: 'Српски' },
  { code: 'bs', name: 'Bosnian', native: 'Bosanski' },
  { code: 'me', name: 'Montenegrin', native: 'Crnogorski' },
  { code: 'cy', name: 'Welsh', native: 'Cymraeg' },
  { code: 'gd', name: 'Scottish Gaelic', native: 'Gàidhlig' },
  { code: 'br', name: 'Breton', native: 'Brezhoneg' },
  { code: 'co', name: 'Corsican', native: 'Corsu' },
  { code: 'fy', name: 'Frisian', native: 'Frysk' },
  { code: 'lb', name: 'Luxembourgish', native: 'Lëtzebuergesch' },
  { code: 'rm', name: 'Romansh', native: 'Rumantsch' },
  { code: 'fo', name: 'Faroese', native: 'Føroyskt' },
  { code: 'kl', name: 'Greenlandic', native: 'Kalaallisut' },
  { code: 'mi', name: 'Maori', native: 'Te Reo Māori' },
  { code: 'sm', name: 'Samoan', native: 'Gagana Samoa' },
  { code: 'to', name: 'Tongan', native: 'Lea Faka-Tonga' },
  { code: 'fj', name: 'Fijian', native: 'Na Vosa Vakaviti' },
  { code: 'haw', name: 'Hawaiian', native: 'ʻŌlelo Hawaiʻi' },
  { code: 'mg', name: 'Malagasy', native: 'Malagasy' },
  { code: 'ny', name: 'Chichewa', native: 'Chichewa' },
  { code: 'sn', name: 'Shona', native: 'ChiShona' },
  { code: 'zu', name: 'Zulu', native: 'isiZulu' },
  { code: 'st', name: 'Sesotho', native: 'Sesotho' },
  { code: 'tn', name: 'Setswana', native: 'Setswana' },
  { code: 'ss', name: 'Swati', native: 'siSwati' },
  { code: 've', name: 'Venda', native: 'Tshivenḓa' },
  { code: 'ts', name: 'Tsonga', native: 'Xitsonga' },
  { code: 'nr', name: 'Ndebele', native: 'isiNdebele' },
  { code: 'sw', name: 'Swahili', native: 'Kiswahili' },
  { code: 'rw', name: 'Kinyarwanda', native: 'Ikinyarwanda' },
  { code: 'rn', name: 'Kirundi', native: 'Ikirundi' },
  { code: 'lg', name: 'Luganda', native: 'Luganda' },
  { code: 'ak', name: 'Akan', native: 'Akan' },
  { code: 'tw', name: 'Twi', native: 'Twi' },
  { code: 'ff', name: 'Fulfulde', native: 'Fulfulde' },
  { code: 'ha', name: 'Hausa', native: 'Hausa' },
  { code: 'ig', name: 'Igbo', native: 'Igbo' },
  { code: 'yo', name: 'Yoruba', native: 'Yorùbá' },
  { code: 'am', name: 'Amharic', native: 'አማርኛ' },
  { code: 'ti', name: 'Tigrinya', native: 'ትግርኛ' },
  { code: 'om', name: 'Oromo', native: 'Afaan Oromoo' },
  { code: 'so', name: 'Somali', native: 'Soomaali' }
];

// Remove duplicates and ensure we have exactly 100 unique languages
const uniqueLanguages = LANGUAGES.filter((lang, index, self) => 
  index === self.findIndex(l => l.code === lang.code)
).slice(0, 100);

// Language code mapping utility for Google Translate
// Most ISO codes are identical; only handle known special cases
function mapCodeForGoogle(c) {
  const table = { 
    'zh': 'zh-CN',     // Chinese (Simplified)
    'zh-tw': 'zh-TW',  // Chinese (Traditional)
    'pt': 'pt',        // Portuguese (same as ISO)
    'yue': 'zh-TW'     // Cantonese -> Chinese (Traditional)
    /* Add more mappings here as needed */
  };
  return table[c] || c;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LANGUAGES: uniqueLanguages, mapCodeForGoogle };
} else {
  window.LANGUAGES = uniqueLanguages;
  window.mapCodeForGoogle = mapCodeForGoogle;
}
