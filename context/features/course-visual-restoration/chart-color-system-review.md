# بازبینی سیستم رنگ نمودارها

پیش‌نیاز: [`rules.md`](./rules.md). این سند مرجع الزام‌آور تمام chartهاست و بر توضیح‌های کلی سایر فازها اولویت دارد.

## نتیجه ممیزی

Course1 در حال حاضر ۱۸ component دارای مصرف مستقیم Recharts دارد. معماری Association نسبت به بخش‌های دیگر جلوتر است و از `useChartPalette`, `CHART_SEMANTIC_SLOTS` و semantic mapping استفاده می‌کند؛ اما یکپارچگی کامل نیست:

- `utils/constant.ts` هنوز `CHART_COLORS` را به‌صورت هشت hex مستقل نگه می‌دارد.
- `elements/dashboard-charts.tsx`, `AdminUsersTab.tsx` و `provider-analytics-charts.tsx` رنگ‌های hex مستقیم دارند.
- `cpd-progress-overview.tsx` رنگ progress و remainder را داخل داده خام می‌سازد.
- نمودارهای Organization و بخشی از Admin رنگ statusها را با index آرایه انتخاب می‌کنند؛ در نتیجه تغییر ترتیب داده می‌تواند معنای رنگ را عوض کند.
- tooltip، grid، axis، radius و area gradient بین roleها یک قرارداد مشترک ندارند.
- بعضی نمودارها accessible summary دارند، اما این پوشش در تمام chartها یکسان نیست.

بنابراین صرفاً تغییر `--chart-1` تا `--chart-8` کافی نیست؛ باید مصرف رنگ نیز به دو مسیر «categorical» و «semantic» تفکیک شود.

## قرارداد light-only

این پروژه dark mode ندارد و برای نمودارها نیز dark palette تعریف نمی‌شود:

- تمام chart tokenها فقط در `:root` داخل `globals.css` قرار می‌گیرند.
- selectorهای `.dark`, `[data-theme="dark"]`, `prefers-color-scheme` و listener تغییر theme اضافه نمی‌شوند.
- canvas نمودار transparent روی Card سفید یا مستقیماً سفید است.
- tooltip، legend panel و export/print همیشه surface سفید دارند.
- رنگ grid، axis و label برای پس‌زمینه سفید محاسبه و تست می‌شود.

## پالت categorical پیشنهادی

این پالت برای categoryها یا seriesهایی است که خوب/بد بودن ذاتی ندارند. مقادیر hex مرجع طراحی هستند؛ منبع runtime همان tokenهای OKLCH در `globals.css` خواهد بود.

| token | مرجع | نقش پیشنهادی | contrast تقریبی با سفید |
| --- | --- | --- | ---: |
| `--chart-1` | `#1F1F8E` | series اصلی و هویت برند | `12.77:1` |
| `--chart-2` | `#2563EB` | series مقایسه‌ای آبی | `5.17:1` |
| `--chart-3` | `#0F766E` | teal برای series دوم مستقل | `5.47:1` |
| `--chart-4` | `#7C3AED` | violet هماهنگ با logo فعلی | `5.70:1` |
| `--chart-5` | `#C65F00` | orange تیره و قابل‌تشخیص روی سفید | `4.17:1` |
| `--chart-6` | `#BE185D` | magenta برای category مستقل | `6.04:1` |
| `--chart-7` | `#0369A1` | sky تیره برای category مستقل | `5.93:1` |
| `--chart-8` | `#475569` | slate/neutral series | `7.58:1` |

### ترتیب مصرف categorical

- نمودار تک‌سری: فقط `--chart-1`.
- نمودار دوسری مقایسه‌ای: `--chart-1` و `--chart-3` تا آبی/teal تفکیک روشن داشته باشند.
- categoryهای بدون معنای status: به‌ترتیب palette، همراه label و legend.
- رنگ نارنجی روشن تاریخی `#F07915` برای mark کوچک روی سفید حدود `2.82:1` دارد؛ در نمودار از orange تیره `--chart-5` استفاده شود.
- green و red از palette categorical عمومی حذف شده‌اند و برای success/danger رزرو می‌مانند. در نمودار semantic نیز همراه label، icon/shape یا pattern تکمیلی استفاده شوند؛ تفاوت معنا نباید تنها به تشخیص رنگ وابسته باشد.

## پالت semantic پیشنهادی

رنگ semantic بر اساس key داده تعیین می‌شود، نه index آرایه. mapping زیر بین chart، Badge، progress و status text مشترک است:

| semantics | token مقصد | مرجع | کاربرد |
| --- | --- | --- | --- |
| `completed` / `renewalReady` | `--chart-semantic-success` | `#15803D` | تکمیل یا آمادگی تمدید |
| `onTrack` / `inProgress` | `--chart-semantic-on-track` | `#1F1F8E` | روند طبیعی یا فعال |
| `atRisk` / `pendingAttention` | `--chart-semantic-warning` | `#B45309` | نیازمند توجه |
| `critical` / `nonCompliant` | `--chart-semantic-danger` | `#DC2626` | وضعیت بحرانی یا عدم انطباق |
| `notStarted` / `unknown` | `--chart-semantic-neutral` | `#64748B` | شروع‌نشده یا خنثی |
| `remainderTrack` | `--chart-track` | `#E2E8F0` | فقط track تزئینی progress/gauge |

`--chart-track` به‌دلیل contrast پایین نباید یک category مستقل یا تنها نمایش remaining data باشد. در progress/gauge استفاده از آن فقط وقتی مجاز است که مقدار عددی، label و accessible summary نیز وجود داشته باشد.

## source of truth و API

- `globals.css` منبع اصلی `--chart-1..8`, semantic chart tokenها، grid، axis و track است.
- `useChartPalette` به resolver مرکزی تبدیل یا در همان نقش تثبیت شود و همه fallbackها دقیقاً mirror توکن‌های global باشند.
- `CHART_COLORS` مستقل در `utils/constant.ts` نباید دومین منبع طراحی باقی بماند. token names و fallbackهای لازم در یک utility متمرکز chart قرار گیرند.
- componentها semantic key یا palette slot دریافت کنند؛ hex یا Tailwind color دریافت نکنند مگر داده واقعاً یک رنگ user-defined معتبر داشته باشد.
- mapping statusها type-safe باشد. `compliant`, `atRisk`, `nonCompliant` و موارد مشابه هیچ‌گاه با `index % palette.length` رنگ نگیرند.
- `chartTone` فقط tint همان semantic color را بسازد و نتیجه روی Card سفید بررسی شود.

## قرارداد اجزای نمودار

| بخش | قرارداد light theme |
| --- | --- |
| Card/canvas | سفید یا transparent روی Card سفید |
| grid | neutral ظریف از token مرکزی؛ dash کم و بدون غلبه بر داده |
| axis/tick | `--muted-foreground` با اندازه حداقل `11–12px` |
| primary stroke | `--chart-1` با ضخامت `2.5–3px` |
| secondary stroke | `--chart-3` با ضخامت مشابه |
| area fill | همان stroke با opacity حدود `8–12%`؛ بدون gradient چندرنگ |
| bar radius | `6–8px`؛ نه `12–14px` |
| tooltip | `--popover`, border استاندارد، radius `8–12px` و shadow متوسط |
| legend | swatch + label؛ قابل wrap در mobile |
| hover/focus | active mark واضح و tooltip قابل دسترسی بدون وابستگی صرف به mouse |

نارنجی در chart نقش هشدار یا highlight محدود دارد و نباید به‌عنوان رنگ دوم ثابت همه نمودارها استفاده شود. ظاهر کلی نمودار باید عمدتاً indigo/blue/teal روی بوم سفید باشد تا با سایدبار آبی و Cardهای سفید هماهنگ بماند.

## migration بر اساس ناحیه

### Shared و Professional

- hexهای `dashboard-charts.tsx` به palette مرکزی منتقل شوند.
- progress اصلی از `--chart-1` و track از `--chart-track` استفاده کند.
- آرایه‌های داده به‌جای `fill: "#..."` semantic slot یا value خالص حمل کنند.
- accessible summary فعلی CPD حفظ و برای chartهای مشابه الگو شود.

### Provider

- registrations از `--chart-1` و revenue/comparison از `--chart-3` استفاده کند.
- gradient آبی فعلی به fill تک‌رنگ با opacity `8–12%` تبدیل شود.
- pie/bar categoryها palette categorical مرکزی را مصرف کنند.

### Organization

- compliance distribution بر اساس key نگاشت شود: compliant سبز، at-risk نارنجی تیره و non-compliant قرمز.
- departmentها categorical هستند و می‌توانند از palette ترتیبی استفاده کنند.
- trend تک‌سری primary و breakdown دوسری indigo/teal باشد.
- tooltipهای shadow بزرگ و radius `1rem` با قرارداد مشترک جایگزین شوند.

### Admin

- request trend تک‌سری primary باشد و به `currentColor` وابسته نباشد.
- request status distribution semantic mapping داشته باشد؛ approved سبز، pending نارنجی، rejected قرمز و neutral آبی/slate.
- `AdminUsersTab` hexهای blue/teal را از palette مرکزی دریافت کند.

### Association

- ساختار `useChartPalette` و semantic mapping حفظ و به منبع استاندارد کل پروژه تبدیل شود.
- `notStarted` از slot خنثی استفاده کند؛ cyan نباید معنای شروع‌نشده داشته باشد.
- `renewalReady`, `onTrack`, `atRisk` و وضعیت بحرانی با mapping جدول semantic همسان شوند.
- gauge و heatmap همراه summary/table متنی باقی بمانند.

## دسترس‌پذیری و verification

- هر chart عنوان و توضیح متنی قابل‌مشاهده داشته باشد.
- نمودارهای summary دارای `role="img"` و `aria-label` معنادار باشند.
- نمودارهای تحلیلی پیچیده summary متنی یا جدول screen-reader داشته باشند؛ tooltip تنها منبع عدد نیست.
- status با label، legend و در صورت نیاز pattern/shape از هم متمایز شود.
- حالت‌های normal، hover، keyboard focus، empty و loading روی سفید بررسی شوند. بررسی export/print لازم نیست؛ چون هیچ dark palette یا theme listener وجود ندارد و خروجی ذاتاً سفید است.
- palette یک‌بار روی صفحه showcase در grayscale و شبیه‌سازی deuteranopia/protanopia بازبینی شود؛ تکرار آن برای هر نمودار لازم نیست و labelها در هیچ حالت حذف نشوند.
- نماینده هر archetype نمودار در `375` و `1440` بدون بریدگی axis/legend تست شود.

## Gate پایان بازبینی نمودار

- هیچ hex رنگی داخل component نمودار یا سازنده داده feature باقی نمانده باشد.
- status chartها بر اساس semantic key و categorical chartها بر اساس palette slot رنگ گرفته باشند.
- همه chart surfaceها و tooltipها در light-only سفید باشند.
- هیچ `.dark`, `dark:`, dark chart token یا theme listener جدیدی اضافه نشده باشد.
- رنگ chart با sidebar `--primary`, Card سفید و status tokenهای سراسری هماهنگ باشد.
- لایه ۱ فاز ۷ (ممیزی regex، اسکریپت کنتراست، lint، type-check، build) پاس شود.
