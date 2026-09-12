# AgArena Research

Research required to build the product. Weather and social signal fused into pest scouting alerts for Ontario field crops.

Anything marked **VERIFY** has not been confirmed and should not be built on until someone checks it.

---

## 1. System shape

Four layers. Each is independently useful, which matters because the build order can stop at any layer and still have something working.

```
Weather (Open-Meteo)  ──┐
                        ├──> CHU accumulation ──> emergence model ──┐
Pest biology constants ─┘                                           │
                                                                    ├──> risk state ──> alert
Trap counts (GLMPMN) ───────> observed activity ────────────────────┤
                                                                    │
X posts ──> extraction ──> event clustering ──> corroboration ──────┘
```

Build order.

1. Weather pull plus CHU accumulation. Standalone and testable against published Ontario CHU maps.
2. Emergence model for one pest. Turns CHU into a predicted stage.
3. Trap ground truth ingestion. Validates the model against reality.
4. X ingestion and extraction. The differentiating layer, and the one most likely to eat time.
5. Risk fusion and alert generation.

Layer 4 is the hardest and the most novel. Layers 1 to 3 are what make layer 4 trustworthy, so do not invert the order.

---

## 2. Weather layer

**Open-Meteo.** Free, no API key, hourly temperature, historical and forecast. Confirmed available. This is the default.

Research needed.
- Confirm historical archive depth and the spatial resolution of the reanalysis product. Needed for the backtest in section 9.
- Determine forecast horizon and how far out temperature remains useful for CHU projection. Seven to ten days is the likely practical limit.
- Establish behaviour on missing data and how to represent an unavailable forecast rather than silently gapping.

**ECCC MSC GeoMet and Datamart.** Canadian model output, HRDPS and RDPS. **VERIFY** endpoints and licence terms. Worth evaluating as a cross-check or a fallback, not as the primary. Higher resolution over Ontario than most global models, but more work to consume.

Decision to reach. One provider or two with a cross-check. Two providers doubles the ingestion work and buys credibility only if the disagreement is surfaced to the user.

---

## 3. Domain model

This is where most builds substitute plausible-looking numbers. Get the published figures.

### Crop heat units

Ontario uses Brown's Crop Heat Unit system. It is calculated differently from growing degree days. It uses separate daytime and nighttime relationships rather than a single mean-minus-base formula.

**VERIFY** the exact formula and implement it faithfully. Do not substitute GDD and label it CHU. Validate the implementation by reproducing published Ontario CHU accumulation maps for a past season.

### Pest constants

For each candidate pest, find published values for the following.

- Base temperature and accumulation threshold for emergence
- Accumulation thresholds for each larval stage of interest
- Economic threshold, the count or damage level at which control pays
- Generation count per season in Ontario, and generation interval
- Whether the pest overwinters in Ontario or migrates in, since a migratory pest cannot be predicted from local heat accumulation alone

Candidates. Black cutworm, true armyworm, western bean cutworm, corn rootworm, soybean aphid, cereal aphid.

Selection criterion. Pick by economic impact in Ontario corn, soybean, and winter wheat, and by whether a published degree-day or CHU model actually exists. A pest with no published model cannot be forecast, only observed.

Important. Black cutworm and true armyworm are migratory into Ontario. Their arrival is driven by weather systems from the south, not by local heat accumulation. For those, local CHU predicts development after arrival but not arrival itself. This is exactly the gap that social signal fills, and it is the strongest technical argument for the X layer.

### Scouting protocol

For the chosen pest, find the standard protocol. Which part of the field, at which growth stage, what to count, how many locations. This becomes the actionable tail of every alert and it is what makes an agronomist believe the system.

Primary sources. OMAFA publications and Field Crop News. Tracey Baute is the OMAFA field crop entomologist who publishes the trap network results.

---

## 4. Ground truth layer

### GLMPMN

Great Lakes and Maritimes Pest Monitoring Network. Run by OMAFA GIS staff. Weekly trap counts submitted by growers, consultants, scouts, and extension staff across Ontario, Quebec, Manitoba, the Maritimes, and several US states. Holds prior years for year-over-year comparison.

**VERIFY** whether the Esri FeatureServer answers an anonymous query and returns JSON.

- If yes, live trap ground truth is free and the architecture assumes a live pull with a daily refresh.
- If no, transcribe one or more seasons into CSV. The dataset is small.

Research needed regardless of access method.
- Trap site density across Ontario counties. Sparse coverage means some counties have no ground truth at all, which changes what the map can honestly display.
- Submission lag. How long between a count being taken and appearing in the dataset. This number is the baseline the X layer is trying to beat, so measure it rather than assume it.
- Which pests the network actually tracks, since this constrains pest selection in section 3.

### Reference data

- **Field Crop News.** OMAFA field crop summaries and pest reports. **VERIFY** RSS feed URL and update cadence. Free structured text signal.
- **Ontario Crop Protection Hub.** Registered products, thresholds, resistance guidance. **VERIFY** whether machine readable or scrape-only.
- **AAFC Crop Condition Assessment Program.** NDVI and crop condition. Optional layer.
- **Canadian Drought Monitor.** Regional drought classification. Optional, relevant to some pest pressure.

---

## 5. X ingestion layer

### Position

X is a live field intelligence input, collected through the official API rather than scraping. It strengthens or explains a scouting alert. It is never the sole reason to recommend action.

### Why it earns its place

Trap data is volunteers submitting weekly counts that are then summarised and published. The gap between a grower observing something in a field and that reaching an official channel is measured in days. X closes that gap. It is the only component of this system not already available free and structured elsewhere.

For migratory pests (section 3) it is stronger still, because arrival cannot be predicted from local heat accumulation at all.

### Pricing constraints

**VERIFY all of this in the developer console before building.** X pricing changed more than once in 2026.

- As of February 2026 X moved new developers to pay-per-use. The free tier was discontinued. Legacy Basic at $200/month and Pro at $5,000/month are closed to new signups, with existing Basic subscribers migrated from June 2026.
- Reading a third-party post costs approximately $0.005, capped near 2,000,000 reads per month.
- Full-archive search moved to Enterprise, approximately $42,000 per month.
- Recent Search covers the preceding seven days.

Consequence for the build. Historical backfill is unaffordable. Live polling is not. Polling a curated set of accounts every few hours reads on the order of a few hundred posts per day, landing in the tens of dollars per month.

So the system polls Recent Search and builds its own season-long archive rather than buying history. The archive becomes an asset that compounds across seasons and cannot be bought back later, which is an argument for starting collection as early as possible even before the rest of the system works.

**VERIFY, critical.** Confirm Recent Search is available on a new usage-billed account rather than only timeline reads. The entire approach depends on this single fact and it could not be confirmed from public pricing pages.

### Collection design

Poll every 3 to 6 hours during the growing season. Cron, not streaming. Filtered and sampled stream were Pro features and are effectively unavailable, and are not needed. A spray window is days wide, so hours of latency costs nothing.

Fetch incrementally using the latest stored post ID.

Two ingestion paths with different precision, kept separate rather than merged behind one score.

**Path A, trusted accounts.** Ontario extension, agronomy, university, and grain sector accounts.

Do not use a long `from:` OR block. Recent Search has a query length cap and 200 accounts will not fit, forcing chunked queries per poll and paying per query. Put the accounts in an X List and poll the list timeline endpoint. One paginated call, cheaper per post, and search operations are not spent on authors already known.

**Path B, open keyword search.** Pest aliases plus Ontario geography, excluding reposts and replies. This is the noisy path and needs the query design below.

### Query design problem

The naive query does not work. Ontario county names are British place names, which is why Ontario has them.

- Essex and Middlesex are large English counties with active farming communities posting in English. `lang:en` filters nothing.
- Kent pulls Kent UK, Kent Ohio, Kent State, and Clark Kent. Kent is also no longer an Ontario county; it is Chatham-Kent.
- Elgin exists in Scotland, Illinois, and Texas.
- Bare acronyms (WBC, TAW, BCW) collide with ticker symbols, airport codes, and unrelated initialisms.

### Query design fixes

- Drop bare acronyms from the open search. Keep them only on the trusted-account path where a false positive is cheap.
- Anchor on Ontario-unique strings. Chatham-Kent, Huron County, Lambton, Wellington County, Bruce County, Perth County.
- Prefer town names over county names. Ridgetown, Exeter, Blenheim, Dresden are far less ambiguous.
- Require agricultural co-occurrence before geography is applied. Pest block AND crop or scouting block.

Starting query shape, to be refined against the test cases below.

```
(
  "black cutworm" OR "true armyworm" OR
  "western bean cutworm" OR "soybean aphid" OR
  "cereal aphid"
)
(corn OR soybean OR soybeans OR wheat OR scouting OR field)
("Chatham-Kent" OR Lambton OR "Huron County" OR Ridgetown OR Exeter OR Blenheim OR Ontario)
lang:en -is:retweet -is:reply
```

### Query test cases

Run these before trusting the pipeline.

| Input | Expected |
|---|---|
| A post about a cricket match in Essex | No match |
| "counted 14 WBC per trap near Ridgetown" | Match, pest western bean cutworm, county Chatham-Kent |
| "TAW shares up 3% today" | No match |

### Extraction test cases

| Input | Expected |
|---|---|
| "picked up armyworm feeding in winter wheat near Lucan this morning, worst I've seen" | pest true armyworm, crop winter wheat, county Middlesex, damage yes, high confidence |
| A post about a farm equipment auction | Null, not a hallucinated pest record |
| "anyone else seeing aphids?" with no location | pest cereal aphid, county null, low confidence, not mapped |

The third case matters most. A system that maps unlocated posts to a guessed county will look wrong to anyone who knows the region.

### Location assignment

Do not rely on X geotags or profile locations for county assignment. They are frequently absent or imprecise.

Assign a county only when the post explicitly names a place, or the author is a verified location-specific source.

Research needed. Build a gazetteer of Ontario agricultural place names mapped to counties, covering towns and townships rather than only county names. Statistics Canada and Ontario geographic name datasets are the likely source. **VERIFY** availability and licence.

Location extraction quality, not the data pipe, determines whether the map is credible. Budget time accordingly.

### Event clustering

Deduplicating by post ID does not deduplicate events.

When OMAFA posts a trap update, many agronomists quote, paraphrase, and discuss it within a day. Those are distinct post IDs describing one observation. A naive confidence score reads this as corroboration and elevates a single report to strong signal.

- Cluster to events before scoring. Same pest, same county, within a few days collapses to one event.
- Treat post count as weak supporting weight, not a multiplier.
- Apply time decay tied to the pest generation interval, or a post from three weeks ago keeps firing alerts.

Research needed. Determine whether a quote post referencing an official account can be reliably detected from the API response, since that is the cheapest way to collapse the amplification cluster.

### Storage schema

Store the raw API response JSON alongside the parsed row. Extraction logic will change many times, and keeping only extracted fields means re-fetching and re-paying to re-extract.

Fields.
- post ID (dedup key)
- author
- timestamp
- full text
- URL
- raw response payload
- matched query
- query version string
- extracted pest, crop, county
- confidence score
- event cluster ID

The query version string matters. Without it there is no way to distinguish a genuinely quiet week from a week the query was broken.

### Compliance

Process deletions and edits through X's compliance mechanisms before treating the stored archive as durable.

**VERIFY.** Compliance streams are Enterprise-tier tooling. On usage-based access the route is the batch compliance jobs endpoint, where stored post IDs are submitted and deleted ones returned. Confirm which mechanism this access tier can call.

### Reference links

- Search Posts introduction, https://docs.x.com/x-api/posts/search/introduction
- Search operators, https://docs.x.com/x-api/posts/search/integrate/operators
- Recent Search quickstart, https://docs.x.com/x-api/posts/search/quickstart/recent-search
- Usage and billing, https://docs.x.com/x-api/fundamentals/post-cap
- Compliance guidance, https://developer.x.com/content/developer-twitter/en/docs/twitter-api/compliance/streams/integrate/integrating-compliance-streams

---

## 6. Risk fusion

How the three inputs combine into a single state per pest, per county.

| Signal | Weight |
|---|---|
| Trusted extension post naming a pest and a county | Strong contextual signal |
| Independent agronomist or grower post with a concrete observation | Supporting signal |
| General discussion, photos without location, reposts | Informational only |
| X signal alone | Never above "monitor" |
| X signal plus CHU timing or GLMPMN activity | May elevate to "scout this week" |

Known tension to resolve in the design. The trusted extension tier largely rebroadcasts GLMPMN and Field Crop News content already ingested directly and in structured form. So the highest-confidence social tier is the least novel, and it arrives after the weekly summary rather than before it.

The lag advantage the product is built on lives in the independent agronomist and grower tier, scored here as merely supporting. The scoring is correct on reliability grounds and should be kept. But the early-warning capability depends on the noisy tier working, which is another reason extraction quality outranks source curation.

Research needed. Define the output states precisely and what each one asks the user to do. A three-state model (monitor, scout this week, act now) is enough. More states dilute meaning without adding information.

---

## 7. Alert output

Action first, evidence second, practical scouting hint last.

> Scout corn for black cutworm this week. Recent Ontario extension reports mention activity in Chatham-Kent, and local degree-day timing supports early larval feeding. Check weedy and no-till areas first.

Rules.
- Name the county explicitly. "Nearby counties" is vague and unverifiable.
- Attach the source post link inline so the claim is checkable.
- The scouting hint is the part that makes an agronomist believe the system, and it comes from the published protocol in section 3.
- State the evidence type. A user should be able to tell whether an alert rests on modelled timing, observed trap counts, social reports, or a combination.

---

## 8. Deferred

Not in the first build. Listed so they do not creep in.

- Push notifications that work when the app is closed. Service workers or native push consume disproportionate time for an in-app alert plus email equivalent.
- Field boundary drawing. Point plus radius is sufficient until field-level data exists to justify it.
- Historical X archive purchase. Enterprise tier only, and the self-built archive replaces it over time.
- Any scraping of X. Official API or nothing.
- Multi-province scope. Ontario only until the Ontario model validates.

---

## 9. Validation

The claim is that social signal leads official channels. Measure it rather than assert it.

**Backtest.** Take a past season pest event. Find the timestamp of the earliest credible X mention naming the pest and a county. Compare against the publication date of the corresponding trap summary or Field Crop News report. The gap in days is the measured value of the X layer.

Constraint. Recent Search only reaches back seven days, so a historical backtest cannot be run through the API. Options.

- Collect forward through a season and measure at the end. Correct but slow.
- Use manually collected examples for the initial measurement and let the live archive replace them. **VERIFY** whether manual collection of public post timestamps is acceptable under the terms of service for this purpose.

**Model validation.** Compare predicted emergence timing from the CHU model against observed trap peaks in the GLMPMN historical data. This is a clean offline test and does not depend on X at all. It is also the fastest way to find out whether the biology constants were implemented correctly.

**Precision measurement.** Hand-label a few hundred collected posts for pest, crop, and county. Measure extraction precision and recall against that set. Without this number there is no way to tune the query or the prompt, only to guess.

---

## 10. Prior art

What exists, and what each requires the grower to install or pay for. The installation requirement is usually the gap worth standing in.

- Semios
- Trapview
- Climate FieldView (Bayer)
- John Deere Operations Center
- Croptracker
- AgExpert
- OMAFA and Field Crop News existing delivery channels

Research question for each. Does it forecast, or only record? Most farm management platforms are record-keeping with a weather feed attached. Forecasting pest pressure from fused public signal is a different claim.

Cautionary data point. Farmers Edge listed on the TSX at $17 per share in March 2021 and was taken private by Fairfax at $0.35 per share in 2024, with declining grower enrolment in digital agronomy tools among the cited causes. Farmer-paid subscription agtech has a hard record. **VERIFY** the Ontario advisory channel structure, since the scouting decision may sit with a retailer agronomist or independent crop advisor rather than the grower.

---

## 11. Field interviews

Three conversations beat thirty hours of reading, and they determine which pest and which crop to build for.

Targets.
- Grain Farmers of Ontario
- One independent certified crop advisor
- Tracey Baute at OMAFA, who runs the provincial trap network and whose contact address is published

One question. What decision did you get wrong last season because information arrived too late?

Secondary questions.
- How do you currently find out a pest has arrived in your area?
- How many days of warning would change what you do?
- What would make you distrust an automated alert?

That last one is the most useful for the build. It defines the failure mode to engineer against.

---

## 12. Open verification list

1. Recent Search availability on a new usage-billed X account
2. Current X per-read pricing and caps
3. Which X compliance mechanism is callable at this access tier
4. Terms of service position on manual collection for backtesting
5. GLMPMN FeatureServer anonymous query access
6. GLMPMN trap site density by county and submission lag
7. ECCC MSC GeoMet endpoints and licence terms
8. Open-Meteo historical archive depth and resolution
9. Field Crop News RSS feed URL and cadence
10. Ontario Crop Protection Hub machine readability
11. Brown CHU formula, exact
12. Published pest thresholds and generation intervals for the chosen pest
13. Which candidate pests are migratory into Ontario versus overwintering
14. Ontario place name gazetteer availability and licence
15. Ontario advisory channel structure, who actually makes the scouting call
