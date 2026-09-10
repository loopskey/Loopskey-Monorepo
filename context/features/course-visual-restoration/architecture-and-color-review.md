# گزارش بازبینی معماری و رنگ

## نتیجه نهایی

فایل‌های فازبندی از نظر ترتیب کلی درست هستند، اما نسخه قبلی برنامه در دو نقطه با معماری تمیز Course1 تعارض داشت: ایجاد tokenهای `--dashboard-*` در کنار tokenهای global و ساخت مجموعه‌ای موازی از componentهای dashboard. هر دو مورد از برنامه اصلاح شدند.

پالت سفید، آبی تیره و نارنجی برای محصول Course و آموزش مناسب است؛ چون آبی تیره هویت نسخه اول و خوانایی بالای navigation را حفظ می‌کند، سفید به محتوای آموزشی و داده‌ها فضای تنفس می‌دهد و نارنجی می‌تواند انرژی و توجه را فقط در CTA یا highlight محدود ایجاد کند. این تناسب یک تصمیم هویتی و کاربردی برای همین محصول است، نه یک قانون عمومی روان‌شناسی رنگ.

## شواهد معماری Course1

- `apps/front/src/app/globals.css` هم‌اکنون tokenهای semantic برای background، foreground، card، primary، status، content type، chart، border، input و ring دارد.
- `components/ui/card.tsx` از قبل به الگوی هدف نزدیک است: Card سفید، `rounded-xl`، border و `shadow-sm`.
- `components/elements/glass-card.tsx` یک نقطه مرکزی با consumerهای بسیار زیاد است؛ تغییر ظاهر داخلی آن کم‌ریسک‌تر از جایگزینی import در بیش از صد فایل است، مشروط به حفظ API.
- `AnimatedTabs`، floating fieldها، `ContentPagination`، `ConfirmDialog` و chartهای dashboard نیز componentهای مرکزی واقعی هستند و باید همان‌جا بازطراحی شوند.
- رنگ خام هنوز کاملاً حذف نشده است؛ به‌خصوص chartها و بخشی از dashboard roleها رنگ‌های Tailwind یا hex مستقیم دارند. بنابراین ادعای درست این است که «بیشتر رنگ‌ها» مرکزی هستند، نه همه رنگ‌ها.
- در Course1 فعلی provider یا selector مربوط به dark theme وجود ندارد. برنامه نباید برای مسئله‌ای که وجود ندارد scope یا token موازی بسازد.

## تصمیم معماری الزام‌آور

| موضوع | تصمیم |
| --- | --- |
| منبع رنگ | فقط semantic tokenهای `globals.css` |
| Card پایه | استفاده از `components/ui/card.tsx` برای Cardهای جدید |
| GlassCard موجود | ساده‌سازی مرکزی ظاهر با حفظ نام و props در طول migration |
| elementهای پرتکرار | بازطراحی در همان فایل مرکزی، نه override جدا در هر feature |
| component جدید | فقط پس از مشاهده حداقل دو consumer واقعی با ساختار و semantics یکسان |
| رنگ خام | در feature ممنوع؛ chart نیز از `--chart-*` یا mapping مرکزی استفاده کند |
| منطق | hook، endpoint، validation، i18n، route و config ناوبری بدون تغییر |

تغییر ظاهر مرکزی باید ابتدا در یک impact matrix از routeهای مصرف‌کننده بررسی شود و سپس در batchهای قابل review انجام شود. حفظ API به معنی حفظ appearance قدیمی نیست؛ نام `GlassCard` می‌تواند موقتاً باقی بماند تا بازطراحی به refactor پرریسک importها تبدیل نشود.

## پالت تأییدشده

مقادیر زیر مرجع بصری‌اند. در کد باید در همان ساختار OKLCH فعلی تعریف و از طریق `@theme inline` در دسترس Tailwind قرار گیرند؛ featureها نباید hex را کپی کنند.

| نقش | مرجع | نحوه استفاده |
| --- | --- | --- |
| Canvas / Card / Popover | `#FFFFFF` | تمام بوم و surfaceهای محتوایی |
| Foreground | `#424242` | متن اصلی؛ نسبت تقریبی با سفید `10.05:1` |
| Muted foreground | `#6B7280` | متن ثانویه؛ نسبت تقریبی `4.83:1` |
| Primary | `#1F1F8E` | sidebar، primary action، link فعال؛ نسبت تقریبی `12.77:1` با سفید |
| Primary hover | `#18187A` | hover اکشن اصلی |
| Primary active | `#141463` | pressed/active |
| Brand orange | `#F07915` | highlight یا surface محدود؛ نه متن عادی روی سفید |
| Orange foreground | `#111827` | متن روی surface نارنجی؛ نسبت تقریبی `6.29:1` |
| Orange text | `#B45309` | متن/آیکون معنایی نارنجی روی سفید؛ نسبت تقریبی `5.02:1` |
| Ring on primary | `#FFFFFF` | focus-visible روی سایدبار و هر surface آبی |
| Success strong | `#15803D` | متن یا surface قوی با foreground مناسب |
| Warning strong | `#B45309` | متن warning روی سفید؛ همان مقدار `--brand-orange-text` تا Badge و نمودار یک‌رنگ بمانند |
| Destructive strong | `#DC2626` | متن یا surface مخرب |
| Info strong | `#0369A1` | متن اطلاعاتی روی سفید |

### اصلاح‌های ضروری نسبت به رنگ‌های نسخه اول

- `#F07915` روی سفید حدود `2.82:1` است؛ برای متن عادی کافی نیست. خود نارنجی فقط decorative/accent یا surface با متن تیره باشد و نسخه `#B45309` برای متن استفاده شود.
- `#E6E6E6` روی سفید حدود `1.25:1` است. این رنگ فقط برای divider تزئینی مجاز است و نباید border ضروری input، focus یا state را بسازد.
- `#EAB308`, `#16A34A`, `#EF4444` و `#0EA5E9` به‌عنوان متن عادی روی سفید انتخاب مطمئنی نیستند. strong foregroundهای جدول بالا یا جفت‌های `*-soft` موجود استفاده شوند.
- `--accent` در shadcn سطح خنثی hover/focus برای menu و button است؛ تبدیل آن به نارنجی کل رابط را ناخواسته نارنجی می‌کند. نارنجی باید token مستقل `--brand-orange` داشته باشد.
- warning در نسخه‌های قبلی این اسناد دو مقدار داشت (`#A16207` و `#B45309`). مقدار نهایی `#B45309` است؛ در غیر این صورت Badge و slice نمودار برای یک داده دو رنگ متفاوت می‌گرفتند.
- `--ring` و پس‌زمینه سایدبار هر دو `#1F1F8E` هستند، پس focus داخل سایدبار نامرئی می‌شود. توکن `--ring-on-primary` سفید الزامی است.
- `--brand-teal` فعلی Course1 در هویت Course جایی ندارد و طبق [`rules.md`](./rules.md) بازنشسته می‌شود؛ teal فقط به‌عنوان `--chart-3` باقی می‌ماند.
- تغییر `--primary` از `oklch(0.55 0.19 255)` به `#1F1F8E` یک reskin سراسری است، نه تغییر رنگ سایدبار؛ روی هر Button، Link، Badge، ring و `--chart-1` اثر دارد.

مطابق WCAG 2.2، متن عادی حداقل نسبت `4.5:1`، متن بزرگ `3:1` و اطلاعات بصری ضروری component/state حداقل `3:1` نیاز دارد. رنگ نیز نباید تنها حامل معنا باشد. منابع: [Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)، [WCAG 2.2 - Non-text Contrast](https://www.w3.org/TR/WCAG22/#non-text-contrast)، [G111: استفاده از رنگ همراه نشانه دیگر](https://www.w3.org/WAI/WCAG22/Techniques/general/G111).

## نسبت استفاده پیشنهادی

- حدود 80٪ سفید و neutral برای canvas، Card، table و form.
- حدود 15٪ آبی/ایندیگو برای navigation، primary action، focus و link فعال.
- حداکثر حدود 5٪ نارنجی برای CTA ثانویه مهم، badge محدود یا highlight.
- statusها فقط بر اساس معنای واقعی داده و همراه label/icon استفاده شوند.
- tokenهای `--ct-course`, `--ct-event`, `--ct-podcast`, `--ct-youtube` و `--chart-*` حفظ شوند؛ تنوع نوع محتوای آموزشی و داده‌های نموداری نباید به دو رنگ برند تقلیل یابد.

قرارداد دقیق categorical/semantic، رنگ axis/grid/tooltip و migration هر role در [بازبینی سیستم رنگ نمودارها](./chart-color-system-review.md) ثبت شده و بر توضیح‌های کلی این سند اولویت دارد.

## مواردی که نباید انجام شوند

- ساخت `[data-dashboard-theme]` و نسخه دوم تمام tokenهای global.
- ساخت `DashboardCard` صرفاً به‌عنوان wrapper دیگری دور `Card` یا `GlassCard`.
- جایگزینی کور تمام consumerهای `GlassCard` یا rename هم‌زمان بیش از صد import.
- استفاده از نارنجی به‌عنوان `--accent` یا متن نارنجی روشن روی سفید.
- تضعیف `--border`, `--input` و `--ring` فعلی فقط برای شباهت ظاهری با border خیلی روشن Course.
- حذف رنگ‌های semantic/content/chart و انتقال معنا فقط با آبی و نارنجی.

## Gate این بازبینی

- فاز ۱ از tokenهای global موجود استفاده کند و token موازی نداشته باشد.
- `--ring-on-primary` اضافه شده باشد.
- warning در همه‌جا `#B45309` باشد.
- فاز ۳ ابتدا componentهای مرکزی موجود را بازطراحی کند.
- تمام فازها به «حذف ظاهر glass» اشاره کنند، نه اجبار به حذف نام `GlassCard`.
- معیارهای contrast یک‌بار با اسکریپت عددی فاز ۱ تست و در فاز ۷ همان خروجی ضمیمه شود.
- chartها فقط light palette داشته باشند و statusها بر اساس semantic key، نه index آرایه، رنگ بگیرند.
- یک showcase روی سفید شامل Button، Input، Card، Tabs، Dialog، Pagination، status و chart پیش از migration انبوه تأیید شود.
