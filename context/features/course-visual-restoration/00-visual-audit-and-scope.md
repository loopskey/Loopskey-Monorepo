# فاز ۰: ممیزی و تثبیت محدوده — ✅ تکمیل‌شده

> **این فاز انجام شده است و نباید دوباره اجرا شود.** baseline تصویری در [`baseline/course1/`](./baseline/course1/) موجود است (۴۰ تصویر: ۲۰ صفحه × ۲ viewport برای هر پنج نقش). هیچ اسکرین‌شات جدیدی — به‌ویژه از پروژه قدیمی `../Course` — گرفته نمی‌شود. خروجی‌های متنی ممیزی در همین سند و در [`rules.md`](./rules.md) تثبیت شده‌اند.
>
> این فایل از این پس فقط مرجع خواندنی است. کدنویسی از [فاز ۱](./01-design-foundation-white-canvas.md) شروع می‌شود.

قوانین، پالت و بودجه اجرا در [`rules.md`](./rules.md) است و اینجا تکرار نمی‌شود.

## منابع حقیقت

| موضوع | منبع حقیقت |
| --- | --- |
| ظاهر، تراکم، سایدبار و الگوی کارت | مشخصات عددی همین سند و فاز ۲ |
| route، tab، قابلیت و نقش‌ها | `Course1/apps/front/src` |
| دریافت و mutation داده | hookها و RTK endpointهای `Course1` |
| متن و ترجمه | `Course1/apps/front/src/i18n` |
| استاندارد کدنویسی | `Course1/context/coding-standards.md` |
| token و component قابل استفاده مجدد | `apps/front/src/app/globals.css` و `components/ui` و `components/elements` |

## یافته‌های طراحی نسخه اول

این یافته‌ها از پروژه `Course` استخراج و به‌صورت عددی ثبت شده‌اند تا نیازی به باز کردن دوباره فایل‌های قدیمی نباشد.

### زبان بصری

- رنگ اصلی برند `#1F1F8E` و رنگ تأکیدی تاریخی `#F07915` است.
- متن اصلی خاکستری تیره `#424242` است.
- کارت‌ها سفید، دارای border نازک و `shadow-sm` هستند.
- شعاع غالب کارت `12px` تا `16px` است؛ نه `24px` یا `32px`.
- gridهای KPI در موبایل یک ستون، در tablet دو ستون و در desktop چهار ستون هستند.
- فاصله عمودی بخش‌ها `24px` و padding کارت‌ها `24px` است.
- نمودارها داخل Card ساده قرار می‌گیرند و تزئینات روی خود داده متمرکز است.
- motion کوتاه و کم‌دامنه است.

### پوسته داشبورد نسخه اول

- سایدبار desktop عرض ثابت `256px` دارد.
- ارتفاع dashboard برابر viewport است و content مستقل scroll می‌شود.
- سایدبار با آبی برند پر می‌شود و item فعال به سطح سفید متصل می‌شود.
- ارتفاع logo row برابر `64px` و ارتفاع هر navigation item برابر `60px` است.
- آیکون فضای ثابت حدود `60px` دارد و عنوان در ادامه قرار می‌گیرد.
- در پیاده‌سازی قدیمی موبایل، سایدبار حذف و bottom navigation نمایش داده می‌شد؛ این فقط یافته تاریخی است و طبق تصمیم کارفرما منتقل **نمی‌شود**.
- tab فعال با query string همگام است؛ Course1 همین قرارداد URL را بهتر پیاده کرده و باید حفظ شود.

## تفاوت‌های مهم Course و Course1

| محور | Course | Course1 | تصمیم بازطراحی |
| --- | --- | --- | --- |
| بوم محتوا | `gray-50` | سفید همراه glass و tint | دقیقاً سفید `#FFF` |
| سایدبار | آبی، 256px، منحنی فعال | سفید، 84/288px، pill آبی | هندسه نسخه اول با data/config نسخه دوم |
| ریسپانسیو | bottom navigation + More | سایدبار compact + bottom nav | سایدبار عمودی دائمی؛ زیر `md` فقط آیکون |
| کارت | `rounded-xl border shadow-sm` | `rounded-[2rem]`, glass, glow | کارت سفید 12–16px با border ظریف |
| دکمه | solid/outline ساده | gradient/glass و سایه بزرگ | solid/outline ساده |
| متن | عنوان‌های compact و bold | hero-like و spacious | تراکم و hierarchy نسخه اول |
| motion | fade/translate کوتاه | blur/scale طولانی | 150–250ms و reduced motion |
| داده | React Query و الگوهای قدیمی | RTK Query + generated GraphQL | فقط پیاده‌سازی نسخه دوم |
| i18n | بخشی hard-code | EN/FR مرکزی | فقط i18n نسخه دوم |

## مواردی که از Course نباید منتقل شوند

- access token به‌عنوان prop کامپوننت‌ها.
- hookهای قدیمی، queryهای قدیمی یا `fetchGraphQL` قدیمی.
- `console.log`، متن hard-code، comment banner و نام‌گذاری‌های legacy.
- typeهای دارای prefixهای `I` و `T` به‌عنوان الگوی کد جدید.
- routeهای `[id]` قدیمی به‌جای routeهای `[slug]` نسخه دوم.
- dark classهای پراکنده نسخه اول.
- placeholder actionهایی که فقط `console.log` می‌کنند.

## قابلیت‌های محافظت‌شده Course1

- نقش‌های `PROFESSIONAL`, `PROVIDER`, `ORGANIZATION`, `ASSOCIATION`, `ADMIN`.
- guardهای route و onboarding حرفه‌ای.
- تمام مقادیر `tab` و deep linkها در `utils/dashboard-nav.config.ts`.
- lazy loading تب‌ها با `next/dynamic`.
- loading، empty، error و success stateهای موجود.
- i18n انگلیسی و فرانسوی.
- cache invalidation و mutation flowهای RTK Query.
- تقویم، chart، dialog، upload، pagination، filters و فرم‌ها.

## baseline معماری ثبت‌شده

اعداد زیر خروجی ممیزی هستند و نقطه شروع کار محسوب می‌شوند. برای به‌روزرسانی‌شان فقط `rg -l ... | wc -l` اجرا شود؛ فهرست مسیرها ثبت نشود.

| سنجه | مقدار |
| --- | ---: |
| کل فایل TSX فرانت | ۴۶۷ |
| مصرف‌کننده `GlassCard` | ۱۶۶ |
| دارای ظاهر شیشه‌ای/شعاع بزرگ | ۱۲۰ |
| کامپوننت Recharts | ۱۸ |
| هگز خام در TSX | ۱۳ |
| کلاس رنگ خام Tailwind در TSX | ۷۷ |
| مصرف `--brand-teal` | ۱۳ |
| dark theme فعال | ندارد |

`utils/constant.ts` یک `CHART_COLORS` مستقل با هشت هگز دارد که در فاز ۳ به منبع مرکزی منتقل می‌شود. کامپوننت [`galaxy-background.tsx`](../../../apps/front/src/components/elements/galaxy-background.tsx) صفر مصرف‌کننده دارد و در cleanup فاز ۶ حذف می‌شود.

## baseline تصویری موجود

پوشه [`baseline/course1/`](./baseline/course1/) شامل ۴۰ تصویر با نام‌گذاری `role-tab-viewport-state.png` در دو viewport `375` و `1440` است و پوشش هر پنج نقش را دارد. این baseline **کافی است**.

- تصویر جدید فقط برای صفحه‌ای گرفته شود که در baseline موجود نیست و واقعاً در حال بازطراحی است.
- تصاویر روی دیسک ذخیره شوند و طبق [`rules.md`](./rules.md) وارد context نشوند.
- برای فاز ۲، مقایسه before/after ناوبری با حداکثر دو تصویر (`375` و `1440`) ثبت شود.

## Gate پایان فاز — پاس‌شده

- ✅ baseline تصویری هر پنج نقش موجود است.
- ✅ tabهای هر نقش با `dashboard-nav.config.ts` تطبیق داده شده‌اند.
- ✅ تصمیم «بوم و surfaceهای محصول سفید» تأیید و در [`rules.md`](./rules.md) ثبت شده است.
- ✅ قرارداد [سیستم رنگ نمودارها](./chart-color-system-review.md) تأیید شده است.
- ✅ تصمیم responsive ثبت شده است: زیر `md` rail عمودی icon-only و از `md` به بالا sidebar متن‌دار؛ بدون Bottom Navigation.
