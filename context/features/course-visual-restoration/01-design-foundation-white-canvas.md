# فاز ۱: پایه طراحی و بوم کاملاً سفید

پیش‌نیاز: [`rules.md`](./rules.md). پالت مرجع، قانون سفید، قرارداد شعاع/سایه/motion و بودجه اجرا آنجاست و در این سند تکرار نمی‌شود.

## هدف

زبان بصری Course با استفاده از همان سیستم token مرکزی Course1 بازسازی شود. خروجی این فاز یک foundation سراسری و قابل استفاده مجدد است؛ نه theme موازی برای dashboard و نه classهای رنگی پراکنده در featureها.

## تصمیم معماری

- `apps/front/src/app/globals.css` تنها منبع حقیقت رنگ، radius و surface باقی می‌ماند.
- tokenهای فعلی `--background`, `--foreground`, `--card`, `--primary`, status، content type، chart، `--border`, `--input` و `--ring` بازتنظیم یا حفظ می‌شوند.
- tokenهای `--dashboard-*` و wrapperهایی مانند `[data-dashboard-theme]` ساخته نمی‌شوند.
- `@theme inline` فقط tokenهای global واقعاً مصرف‌شده را expose می‌کند.
- featureها فقط classهای semantic مانند `bg-background`, `bg-card`, `text-foreground`, `text-primary` و `border-input` مصرف می‌کنند.

## کارهای مشخص این فاز روی `globals.css`

1. مقادیر پالت مرجع [`rules.md`](./rules.md) در ساختار OKLCH فعلی تنظیم شوند.
2. توکن جدید `--ring-on-primary` (سفید) اضافه و در `@theme inline` expose شود. بدون آن، focus داخل سایدبار آبی نامرئی است.
3. توکن‌های `--brand-orange`, `--brand-orange-foreground`, `--brand-orange-text` اضافه شوند.
4. `--brand-teal*` **دست‌نخورده باقی بماند** و فقط به‌عنوان deprecated علامت بخورد؛ حذف آن در فاز ۶ و پس از صفر شدن ۱۳ consumer انجام می‌شود.
5. توکن‌های semantic نمودار (`--chart-semantic-*` و `--chart-track`) در همان `:root` تعریف شوند.
6. مقدار warning در کل فایل `#B45309` باشد تا Badge، متن status و slice نمودار یکسان بمانند.

### هشدار دامنه `--primary`

تغییر `--primary` از مقدار فعلی `oklch(0.55 0.19 255)` به `#1F1F8E` فقط رنگ سایدبار نیست: روی هر Button، Link، Badge، `--ring` و `--chart-1` در تمام ۴۶۷ فایل فرانت اثر می‌گذارد. این تغییر یک reskin سراسری است و باید:

- در یک commit مستقل و قابل برگشت انجام شود.
- بلافاصله بعد از آن، showcase و یک صفحه عمومی (landing یا auth) از نظر دکمه و لینک بازبینی شوند.

## قانون `--accent`

در shadcn، `--accent` سطح خنثی hover/focus برای menu item و buttonهای ghost/outline است. این token هرگز `#F07915` نمی‌شود. نارنجی هویتی token مستقل دارد و فقط در consumerهای عمدی استفاده می‌شود.

## content type و chart

- tokenهای `--ct-course`, `--ct-event`, `--ct-podcast`, `--ct-youtube` حفظ شوند.
- `--chart-1` تا `--chart-8` برای categorical data و tokenهای semantic مجزا برای success/on-track/warning/danger/neutral در همان `:root` تعریف شوند.
- status بر اساس key داده رنگ بگیرد، نه index آرایه.
- hex یا رنگ Tailwind خام در chart component و featureها جای خود را به token/mapping مرکزی بدهد.
- chart canvas، tooltip و export فقط light و سفید هستند.
- مقادیر دقیق و mapping هر role در [بازبینی سیستم رنگ نمودارها](./chart-color-system-review.md) الزام‌آور است.

## ترتیب اجرای foundation

1. اعداد inventory [فاز ۰](./00-visual-audit-and-scope.md) به‌عنوان impact baseline پذیرفته شوند؛ inventory جدید تولید نشود.
2. پالت semantic در `globals.css` تنظیم و توکن‌های جدید اضافه شوند.
3. primitiveهای `ui` شامل Card، Button، Input، Dialog و focus state روی showcase بررسی شوند.
4. elementهای مرکزی glass در فاز ۳ با حفظ API ساده شوند.
5. رنگ‌های خام در chart/feature به صف مهاجرت فاز ۳ افزوده شوند.

## Showcase — الزام، نه پیشنهاد

صفحه showcase مهم‌ترین ابزار کاهش هزینه کل پروژه است: تأیید یک‌باره توکن‌ها روی **یک صفحه**، به‌جای کشف خطای پالت در پنج داشبورد.

- یک route موقت مانند `/dev/showcase` ساخته شود که پشت flag محیطی باشد و در production render نشود.
- شامل Button (تمام variantها)، Input/Select/Textarea، Card، Tabs، Dialog، Pagination، Badge/status، جدول و یک نمونه از هر archetype نمودار باشد.
- stateهای default، hover، focus-visible، disabled و error روی همان صفحه دیده شوند.
- نمونه focus روی surface آبی نیز حضور داشته باشد تا `--ring-on-primary` اثباتاً کار کند.
- این صفحه تا پایان فاز ۷ باقی بماند و در cleanup نهایی حذف شود.

## اسکریپت کنترل کنتراست

به‌جای بررسی چشمی یا مرورگری کنتراست در هر صفحه، یک اسکریپت node یک‌بار نسبت‌های پالت را عددی حساب کند:

- جفت‌های `foreground/background`, `muted-foreground/background`, `primary-foreground/primary`, `brand-orange-text/background`, `brand-orange-foreground/brand-orange`, هر status strong روی سفید، `ring/background` و `ring-on-primary/primary`.
- آستانه: متن عادی `4.5:1`، متن بزرگ و اطلاعات بصری ضروری `3:1`.
- خروجی به‌صورت جدول pass/fail ثبت شود و همین خروجی مدرک بند کنتراست فاز ۷ باشد.

این اسکریپت در `apps/front` به‌عنوان test اضافه نشود؛ یک ابزار یک‌بارمصرف در scratchpad کافی است.

## چک‌لیست اجرا

- [ ] هیچ token با prefix `--dashboard-` اضافه نشده است.
- [ ] background، Card و Popover سفید کامل‌اند.
- [ ] `--accent` خنثی باقی مانده و نارنجی token مستقل دارد.
- [ ] `--ring-on-primary` اضافه شده و روی سایدبار قابل مشاهده است.
- [ ] warning در همه‌جا `#B45309` است.
- [ ] `--brand-teal` فقط deprecated علامت خورده و حذف نشده است.
- [ ] input border و focus ring حداقل contrast لازم را دارند.
- [ ] متن نارنجی روشن، زرد روشن، سبز روشن یا آبی روشن روی سفید استفاده نشده است.
- [ ] tokenهای content type و chart حفظ شده‌اند.
- [ ] categorical و semantic chart palette از یکدیگر جدا و فقط در `:root` تعریف شده‌اند.
- [ ] هیچ dark chart token یا selector اضافه نشده است.
- [ ] raw color جدید در feature اضافه نشده است.
- [ ] خروجی اسکریپت کنتراست کامل pass است.

## Gate پایان فاز

showcase در چهار viewport و stateهای default، hover، focus، disabled و error تأیید شود. خروجی اسکریپت کنتراست pass باشد. lint و type-check پاس شوند و تا قبل از تأیید این foundation، migration انبوه صفحات آغاز نشود.
