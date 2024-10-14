/* eslint-disable no-unused-vars */
const countryCodes = {
  ad: 'Andorra',
  ae: 'United Arab Emirates',
  af: 'Afghanistan',
  ag: 'Antigua and Barbuda',
  ai: 'Anguilla',
  al: 'Albania',
  am: 'Armenia',
  an: 'Netherlands Antilles',
  ao: 'Angola',
  aq: 'Antarctica',
  ar: 'Argentina',
  as: 'American Samoa',
  at: 'Austria',
  au: 'Australia',
  aw: 'Aruba',
  ax: 'Aland Islands',
  az: 'Azerbaijan',
  ba: 'Bosnia and Herzegovina',
  bb: 'Barbados',
  bd: 'Bangladesh',
  be: 'Belgium',
  bf: 'Burkina Faso',
  bg: 'Bulgaria',
  bh: 'Bahrain',
  bi: 'Burundi',
  bj: 'Benin',
  bm: 'Bermuda',
  bn: 'Brunei Darussalam',
  bo: 'Bolivia',
  br: 'Brazil',
  bs: 'Bahamas',
  bt: 'Bhutan',
  bv: 'Bouvet Island',
  bw: 'Botswana',
  by: 'Belarus',
  bz: 'Belize',
  ca: 'Canada',
  cb: 'Caribbean Nations',
  cc: 'Cocos (Keeling) Islands',
  cd: 'Democratic Republic of the Congo',
  cf: 'Central African Republic',
  cg: 'Congo',
  ch: 'Switzerland',
  ci: "Cote D'Ivoire (Ivory Coast)",
  ck: 'Cook Islands',
  cl: 'Chile',
  cm: 'Cameroon',
  cn: 'China',
  co: 'Colombia',
  cr: 'Costa Rica',
  cs: 'Serbia',
  cu: 'Cuba',
  cv: 'Cabo Verde',
  cx: 'Christmas Island',
  cy: 'Cyprus',
  cz: 'Czech Republic',
  de: 'Germany',
  dj: 'Djibouti',
  dk: 'Denmark',
  dm: 'Dominica',
  do: 'Dominican Republic',
  dz: 'Algeria',
  ec: 'Ecuador',
  ee: 'Estonia',
  eg: 'Egypt',
  er: 'Eritrea',
  es: 'Spain',
  et: 'Ethiopia',
  fi: 'Finland',
  fj: 'Fiji',
  fk: 'Falkland Islands',
  fm: 'Federated States of Micronesia',
  fo: 'Faroe Islands',
  fr: 'France',
  fx: 'France, Metropolitan',
  ga: 'Gabon',
  gb: 'United Kingdom',
  gd: 'Grenada',
  ge: 'Georgia',
  gf: 'French Guiana',
  gh: 'Ghana',
  gi: 'Gibraltar',
  gl: 'Greenland',
  gm: 'Gambia',
  gn: 'Guinea',
  gp: 'Guadeloupe',
  gq: 'Equatorial Guinea',
  gr: 'Greece',
  gs: 'S. Georgia and S. Sandwich Islands',
  gt: 'Guatemala',
  gu: 'Guam',
  gw: 'Guinea-Bissau',
  gy: 'Guyana',
  hk: 'Hong Kong SAR',
  hm: 'Heard Island and McDonald Islands',
  hn: 'Honduras',
  hr: 'Croatia',
  ht: 'Haiti',
  hu: 'Hungary',
  id: 'Indonesia',
  ie: 'Ireland',
  il: 'Israel',
  in: 'India',
  io: 'British Indian Ocean Territory',
  iq: 'Iraq',
  ir: 'Iran',
  is: 'Iceland',
  it: 'Italy',
  jm: 'Jamaica',
  jo: 'Jordan',
  jp: 'Japan',
  ke: 'Kenya',
  kg: 'Kyrgyzstan',
  kh: 'Cambodia',
  ki: 'Kiribati',
  km: 'Comoros',
  kn: 'Saint Kitts and Nevis',
  kp: 'Korea (North)',
  kr: 'Korea',
  kw: 'Kuwait',
  ky: 'Cayman Islands',
  kz: 'Kazakhstan',
  la: 'Laos',
  lb: 'Lebanon',
  lc: 'Saint Lucia',
  li: 'Liechtenstein',
  lk: 'Sri Lanka',
  lr: 'Liberia',
  ls: 'Lesotho',
  lt: 'Lithuania',
  lu: 'Luxembourg',
  lv: 'Latvia',
  ly: 'Libya',
  ma: 'Morocco',
  mc: 'Monaco',
  md: 'Moldova',
  mg: 'Madagascar',
  mh: 'Marshall Islands',
  mk: 'North Macedonia',
  ml: 'Mali',
  mm: 'Myanmar',
  mn: 'Mongolia',
  mo: 'Macao SAR',
  mp: 'Northern Mariana Islands',
  mq: 'Martinique',
  mr: 'Mauritania',
  ms: 'Montserrat',
  mt: 'Malta',
  mu: 'Mauritius',
  mv: 'Maldives',
  mw: 'Malawi',
  mx: 'Mexico',
  my: 'Malaysia',
  mz: 'Mozambique',
  na: 'Namibia',
  nc: 'New Caledonia',
  ne: 'Niger',
  nf: 'Norfolk Island',
  ng: 'Nigeria',
  ni: 'Nicaragua',
  nl: 'Netherlands',
  no: 'Norway',
  np: 'Nepal',
  nr: 'Nauru',
  nu: 'Niue',
  nz: 'New Zealand',
  om: 'Sultanate of Oman',
  oo: 'Other',
  pa: 'Panama',
  pe: 'Peru',
  pf: 'French Polynesia',
  pg: 'Papua New Guinea',
  ph: 'Philippines',
  pk: 'Pakistan',
  pl: 'Poland',
  pm: 'Saint Pierre and Miquelon',
  pn: 'Pitcairn',
  pr: 'Puerto Rico',
  ps: 'Palestinian Authority',
  pt: 'Portugal',
  pw: 'Palau',
  py: 'Paraguay',
  qa: 'Qatar',
  re: 'Reunion',
  ro: 'Romania',
  ru: 'Russian Federation',
  rw: 'Rwanda',
  sa: 'Saudi Arabia',
  sb: 'Solomon Islands',
  sc: 'Seychelles',
  sd: 'Sudan',
  se: 'Sweden',
  sg: 'Singapore',
  sh: 'St Helena, Ascension, Tristan da Cunha',
  si: 'Slovenia',
  sj: 'Svalbard and Jan Mayen',
  sk: 'Slovak Republic',
  sl: 'Sierra Leone',
  sm: 'San Marino',
  sn: 'Senegal',
  so: 'Somalia',
  sr: 'Suriname',
  st: 'São Tomé and Príncipe',
  sv: 'El Salvador',
  sy: 'Syria',
  sz: 'Swaziland',
  tc: 'Turks and Caicos Islands',
  td: 'Chad',
  tf: 'French Southern Territories',
  tg: 'Togo',
  th: 'Thailand',
  tj: 'Tajikistan',
  tk: 'Tokelau',
  tl: 'Timor-Leste',
  tm: 'Turkmenistan',
  tn: 'Tunisia',
  to: 'Tonga',
  tp: 'Timor-Leste',
  tr: 'Türkiye',
  tt: 'Trinidad and Tobago',
  tv: 'Tuvalu',
  tw: 'Taiwan',
  tz: 'Tanzania',
  ua: 'Ukraine',
  ug: 'Uganda',
  us: 'United States',
  uy: 'Uruguay',
  uz: 'Uzbekistan',
  va: 'Vatican City State (Holy See)',
  vc: 'Saint Vincent and the Grenadines',
  ve: 'Venezuela',
  vg: 'Virgin Islands (British)',
  vi: 'Virgin Islands (U.S.)',
  vn: 'Vietnam',
  vu: 'Vanuatu',
  wf: 'Wallis and Futuna',
  ws: 'Samoa',
  ye: 'Yemen',
  yt: 'Mayotte',
  za: 'South Africa',
  zm: 'Zambia',
  zw: 'Zimbabwe'
}

const SeniorityCodes = {
  1: 'Unpaid',
  2: 'Training',
  3: 'Entry-level',
  4: 'Senior',
  5: 'Manager',
  6: 'Director',
  7: 'Vice President (VP)',
  8: 'Chief X Officer (CxO)',
  9: 'Partner',
  10: 'Owner'
}

// Color mappings for displaying changes
const colorMapping = {
  Account: '#FF5733', // Bright Red
  'Associated Entity': '#33C3FF', // Light Blue
  'Audience Expansion': '#28A745', // Green
  'Campaign Group': '#AF7AC5', // Purple
  'Cost Type': '#FFB533', // Orange
  'Creative Selection': '#FF69B4', // Pink
  'Daily Budget': '#17A2B8', // Cyan
  Format: '#FFD700', // Gold/Yellow
  ID: '#FF33C9', // Magenta
  Locale: '#8B4513', // Saddle Brown
  Name: '#32CD32', // Lime Green
  'Objective Type': '#000080', // Navy Blue
  'Offsite Delivery': '#808000', // Olive Green
  'Offsite Preferences': '#20B2AA', // Light Sea Green
  'Optimization Target Type': '#800000', // Maroon
  'Pacing Strategy': '#FF4500', // Orange Red
  'Run Schedule': '#4682B4', // Steel Blue
  'Serving Statuses': '#1E90FF', // Dodger Blue
  Status: '#228B22', // Forest Green
  'Story Delivery': '#DC143C', // Crimson Red
  'Targeting Criteria': '#FF8C00', // Dark Orange
  Test: '#00CED1', // Dark Turquoise
  Type: '#9932CC', // Dark Orchid
  'Unit Cost': '#DAA520', // Goldenrod
  Version: '#FF6347' // Tomato
}

// Key mappings for differences
const keyMapping = {
  account: 'Account',
  associatedEntity: 'Associated Entity',
  audienceExpansionEnabled: 'Audience Expansion',
  campaignGroup: 'Campaign Group',
  costType: 'Cost Type',
  creativeSelection: 'Creative Selection',
  dailyBudget: 'Daily Budget',
  format: 'Format',
  id: 'ID',
  locale: 'Locale',
  name: 'Name',
  objectiveType: 'Objective Type',
  offsiteDeliveryEnabled: 'Offsite Delivery',
  offsitePreferences: 'Offsite Preferences',
  optimizationTargetType: 'Optimization Target Type',
  pacingStrategy: 'Pacing Strategy',
  runSchedule: 'Run Schedule',
  servingStatuses: 'Serving Statuses',
  status: 'Status',
  storyDeliveryEnabled: 'Story Delivery',
  targetingCriteria: 'Targeting Criteria',
  test: 'Test',
  type: 'Campaign Type',
  unitCost: 'Unit Cost',
  version: 'Version'
}
export { countryCodes, SeniorityCodes, colorMapping, keyMapping }