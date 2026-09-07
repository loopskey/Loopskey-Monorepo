# فاز ۷: ریسپانسیو، دسترس‌پذیری و تحویل

پیش‌نیاز: [`rules.md`](./rules.md).

## هدف

اثبات این‌که ظاهر، رفتار و کیفیت فنی بازطراحی درست است — با کمترین هزینه اجرا. تأیید در دو لایه انجام می‌شود و **لایه ارزان مقدم است**.

## لایه ۱: تأیید متنی و عددی

هر معیاری که با `rg`، اسکریپت یا خروجی build قابل اثبات باشد، با مرورگر بررسی نمی‌شود. این لایه ۹۰٪ معیارها را پوشش می‌دهد و باید **قبل** از هر بررسی مرورگری کامل شود.

### ممیزی الگوهای ممنوع

regexهای [`rules.md`](./rules.md) روی کل `apps/front/src` اجرا شوند. خروجی مورد انتظار:

- صفر مورد برای `glass-panel`, `glass-card-enter`, `backdrop-blur`, `bg-background/45|60|85`, `rounded-[2rem]`, `shadow-2xl`, `radial-gradient`, `blur-3xl`.
- صفر مورد برای `dark:`, `\.dark`, `data-theme=.dark`, `prefers-color-scheme`.
- صفر هگز خام و صفر کلاس رنگ خام Tailwind خارج از `globals.css` (شروع کار: ۱۳ و ۷۷).
- صفر مصرف `--brand-teal` خارج از `--chart-3` (شروع کار: ۱۳).
- نام `GlassCard` failure نیست.

### کنترل کنتراست

خروجی اسکریپت کنتراست [فاز ۱](./01-design-foundation-white-canvas.md) دوباره اجرا و ضمیمه شود. همین خروجی مدرک تمام معیارهای عددی WCAG است و بررسی چشمی کنتراست در صفحات تکرار نمی‌شود.

### build و bundle

```bash
npm run lint --workspace front
npm run check-types --workspace front
npm run build --workspace front
npm run bundle-report --workspace front
```

و در پایان، یک‌بار برای کل مخزن:

```bash
npm run lint
npm run check-types
npm run build
```

- first-load JavaScript مسیرهای اصلی قبل و بعد از bundle report مقایسه شود.
- تأیید شود chart، calendar، map و animation library وارد shared shell نشده‌اند و dynamic importهای tabها باقی مانده‌اند.

## لایه ۲: تأیید مرورگری

سقف این لایه **۲۰ بررسی** است، نه ماتریس کامل نقش×tab×viewport×state:

| مورد | تعداد |
| --- | ---: |
| Overview هر نقش در `375` و `1440` | ۱۰ |
| نماینده هر archetype (list، form، chart، settings، dialog) در `1440` | ۵ |
| سایدبار در `767` و `768` روی یک نقش | ۲ |
| landing و یک صفحه auth در `375` | ۲ |
| یک صفحه با متن طولانی فرانسوی | ۱ |

- `1024` فقط در صورت مشاهده مشکل layout در `768` یا `1440` بررسی شود.
- اسکرین‌شات‌ها روی دیسک ذخیره شوند و طبق [`rules.md`](./rules.md) وارد context نشوند.
- Bottom Navigation نباید در هیچ viewport داشبورد render شود.

## پذیرش بصری

- تمام canvasها و surfaceهای محتوایی `#FFFFFF` هستند.
- تنها sidebar، CTA اصلی و statusهای معنایی رنگ قوی دارند.
- Cardها border ظریف، radius `12–16px` و shadow کم دارند.
- sidebar از `md` به بالا `256px` و متن‌دار، و زیر `md` عرض `72px` و icon-only با tooltip ترجمه‌شده است.
- hover و active قوس سفید متصل به canvas را نشان می‌دهند.
- nav در ارتفاع کم scroll می‌شود و تمام tabها بدون More sheet در دسترس‌اند.
- typography و spacing در نقش‌های مختلف یکسان است.
- chartهای تک‌سری indigo و مقایسه‌ای indigo/teal هستند؛ نارنجی فقط warning/highlight محدود است.
- canvas، tooltip و legend نمودارها سفید و light-only هستند.

## دسترس‌پذیری

بررسی روی همان ۲۰ صفحه لایه ۲، نه روی هر tab:

- ترتیب headingها منطقی است و هر صفحه یک `h1` دارد.
- تمام inputها label مرتبط و icon buttonها accessible name دارند.
- tab فعال `aria-current="page"` دارد.
- focus-visible روی سفید با `--ring` و روی سایدبار آبی با `--ring-on-primary` دیده می‌شود.
- sidebar، tooltip، dialog، dropdown و form فقط با keyboard قابل استفاده‌اند و Escape با بازگشت focus کار می‌کند.
- رنگ تنها حامل status نیست؛ label یا icon همراه است.
- نمودار تحلیلی summary متنی یا جدول screen-reader دارد و tooltip تنها منبع داده نیست.
- معیارهای عددی کنتراست از خروجی اسکریپت لایه ۱ می‌آیند.
- reduced motion رعایت می‌شود.

بررسی grayscale و شبیه‌سازی deuteranopia/protanopia **یک‌بار روی صفحه showcase** انجام شود، نه برای هر نمودار. تأیید print/export نمودارها از scope خارج است؛ چون هیچ dark palette یا theme listener وجود ندارد و خروجی ذاتاً سفید است.

## کنترل رفتار

این موارد در جریان فازهای ۴ تا ۶ روی نماینده هر archetype تأیید شده‌اند و اینجا فقط نتیجه ثبت می‌شود — تکرار کامل انجام نشود:

- role guard و onboarding redirect.
- direct URL، refresh و back/forward برای query param tab.
- create/edit/delete و confirmation dialog.
- filter، sort، pagination و search.
- file upload و download/export.
- cache refresh پس از mutation.
- ثبات semantic color پس از تغییر ترتیب داده و filter/sort.
- login، activation، OAuth bridge و logout.

## rollout پیشنهادی

1. Foundation و shell.
2. پنج Overview برای تأیید کارفرما.
3. tabهای dashboard در batchهای archetype-محور.
4. header، footer و landing.
5. content/detail/auth/static pages.
6. cleanup: حذف visualهای legacy، `--brand-teal`, `galaxy-background.tsx` و route showcase.
7. اجرای لایه ۱ و لایه ۲.

هر batch باید diff کوچک و قابل review داشته باشد. refactor منطق هم‌زمان با visual migration انجام نشود مگر برای رفع regression مستقیم همان batch.

## بسته تحویل

- تصاویر لایه ۲ کنار baseline موجود در [`baseline/course1/`](./baseline/course1/).
- خروجی ممیزی regex لایه ۱ به‌صورت جدول شمارشی.
- خروجی اسکریپت کنتراست.
- خروجی lint، type-check، build و bundle report.
- فهرست موارد عمدی که با Course متفاوت مانده‌اند و دلیل آن‌ها.
- تأیید صریح این‌که backend، GraphQL contract و routeهای Course1 تغییر نکرده‌اند.

## Definition of Done

- تمام gateهای فازهای ۱ تا ۷ پاس شده‌اند.
- کارفرما پنج Overview و shell مشترک را تأیید کرده است.
- لایه ۱ کامل pass است و لایه ۲ بدون regression تمام شده است.
- background بوم و surfaceها سفید کامل است.
- نمودارها از categorical/semantic palette تأییدشده استفاده می‌کنند و هیچ dark chart theme ندارند.
- route موقت showcase حذف شده است.
- ظاهر Course بازگشته اما معماری، قابلیت‌ها و دسترس‌پذیری Course1 حفظ شده است.
