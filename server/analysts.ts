import type { Analyst, ResearchExample } from '../src/contracts.ts';

// Identity references verified 2026-09-12. Selection is editorial, not a skill ranking.
export const analysts: Analyst[] = [
  { account: 'WxOntario1', name: 'Ontario Weather', organization: 'Ontario Weather', focus: 'Existing Ontario weather source.', profileUrl: 'https://x.com/WxOntario1', verificationUrl: 'https://x.com/WxOntario1', existing: true },
  { account: 'AnthonyFarnell', name: 'Anthony Farnell', organization: 'Global News', focus: 'Ontario weather outlooks and storm timing.', profileUrl: 'https://x.com/AnthonyFarnell', verificationUrl: 'https://globalnews.ca/author/anthony-farnell/' },
  { account: 'StormhunterTWN', name: 'Mark Robinson', organization: 'The Weather Network', focus: 'Storm evolution and field observations; separate reports from advance predictions.', profileUrl: 'https://x.com/StormhunterTWN', verificationUrl: 'https://www.theweathernetwork.com/en/news/author/mark-robinson' },
  { account: 'gtaweather1', name: 'Doug Gillham', organization: 'The Weather Network', focus: 'GTA daily outlooks, temperature changes and precipitation windows.', profileUrl: 'https://x.com/gtaweather1', verificationUrl: 'https://www.theweathernetwork.com/en/news/author/dr-doug-gillham' },
  { account: 'ChrisScottWx', name: 'Chris Scott', organization: 'The Weather Network', focus: 'Forecast reasoning, model disagreement and larger weather patterns.', profileUrl: 'https://x.com/ChrisScottWx', verificationUrl: 'https://www.theweathernetwork.com/en/news/author/chris-scott' },
  { account: 'Ross_Hull', name: 'Ross Hull', organization: 'Global News', focus: 'Toronto forecasts and observation context.', profileUrl: 'https://x.com/Ross_Hull', verificationUrl: 'https://globalnews.ca/author/ross-hull/' },
];
export function findAnalyst(account: string) { return analysts.find(a => a.account.toLowerCase() === account.replace(/^@/, '').toLowerCase()); }

// Public, dated research summaries. They are not Computer Use captures or scorable claims.
export const researchExamples: ResearchExample[] = [
  { account: 'AnthonyFarnell', publishedDate: '2026-07-17', sourceUrl: 'https://globalnews.ca/news/11969785/canadian-armed-forces-standby-ontario-wildfires/', sourceType: 'Employer-hosted X embed', summary: 'Rain could reduce Ontario fires and smoke, while lightning could start new fires.', treatment: 'Historical qualitative outlook; no numeric probability.' },
  { account: 'StormhunterTWN', publishedDate: '2020-07-30', sourceUrl: 'https://www.theweathernetwork.com/en/news/weather/forecasts/is-that-a-tornado-ontario-proves-to-be-oddball-of-storm-development', sourceType: 'Author article', summary: 'Local wind shear and outflow boundaries can organize Ontario storms unexpectedly.', treatment: 'Retrospective storm explanation; cannot be scored as an advance prediction.' },
  { account: 'gtaweather1', publishedDate: '2026-02-25', sourceUrl: 'https://www.theweathernetwork.com/en/news/weather/seasonal/ontario-2026-spring-forecast', sourceType: 'Author outlook', summary: 'Spring warmth could be interrupted by cold, snow and ice; the later seasonal pattern remained uncertain.', treatment: 'Seasonal outlook; not comparable to a single hourly event.' },
  { account: 'ChrisScottWx', publishedDate: '2026-08-19', sourceUrl: 'https://www.linkedin.com/pulse/ai-revolutionizing-weather-forecasting-wont-solve-pelmorexcorp-tpmwc', sourceType: 'Employer publication', summary: 'Lake-effect experience informed higher Toronto snowfall forecasts when models disagreed.', treatment: 'Retrospective methodology example; no independently established skill advantage. Date comes from the employer LinkedIn copy.' },
  { account: 'Ross_Hull', publishedDate: '2024-02-26', sourceUrl: 'https://globalnews.ca/news/10317713/warm-temps-thunderstorms-arctic-blast-southern-ontario/', sourceType: 'Employer-hosted X embed', summary: 'An unusually early thunderstorm outlook included southwestern Ontario.', treatment: 'Commentary on another forecast; not a personal numeric prediction.' },
];
