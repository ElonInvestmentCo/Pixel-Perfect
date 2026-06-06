export interface Country {
  flag: string;
  name: string;
  dialCode: string;
  minLen: number;
  maxLen: number;
}

export const COUNTRIES: Country[] = [
  { flag: "🇸🇬", name: "Singapore",      dialCode: "+65",  minLen: 8,  maxLen: 8  },
  { flag: "🇺🇸", name: "United States",  dialCode: "+1",   minLen: 10, maxLen: 10 },
  { flag: "🇬🇧", name: "United Kingdom", dialCode: "+44",  minLen: 10, maxLen: 10 },
  { flag: "🇦🇺", name: "Australia",      dialCode: "+61",  minLen: 9,  maxLen: 9  },
  { flag: "🇮🇳", name: "India",          dialCode: "+91",  minLen: 10, maxLen: 10 },
  { flag: "🇨🇳", name: "China",          dialCode: "+86",  minLen: 11, maxLen: 11 },
  { flag: "🇯🇵", name: "Japan",          dialCode: "+81",  minLen: 10, maxLen: 11 },
  { flag: "🇰🇷", name: "South Korea",    dialCode: "+82",  minLen: 9,  maxLen: 10 },
  { flag: "🇩🇪", name: "Germany",        dialCode: "+49",  minLen: 10, maxLen: 11 },
  { flag: "🇫🇷", name: "France",         dialCode: "+33",  minLen: 9,  maxLen: 9  },
  { flag: "🇮🇩", name: "Indonesia",      dialCode: "+62",  minLen: 9,  maxLen: 12 },
  { flag: "🇲🇾", name: "Malaysia",       dialCode: "+60",  minLen: 9,  maxLen: 10 },
  { flag: "🇵🇭", name: "Philippines",    dialCode: "+63",  minLen: 10, maxLen: 10 },
  { flag: "🇹🇭", name: "Thailand",       dialCode: "+66",  minLen: 9,  maxLen: 9  },
  { flag: "🇻🇳", name: "Vietnam",        dialCode: "+84",  minLen: 9,  maxLen: 10 },
  { flag: "🇧🇷", name: "Brazil",         dialCode: "+55",  minLen: 10, maxLen: 11 },
  { flag: "🇨🇦", name: "Canada",         dialCode: "+1",   minLen: 10, maxLen: 10 },
  { flag: "🇵🇰", name: "Pakistan",       dialCode: "+92",  minLen: 10, maxLen: 10 },
  { flag: "🇿🇦", name: "South Africa",   dialCode: "+27",  minLen: 9,  maxLen: 9  },
  { flag: "🇦🇪", name: "UAE",            dialCode: "+971", minLen: 9,  maxLen: 9  },
  { flag: "🇸🇦", name: "Saudi Arabia",   dialCode: "+966", minLen: 9,  maxLen: 9  },
  { flag: "🇳🇬", name: "Nigeria",        dialCode: "+234", minLen: 10, maxLen: 10 },
  { flag: "🇪🇬", name: "Egypt",          dialCode: "+20",  minLen: 10, maxLen: 10 },
  { flag: "🇹🇷", name: "Turkey",         dialCode: "+90",  minLen: 10, maxLen: 10 },
  { flag: "🇮🇹", name: "Italy",          dialCode: "+39",  minLen: 9,  maxLen: 10 },
  { flag: "🇪🇸", name: "Spain",          dialCode: "+34",  minLen: 9,  maxLen: 9  },
  { flag: "🇲🇽", name: "Mexico",         dialCode: "+52",  minLen: 10, maxLen: 10 },
  { flag: "🇷🇺", name: "Russia",         dialCode: "+7",   minLen: 10, maxLen: 10 },
  { flag: "🇳🇱", name: "Netherlands",    dialCode: "+31",  minLen: 9,  maxLen: 9  },
  { flag: "🇨🇭", name: "Switzerland",    dialCode: "+41",  minLen: 9,  maxLen: 9  },
];

export const DEFAULT_COUNTRY = COUNTRIES[0];
