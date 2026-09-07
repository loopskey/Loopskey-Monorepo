# فاز ۳: بازطراحی componentهای مشترک

پیش‌نیاز: [`rules.md`](./rules.md). سیاست `GlassCard`، قرارداد شعاع/سایه/spacing و لیست الگوهای ممنوع آنجاست و اینجا تکرار نمی‌شود.

## هدف

زبان بصری جدید در componentهای مرکزی موجود Course1 اعمال شود تا بیش از صد consumer بدون duplicate wrapper یا override نقش‌محور ظاهر هماهنگ بگیرند. این فاز appearance را تغییر می‌دهد و قرارداد data، props و behavior را حفظ می‌کند.

## اصل reuse-first

ترتیب تصمیم برای هر الگو:

1. primitive مناسب در `components/ui` وجود دارد: همان component استفاده یا با impact review اصلاح شود.
2. element مرکزی موجود است: ظاهر همان فایل با حفظ API بازطراحی شود.
3. دو یا چند consumer واقعی با semantics و API یکسان وجود دارد: element مشترک کوچک استخراج شود.
4. الگو فقط در یک feature مصرف می‌شود: local باقی بماند.

ساخت پوشه‌ای شامل تعداد زیادی `Dashboard*` wrapper از پیش ممنوع است. اشتراک فقط با evidence انجام می‌شود، نه صرف شباهت بصری.

## ماتریس componentهای فعلی

| component | تصمیم | خروجی بصری |
| --- | --- | --- |
| `components/ui/card.tsx` | پایه Card جدید باقی بماند | سفید، `rounded-xl`، border، `shadow-sm` |
| `components/elements/glass-card.tsx` | بازطراحی مرکزی با حفظ نام، props و importها | Card سفید ساده؛ بدون glass، glow، blur و حرکت عمومی |
| `animated-tabs.tsx` | بازطراحی مرکزی | tab list سفید/neutral، active آبی ساده، focus واضح |
| `floating-input/select/textarea.tsx` | بازطراحی مرکزی و هماهنگ | سطح سفید، border ورودی واضح، radius کوچک‌تر، بدون blur/ring تزئینی |
| `pagination.tsx` | بازطراحی مرکزی | ردیف ساده زیر محتوا؛ بدون panel شیشه‌ای و radius بزرگ |
| `confirm-dialog.tsx` | بازطراحی مرکزی | dialog سفید، radius `12–16px`، border و shadow متوسط |
| `dashboard-charts.tsx` | tokenization مرکزی | حذف hex خام، radius نمودار `6–8px` و tooltip سفید |
| Buttonهای `ui` | بررسی variantهای موجود | primary/outline/secondary/ghost/destructive ساده |

## سیاست `GlassCard`

سیاست کامل در [`rules.md`](./rules.md) است. نکته اجرایی این فاز: تغییر مرکزی، overrideهای محلی consumer را خنثی نمی‌کند؛ classهایی مثل `rounded-[2rem]`، gradient و background نیمه‌شفاف در فازهای ۴ تا ۶ نقش‌به‌نقش پاک‌سازی می‌شوند.

## Card و Page Header

- Card جدید ترجیحاً از `ui/card` و subcomponentهای آن ساخته شود.
- background سفید، radius `12px`، border قابل تشخیص و padding `16px` mobile / `24px` desktop باشد.
- Card ثابت حرکت hover ندارد؛ hover shadow فقط برای surface قابل کلیک است.
- Page header ابتدا local باقی بماند. فقط اگر دست‌کم سه role ساختار دقیق title/description/actions یکسان داشتند، element مشترک استخراج شود.
- action اصلی solid آبی و action ثانویه outline باشد؛ gradient button استفاده نشود.

## Stat و Metric Card

- نسخه‌های Professional، Provider، Organization، Admin و Association از نظر props، loading و semantics مقایسه شوند.
- `DashboardStatCard` موجود فقط پس از اثبات استفاده cross-feature به `components/elements` منتقل یا تثبیت شود.
- API مشترک حداقل label، value، icon و optional trend/status داشته باشد؛ data fetching داخل Card نباشد.
- grid استاندارد `1 / 2 / 4` ستون، value برابر `30–36px` و icon box برابر `40–44px` باشد.
- تنوع رنگ فقط برای status واقعی است؛ KPIها برای تزئین به چهار رنگ تصادفی تبدیل نشوند.

## Tabs، Button و Form control

### Tabs

- conic gradient، spin، backdrop blur و border شیشه‌ای حذف شود.
- active state علاوه بر رنگ با background/border/indicator مشخص شود.
- overflow افقی، keyboard behavior و accessible state فعلی حفظ شود.

### Button

- variantهای مجاز: primary، outline، secondary، ghost و destructive.
- ارتفاع پایه `36–40px`، target لمسی mobile حداقل `44px` و radius حدود `8px` باشد.
- Buttonهایی که روی surface آبی می‌نشینند focus-visible را از `--ring-on-primary` بگیرند.
- `brand`, `glass` و gradient فقط پس از migration آخرین consumer بازنشسته شوند؛ حذف زودهنگام variant مجاز نیست.

### Form controls

- input/select/textarea سفید، radius `8–12px`، border `--input` و focus ring `--ring` داشته باشند.
- `#E6E6E6` برای مرز ضروری input استفاده نشود.
- label قابل مشاهده و مرتبط با control باقی بماند؛ placeholder جای label نیست.
- React Hook Form، Zod، native picker behavior، error و description بدون تغییر بمانند.

## Table، Pagination و stateها

- table داخل Card سفید با overflow افقی محلی باشد؛ page نباید horizontal scroll بگیرد.
- table header و row hover از neutral بسیار روشن استفاده کنند.
- pagination یک ردیف ساده و responsive باشد، نه Card شناور شیشه‌ای.
- Empty state دارای title، description و حداکثر یک CTA اصلی باشد.
- Error state message ترجمه‌شده، retry و نشانه‌ای غیر از رنگ داشته باشد.
- Skeleton ابعاد محتوای واقعی را تقلید و layout shift را محدود کند.

## Chart و status

- تمام seriesها از categorical palette یا semantic mapping مرکزی خوانده شوند؛ `#2563eb`, `#14b8a6` و رنگ raw در feature باقی نماند.
- `useChartPalette` و fallback آن با tokenهای `globals.css` یک منبع هماهنگ بسازند؛ `CHART_COLORS` مستقل و متفاوت باقی نماند.
- data status مانند compliant/at-risk/non-compliant هیچ‌گاه با index رنگ نگیرد.
- tooltip سفید با border، label خوانا و shadow متوسط باشد.
- chart radius به `6–8px` کاهش یابد و fill گرادیانی حذف یا بسیار محدود شود.
- chart library همچنان dynamic/deferred بماند و به shared shell وارد نشود.
- status از pairهای semantic strong/soft استفاده و همراه label/icon نمایش داده شود.
- chart فقط light است و قرارداد کامل آن در [بازبینی سیستم رنگ نمودارها](./chart-color-system-review.md) قرار دارد.

## ترتیب migration componentها

1. Card و Button پایه.
2. `GlassCard` با compatibility API.
3. floating form controls.
4. Tabs، Pagination و ConfirmDialog.
5. chart tokenization و tooltip.
6. ارزیابی واقعی StatCard/PageHeader برای استخراج مشترک.
7. پاک‌سازی overrideهای محلی در فازهای ۴ تا ۶.

## چک‌لیست هر تغییر مرکزی

- [ ] فهرست consumerها پیش از تغییر ثبت شده است.
- [ ] props، event، ref، accessibility و loading behavior حفظ شده‌اند.
- [ ] component فقط presentation است و data fetching ندارد.
- [ ] رنگ از semantic token می‌آید و raw color جدید وجود ندارد.
- [ ] appearance شیشه‌ای، glow و radius بزرگ حذف شده است.
- [ ] نمونه‌های dashboard، public، auth و dialog مرتبط smoke check شده‌اند.
- [ ] mobile، keyboard focus و reduced motion بررسی شده‌اند.
- [ ] lint و type-check پاس شده‌اند.

## Gate پایان فاز

تأیید روی **صفحه showcase فاز ۱** انجام شود، نه با باز کردن پنج داشبورد: Card، Button، Input، Tabs، Dialog، Pagination، جدول، status و یک chart در چهار viewport بررسی شوند. علاوه بر آن فقط یک صفحه واقعی داشبورد به‌عنوان smoke check باز شود.

هیچ wrapper موازی بدون consumer واقعی ساخته نشده باشد. `npm run lint --workspace front` و `npm run check-types --workspace front` پاس شوند و سپس migration نقش‌ها شروع شود.
