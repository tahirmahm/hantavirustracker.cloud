export interface GeoEntry {
  name: string
  aliases: string[]
  lat: number
  lng: number
  iso2: string
}

export const COUNTRY_CENTROIDS: GeoEntry[] = [
  { name: 'Afghanistan', aliases: ['afghan'], lat: 33.93, lng: 67.71, iso2: 'AF' },
  { name: 'Albania', aliases: ['albanian'], lat: 41.15, lng: 20.17, iso2: 'AL' },
  { name: 'Algeria', aliases: ['algerian'], lat: 28.03, lng: 1.66, iso2: 'DZ' },
  { name: 'Angola', aliases: ['angolan'], lat: -11.20, lng: 17.87, iso2: 'AO' },
  { name: 'Argentina', aliases: ['argentine', 'argentinian', 'buenos aires', 'patagonia', 'andes'], lat: -38.42, lng: -63.62, iso2: 'AR' },
  { name: 'Armenia', aliases: ['armenian'], lat: 40.07, lng: 45.04, iso2: 'AM' },
  { name: 'Australia', aliases: ['australian'], lat: -25.27, lng: 133.78, iso2: 'AU' },
  { name: 'Austria', aliases: ['austrian', 'vienna'], lat: 47.52, lng: 14.55, iso2: 'AT' },
  { name: 'Azerbaijan', aliases: ['azerbaijani', 'baku'], lat: 40.14, lng: 47.58, iso2: 'AZ' },
  { name: 'Bangladesh', aliases: ['bangladeshi', 'dhaka'], lat: 23.68, lng: 90.36, iso2: 'BD' },
  { name: 'Belarus', aliases: ['belarusian', 'belorussian'], lat: 53.71, lng: 27.95, iso2: 'BY' },
  { name: 'Belgium', aliases: ['belgian', 'brussels'], lat: 50.50, lng: 4.47, iso2: 'BE' },
  { name: 'Bolivia', aliases: ['bolivian', 'la paz'], lat: -16.29, lng: -63.59, iso2: 'BO' },
  { name: 'Bosnia', aliases: ['bosnian', 'herzegovina', 'sarajevo'], lat: 43.92, lng: 17.68, iso2: 'BA' },
  { name: 'Brazil', aliases: ['brazilian', 'amazon', 'sao paulo', 'rio de janeiro'], lat: -14.24, lng: -51.93, iso2: 'BR' },
  { name: 'Bulgaria', aliases: ['bulgarian', 'sofia'], lat: 42.73, lng: 25.49, iso2: 'BG' },
  { name: 'Cambodia', aliases: ['cambodian', 'phnom penh'], lat: 12.57, lng: 104.99, iso2: 'KH' },
  { name: 'Canada', aliases: ['canadian', 'ontario', 'british columbia', 'quebec', 'alberta', 'manitoba', 'saskatchewan'], lat: 56.13, lng: -106.35, iso2: 'CA' },
  { name: 'Chile', aliases: ['chilean', 'santiago', 'chilean patagonia', 'andes mountains'], lat: -35.68, lng: -71.54, iso2: 'CL' },
  { name: 'China', aliases: ['chinese', 'beijing', 'shanghai', 'wuhan', 'yunnan', 'xinjiang', 'guangdong', 'sichuan'], lat: 35.86, lng: 104.20, iso2: 'CN' },
  { name: 'Colombia', aliases: ['colombian', 'bogota'], lat: 4.57, lng: -74.30, iso2: 'CO' },
  { name: 'Congo', aliases: ['congolese', 'drc', 'democratic republic of the congo', 'kinshasa'], lat: -4.04, lng: 21.76, iso2: 'CD' },
  { name: 'Croatia', aliases: ['croatian', 'zagreb'], lat: 45.10, lng: 15.20, iso2: 'HR' },
  { name: 'Cuba', aliases: ['cuban', 'havana'], lat: 21.52, lng: -79.00, iso2: 'CU' },
  { name: 'Czech Republic', aliases: ['czech', 'czechia', 'prague'], lat: 49.82, lng: 15.47, iso2: 'CZ' },
  { name: 'Denmark', aliases: ['danish', 'copenhagen'], lat: 56.26, lng: 9.50, iso2: 'DK' },
  { name: 'Ecuador', aliases: ['ecuadorian', 'quito'], lat: -1.83, lng: -78.18, iso2: 'EC' },
  { name: 'Egypt', aliases: ['egyptian', 'cairo'], lat: 26.82, lng: 30.80, iso2: 'EG' },
  { name: 'Ethiopia', aliases: ['ethiopian', 'addis ababa'], lat: 9.15, lng: 40.49, iso2: 'ET' },
  { name: 'Finland', aliases: ['finnish', 'helsinki', 'lapland'], lat: 61.92, lng: 25.75, iso2: 'FI' },
  { name: 'France', aliases: ['french', 'paris', 'lyon'], lat: 46.23, lng: 2.21, iso2: 'FR' },
  { name: 'Germany', aliases: ['german', 'berlin', 'munich', 'hamburg', 'frankfurt', 'bavaria', 'saxony'], lat: 51.17, lng: 10.45, iso2: 'DE' },
  { name: 'Greece', aliases: ['greek', 'athens'], lat: 39.07, lng: 21.82, iso2: 'GR' },
  { name: 'Hungary', aliases: ['hungarian', 'budapest'], lat: 47.16, lng: 19.50, iso2: 'HU' },
  { name: 'India', aliases: ['indian', 'delhi', 'mumbai', 'bangalore', 'kolkata', 'rajasthan', 'uttar pradesh'], lat: 20.59, lng: 78.96, iso2: 'IN' },
  { name: 'Indonesia', aliases: ['indonesian', 'jakarta', 'bali', 'java', 'sumatra', 'kalimantan'], lat: -0.79, lng: 113.92, iso2: 'ID' },
  { name: 'Iran', aliases: ['iranian', 'persian', 'tehran'], lat: 32.43, lng: 53.69, iso2: 'IR' },
  { name: 'Iraq', aliases: ['iraqi', 'baghdad'], lat: 33.22, lng: 43.68, iso2: 'IQ' },
  { name: 'Israel', aliases: ['israeli', 'tel aviv', 'jerusalem'], lat: 31.05, lng: 34.85, iso2: 'IL' },
  { name: 'Italy', aliases: ['italian', 'rome', 'milan', 'sicily', 'lombardy'], lat: 41.87, lng: 12.57, iso2: 'IT' },
  { name: 'Japan', aliases: ['japanese', 'tokyo', 'osaka', 'hokkaido', 'kyushu'], lat: 36.20, lng: 138.25, iso2: 'JP' },
  { name: 'Kazakhstan', aliases: ['kazakh', 'astana', 'almaty'], lat: 48.02, lng: 66.92, iso2: 'KZ' },
  { name: 'Kenya', aliases: ['kenyan', 'nairobi'], lat: -0.02, lng: 37.91, iso2: 'KE' },
  { name: 'Kyrgyzstan', aliases: ['kyrgyz', 'bishkek'], lat: 41.20, lng: 74.77, iso2: 'KG' },
  { name: 'Laos', aliases: ['lao', 'laotian', 'vientiane'], lat: 19.86, lng: 102.50, iso2: 'LA' },
  { name: 'Latvia', aliases: ['latvian', 'riga'], lat: 56.88, lng: 24.60, iso2: 'LV' },
  { name: 'Lithuania', aliases: ['lithuanian', 'vilnius'], lat: 55.17, lng: 23.88, iso2: 'LT' },
  { name: 'Malaysia', aliases: ['malaysian', 'kuala lumpur', 'sabah', 'sarawak', 'borneo'], lat: 4.21, lng: 108.01, iso2: 'MY' },
  { name: 'Mexico', aliases: ['mexican', 'mexico city', 'guadalajara', 'monterrey', 'yucatan'], lat: 23.63, lng: -102.55, iso2: 'MX' },
  { name: 'Mongolia', aliases: ['mongolian', 'ulaanbaatar', 'gobi'], lat: 46.86, lng: 103.85, iso2: 'MN' },
  { name: 'Morocco', aliases: ['moroccan', 'casablanca', 'rabat'], lat: 31.79, lng: -7.09, iso2: 'MA' },
  { name: 'Mozambique', aliases: ['mozambican', 'maputo'], lat: -18.67, lng: 35.53, iso2: 'MZ' },
  { name: 'Myanmar', aliases: ['burmese', 'burma', 'yangon', 'mandalay'], lat: 17.00, lng: 96.00, iso2: 'MM' },
  { name: 'Nepal', aliases: ['nepali', 'kathmandu', 'himalaya'], lat: 28.39, lng: 84.12, iso2: 'NP' },
  { name: 'Netherlands', aliases: ['dutch', 'amsterdam', 'rotterdam'], lat: 52.13, lng: 5.29, iso2: 'NL' },
  { name: 'New Zealand', aliases: ['new zealander', 'kiwi', 'auckland', 'wellington'], lat: -40.90, lng: 174.89, iso2: 'NZ' },
  { name: 'Nigeria', aliases: ['nigerian', 'lagos', 'abuja'], lat: 9.08, lng: 8.68, iso2: 'NG' },
  { name: 'North Korea', aliases: ['north korean', 'dprk', 'pyongyang'], lat: 40.34, lng: 127.51, iso2: 'KP' },
  { name: 'Norway', aliases: ['norwegian', 'oslo'], lat: 60.47, lng: 8.47, iso2: 'NO' },
  { name: 'Pakistan', aliases: ['pakistani', 'islamabad', 'karachi', 'lahore'], lat: 30.38, lng: 69.35, iso2: 'PK' },
  { name: 'Panama', aliases: ['panamanian', 'panama city'], lat: 8.54, lng: -80.78, iso2: 'PA' },
  { name: 'Papua New Guinea', aliases: ['png', 'papua', 'new guinea'], lat: -6.31, lng: 143.96, iso2: 'PG' },
  { name: 'Paraguay', aliases: ['paraguayan', 'asuncion'], lat: -23.44, lng: -58.44, iso2: 'PY' },
  { name: 'Peru', aliases: ['peruvian', 'lima', 'amazon peru', 'cusco'], lat: -9.19, lng: -75.02, iso2: 'PE' },
  { name: 'Philippines', aliases: ['filipino', 'manila', 'mindanao', 'luzon', 'cebu'], lat: 12.88, lng: 121.77, iso2: 'PH' },
  { name: 'Poland', aliases: ['polish', 'warsaw', 'krakow', 'silesia'], lat: 51.92, lng: 19.15, iso2: 'PL' },
  { name: 'Portugal', aliases: ['portuguese', 'lisbon'], lat: 39.40, lng: -8.22, iso2: 'PT' },
  { name: 'Romania', aliases: ['romanian', 'bucharest', 'transylvania'], lat: 45.94, lng: 24.97, iso2: 'RO' },
  { name: 'Russia', aliases: ['russian', 'moscow', 'siberia', 'ural', 'far east', 'vladivostok', 'saint petersburg', 'russia federation', 'russian federation'], lat: 61.52, lng: 105.32, iso2: 'RU' },
  { name: 'Saudi Arabia', aliases: ['saudi', 'riyadh', 'mecca', 'jeddah'], lat: 23.89, lng: 45.08, iso2: 'SA' },
  { name: 'Serbia', aliases: ['serbian', 'belgrade'], lat: 44.02, lng: 21.01, iso2: 'RS' },
  { name: 'Slovakia', aliases: ['slovak', 'bratislava'], lat: 48.67, lng: 19.70, iso2: 'SK' },
  { name: 'Slovenia', aliases: ['slovenian', 'ljubljana'], lat: 46.15, lng: 14.99, iso2: 'SI' },
  { name: 'Somalia', aliases: ['somali', 'mogadishu'], lat: 5.15, lng: 46.20, iso2: 'SO' },
  { name: 'South Africa', aliases: ['south african', 'johannesburg', 'cape town', 'pretoria'], lat: -30.56, lng: 22.94, iso2: 'ZA' },
  { name: 'South Korea', aliases: ['south korean', 'korean', 'seoul', 'busan'], lat: 35.91, lng: 127.77, iso2: 'KR' },
  { name: 'Spain', aliases: ['spanish', 'madrid', 'barcelona', 'castile', 'catalonia', 'andalusia'], lat: 40.46, lng: -3.75, iso2: 'ES' },
  { name: 'Sudan', aliases: ['sudanese', 'khartoum'], lat: 12.86, lng: 30.22, iso2: 'SD' },
  { name: 'Sweden', aliases: ['swedish', 'stockholm', 'scandinavia'], lat: 60.13, lng: 18.64, iso2: 'SE' },
  { name: 'Switzerland', aliases: ['swiss', 'bern', 'geneva', 'zurich'], lat: 46.82, lng: 8.23, iso2: 'CH' },
  { name: 'Syria', aliases: ['syrian', 'damascus', 'aleppo'], lat: 34.80, lng: 38.99, iso2: 'SY' },
  { name: 'Taiwan', aliases: ['taiwanese', 'taipei'], lat: 23.70, lng: 120.96, iso2: 'TW' },
  { name: 'Tajikistan', aliases: ['tajik', 'dushanbe'], lat: 38.86, lng: 71.28, iso2: 'TJ' },
  { name: 'Tanzania', aliases: ['tanzanian', 'dar es salaam', 'kilimanjaro'], lat: -6.37, lng: 34.89, iso2: 'TZ' },
  { name: 'Thailand', aliases: ['thai', 'bangkok', 'chiang mai', 'phuket'], lat: 15.87, lng: 100.99, iso2: 'TH' },
  { name: 'Turkey', aliases: ['turkish', 'ankara', 'istanbul', 'anatolia'], lat: 38.96, lng: 35.24, iso2: 'TR' },
  { name: 'Turkmenistan', aliases: ['turkmen', 'ashgabat'], lat: 38.97, lng: 59.56, iso2: 'TM' },
  { name: 'Uganda', aliases: ['ugandan', 'kampala'], lat: 1.37, lng: 32.29, iso2: 'UG' },
  { name: 'Ukraine', aliases: ['ukrainian', 'kyiv', 'kiev', 'kharkiv', 'odessa', 'donetsk'], lat: 48.38, lng: 31.17, iso2: 'UA' },
  { name: 'United Kingdom', aliases: ['british', 'england', 'scotland', 'wales', 'london', 'uk', 'great britain'], lat: 55.38, lng: -3.44, iso2: 'GB' },
  { name: 'United States', aliases: ['american', 'usa', 'us', 'new york', 'california', 'texas', 'arizona', 'new mexico', 'nevada', 'colorado', 'montana', 'wyoming', 'four corners', 'southwest usa', 'appalachia'], lat: 37.09, lng: -95.71, iso2: 'US' },
  { name: 'Uruguay', aliases: ['uruguayan', 'montevideo'], lat: -32.52, lng: -55.77, iso2: 'UY' },
  { name: 'Uzbekistan', aliases: ['uzbek', 'tashkent', 'samarkand'], lat: 41.38, lng: 64.59, iso2: 'UZ' },
  { name: 'Venezuela', aliases: ['venezuelan', 'caracas'], lat: 6.42, lng: -66.59, iso2: 'VE' },
  { name: 'Vietnam', aliases: ['vietnamese', 'hanoi', 'ho chi minh city', 'saigon'], lat: 14.06, lng: 108.28, iso2: 'VN' },
  { name: 'Yemen', aliases: ['yemeni', 'sanaa'], lat: 15.55, lng: 48.52, iso2: 'YE' },
  { name: 'Zimbabwe', aliases: ['zimbabwean', 'harare'], lat: -19.02, lng: 29.15, iso2: 'ZW' },
]

export interface ResolvedLocation {
  country: string
  lat: number
  lng: number
  iso2: string
}

export function resolveLocation(text: string): ResolvedLocation | null {
  if (!text) return null
  const lower = text.toLowerCase()

  for (const entry of COUNTRY_CENTROIDS) {
    if (lower.includes(entry.name.toLowerCase())) {
      return { country: entry.name, lat: entry.lat, lng: entry.lng, iso2: entry.iso2 }
    }
    for (const alias of entry.aliases) {
      if (lower.includes(alias.toLowerCase())) {
        return { country: entry.name, lat: entry.lat, lng: entry.lng, iso2: entry.iso2 }
      }
    }
  }
  return null
}

export function resolveAllLocations(text: string): ResolvedLocation[] {
  if (!text) return []
  const lower = text.toLowerCase()
  const found: ResolvedLocation[] = []
  const seen = new Set<string>()

  for (const entry of COUNTRY_CENTROIDS) {
    const matched =
      lower.includes(entry.name.toLowerCase()) ||
      entry.aliases.some(a => lower.includes(a.toLowerCase()))

    if (matched && !seen.has(entry.iso2)) {
      seen.add(entry.iso2)
      found.push({ country: entry.name, lat: entry.lat, lng: entry.lng, iso2: entry.iso2 })
    }
  }
  return found
}
