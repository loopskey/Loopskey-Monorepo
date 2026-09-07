# قوانین مشترک بازطراحی

این سند تنها منبع قوانین غیرقابل‌مذاکره، پالت و بودجه اجراست. فایل‌های فاز این قوانین را تکرار نمی‌کنند و فقط به آن ارجاع می‌دهند.

## قانون خواندن اسناد

در هر session فقط این دو فایل خوانده شوند:

1. همین `rules.md`.
2. فایل فاز جاری.

خواندن کل پوشه، خواندن فازهای بعدی «برای آشنایی» و بازخوانی فازهای تمام‌شده ممنوع است. دو سند بازبینی ([معماری و رنگ](./architecture-and-color-review.md) و [سیستم رنگ نمودارها](./chart-color-system-review.md)) فقط وقتی خوانده شوند که فاز جاری صریحاً به آن‌ها ارجاع داده باشد.

## بودجه اجرا

هدف، اجرای کل بازطراحی بدون انفجار مصرف توکن است. این قواعد الزام‌آور هستند:

- **اسکرین‌شات ذخیره می‌شود، خوانده نمی‌شود.** هر capture مستقیماً روی دیسک نوشته شود. حداکثر ۳ تصویر در هر فاز وارد context شود و فقط وقتی یک تصمیم طراحی مشخص به دیدن آن وابسته باشد. تأیید بصری کارفرما از روی فایل‌ها انجام می‌شود، نه از داخل context مدل.
- **پروژه قدیمی `../Course` فقط دو فایل خواندنی دارد**: `apps/front/src/components/elements/Sidebar.tsx` و بخش `Dashboard Sidebar` در `apps/front/src/app/globals.css`. باقی فایل‌های Course که در فازها نام برده شده‌اند فقط نشانی تاریخی‌اند؛ مشخصات بصری‌شان از قبل به‌صورت عددی در همین اسناد ثبت شده و باز کردن‌شان لازم نیست.
- **هیچ اسکرین‌شاتی از پروژه قدیمی گرفته نمی‌شود.**
- **inventory با شمارش تولید می‌شود، نه با فهرست.** خروجی `rg -l ... | wc -l` ثبت شود؛ فهرست کامل مسیرها وارد context یا اسناد نشود.
- **بررسی متنی بر بررسی مرورگر مقدم است.** هر معیاری که با `rg` یا یک اسکریپت عددی قابل اثبات باشد، با مرورگر بررسی نشود.
- migration در batchهای کوچک و قابل review انجام شود؛ diff بزرگ چندنقشی ساخته نشود.

## قراردادهای غیرقابل مذاکره

- پس‌زمینه صفحه، محتوای داشبورد، کارت‌ها و پنل‌ها `#FFFFFF` است.
- سایدبار عمودی در تمام viewportها آبی برند می‌ماند؛ «سفید» یعنی بوم و سطوح محتوا، نه حذف رنگ هویتی ناوبری.
- گرادیان تزئینی، glassmorphism، `backdrop-blur`، سطح نیمه‌شفاف، blur blob و glow حذف می‌شوند.
- منطق، GraphQL، RTK Query، hookها، role guardها، routeها، i18n و dynamic importها حفظ می‌شوند.
- کد قدیمی فقط مرجع بصری است و مستقیم کپی نمی‌شود.
- هیچ API، schema، مدل Prisma یا قرارداد backend تغییر نمی‌کند.
- `globals.css` و componentهای مرکزی موجود منبع حقیقت طراحی می‌مانند؛ token یا primitive موازی برای dashboard ساخته نمی‌شود.
- dark theme وجود ندارد و اضافه نمی‌شود. سفید بوم سراسری محصول است.
- زبان‌های محصول EN و FR هستند و هر دو LTR؛ هیچ کار، تست یا هندسه‌ای برای RTL انجام نمی‌شود.
- متن جدید از کلیدهای موجود `src/i18n/en.json` و `src/i18n/fr.json` می‌آید.
- component جدید فقط با اثبات حداقل دو consumer واقعی با API و semantics مشترک ساخته می‌شود.
- حذف یا rename هیچ component، prop، variant یا token قبل از اثبات صفر شدن consumer با `rg` انجام نمی‌شود.

## پالت مرجع

مقادیر hex مرجع طراحی‌اند. پیاده‌سازی در ساختار OKLCH فعلی `globals.css` انجام می‌شود و featureها hex کپی نمی‌کنند.

| token | مرجع | کاربرد |
| --- | --- | --- |
| `--background`, `--card`, `--popover`, `--glass` | `#FFFFFF` | بوم و تمام surfaceهای محتوایی |
| `--foreground` | `#424242` | متن اصلی (`10.05:1`) |
| `--muted-foreground` | `#6B7280` | متن ثانویه (`4.83:1`) |
| `--muted` | neutral بسیار روشن | row hover، table header، skeleton، empty inset |
| `--primary` | `#1F1F8E` | سایدبار، CTA اصلی، لینک فعال (`12.77:1`) |
| `--primary-foreground` | `#FFFFFF` | متن و آیکون روی primary |
| `--primary-hover` | `#18187A` | hover اکشن اصلی |
| `--primary-active` | `#141463` | pressed |
| `--secondary`, `--accent` | neutral روشن | surface خنثی hover/focus اجزای shadcn |
| `--brand-orange` | `#F07915` | highlight یا surface محدود |
| `--brand-orange-foreground` | `#111827` | متن روی نارنجی (`6.29:1`) |
| `--brand-orange-text` | `#B45309` | متن یا آیکون نارنجی روی سفید (`5.02:1`) |
| `--border` | مقدار فعلی دارای contrast | border component و Card |
| `--input` | مقدار فعلی دارای contrast | مرز input/control |
| `--ring` | `#1F1F8E` | focus-visible روی سطوح سفید |
| `--ring-on-primary` | `#FFFFFF` | focus-visible روی سایدبار و هر surface آبی |
| success strong | `#15803D` | متن/surface موفقیت |
| warning strong | `#B45309` | متن/surface هشدار |
| destructive strong | `#DC2626` | متن/surface مخرب |
| info strong | `#0369A1` | متن اطلاعاتی |

### تصمیم‌های الزام‌آور پالت

- **`--ring` روی سایدبار کار نمی‌کند.** چون سایدبار و ring هر دو `#1F1F8E` هستند، focus داخل سایدبار نامرئی می‌شود. توکن `--ring-on-primary` سفید اضافه و در سایدبار، منوهای روی primary و هر control روی surface آبی استفاده شود.
- **`--primary` یک تغییر سراسری است، نه رنگ سایدبار.** مقدار فعلی `oklch(0.55 0.19 255)` روی هر Button، Link، Badge، `--ring` و `--chart-1` در کل فرانت اثر دارد. تغییر آن باید مثل یک reskin سراسری review شود و پس از آن Buttonها و linkهای صفحات عمومی نیز بازبینی بصری شوند.
- **warning در کل محصول `#B45309` است.** مقدار `#A16207` کنار گذاشته شد تا Badge، متن status و slice نمودار برای یک داده دقیقاً یک رنگ داشته باشند.
- **`--brand-teal` بازنشسته می‌شود.** این توکن Course1-محور است و در بازگشت به هویت Course جایی ندارد. ۱۳ مصرف فعلی آن تقریباً همه در blur blobهای تزئینی صفحات عمومی هستند که در فاز ۶ حذف می‌شوند؛ badge و متن باقی‌مانده در `LandingOrgShowcase`، `LandingProviderSection` و `LandingRoadmapShowcase` به neutral یا `--brand-orange-text` منتقل می‌شوند. خود توکن فقط پس از صفر شدن consumer از `globals.css` حذف شود. teal به‌عنوان رنگ نمودار در `--chart-3` باقی می‌ماند و این بازنشستگی شامل آن نمی‌شود.
- `--accent` در shadcn سطح خنثی hover/focus است و هرگز نارنجی نمی‌شود.
- `#E6E6E6` فقط divider تزئینی است و border ضروری input یا focus نمی‌سازد.
- رنگ هیچ‌گاه تنها حامل معنا نیست؛ status همیشه label یا icon همراه دارد.

معیار WCAG 2.2: متن عادی `4.5:1`، متن بزرگ و اطلاعات بصری ضروری component/state `3:1`.

## قانون سفید

- body، main، Card، table wrapper، dialog، dropdown، auth panel، header، footer و sectionهای محتوایی سفید کامل‌اند.
- `bg-background/45`, `bg-background/60`, `bg-background/85`, radial glow، blur blob و `backdrop-blur` برای ساخت surface استفاده نمی‌شوند.
- تمایز hierarchy با border، spacing و shadow کم ساخته می‌شود، نه با خاکستری کردن بوم.
- سایدبار آبی استثنای هویتی و status/content-type/chart استثناهای معنایی هستند.
- تصویر و thumbnail محتوایی می‌توانند رنگ داشته باشند؛ قانون سفید به surface رابط مربوط است.

## شعاع، سایه، فاصله و motion

| مورد | قرارداد |
| --- | --- |
| input/button کوچک | `8px` |
| row/item | `8px` تا `10px` |
| Card/dialog | `12px`؛ کارت شاخص حداکثر `16px` |
| pill/badge | `9999px` |
| shadow Card | `0 6px 18px -8px rgb(13 25 61 / 12%)` |
| shadow hover | `0 12px 28px -12px rgb(13 25 61 / 16%)` |
| section gap | `24px` |
| Card padding | `24px` desktop، `16px` mobile |
| grid gap | `16px` یا `24px` |
| عنوان صفحه | `24–30px` / وزن `700` |
| عنوان Card | `16–20px` / وزن `600` |
| مقدار KPI | `30–36px` |
| body | `14–16px` |
| entrance | فقط opacity/translateY حداکثر `8px` و `200–250ms` |
| hover Card | فقط برای Card قابل کلیک، حداکثر translateY برابر `1px` |

`rounded-3xl`, `rounded-[2rem]`, `shadow-2xl` و glow در scope بازطراحی‌شده ممنوع‌اند. motion با `prefers-reduced-motion` خاموش یا حداقلی می‌شود. فونت فعلی حفظ می‌شود و dependency جدید اضافه نمی‌شود.

## سیاست `GlassCard`

- ظاهر داخلی `GlassCard` یک‌بار در فایل مرکزی به Card سفید کلاسیک تبدیل می‌شود.
- props، `className` و DOM behavior ثابت می‌مانند تا ۱۶۶ consumer نشکنند.
- propهای تزئینی مانند `glow` در دوره انتقال پذیرفته ولی بی‌اثر می‌شوند.
- باقی ماندن **نام** `GlassCard` هرگز failure نیست؛ فقط ظاهر glass ممنوع است.
- rename احتمالی در یک PR مستقل و پس از صفر شدن مصرف انجام می‌شود و بخشی از بازطراحی بصری نیست.

## کلاس‌ها و الگوهای ممنوع

این فهرست، regex ممیزی بعد از هر batch است. **هرگز به‌صورت replace سراسری اجرا نشود** و فایل token مرکزی از آن مستثناست.

```text
glass-panel
glass-card-enter
backdrop-blur
bg-background/45
bg-background/60
bg-background/85
rounded-\[2rem\]
shadow-2xl
radial-gradient
blur-3xl
#[0-9A-Fa-f]{3,8}
(bg|text|border)-(red|orange|amber|yellow|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|pink)-
dark:
\.dark|data-theme=.dark|prefers-color-scheme
```

وضعیت شروع کار: ۱۳ هگز خام و ۷۷ کلاس رنگ خام Tailwind در ۴۶۷ فایل tsx. این صف مهاجرت کوچک و قابل اتمام است.

## فرمان‌های verification

```bash
npm run lint --workspace front
npm run check-types --workspace front
npm run build --workspace front
npm run bundle-report --workspace front
```

طبق استاندارد repository برای این کار فایل test جدید در `apps/front` ساخته نمی‌شود.
