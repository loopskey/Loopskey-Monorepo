# فاز ۲: پوسته داشبورد و سایدبار ریسپانسیو

پیش‌نیاز: [`rules.md`](./rules.md). قوانین رنگ، ممنوعیت ظاهر شیشه‌ای، قرارداد motion و بودجه اجرا آنجاست.

## هدف

پوسته مشترک Course1 به رنگ‌بندی و هندسه سایدبار نسخه اول برگردد، اما در ریسپانسیو به‌جای Bottom Navigation یک rail عمودی icon-only داشته باشد. config مرکزی، Linkها، role resolution، i18n و guardهای نسخه دوم دست‌نخورده می‌مانند.

این تغییر دقیقاً در فاز ۲ قرار می‌گیرد؛ چون یک تغییر shell و navigation مشترک است و باید پیش از بازطراحی محتوای roleها تکمیل شود.

## تصمیم نهایی breakpoint

- از `md` یعنی عرض `768px` به بالا: سایدبار باز با عرض `256px` و نمایش آیکون + متن.
- پایین‌تر از `md`: سایدبار عمودی فشرده با عرض `72px` و نمایش فقط آیکون.
- در عرض دقیق `768px` حالت باز و متن‌دار استفاده شود.
- Bottom Navigation، دکمه More و More sheet در dashboard استفاده نشوند.
- تمام tabها در همان rail عمودی در دسترس بمانند و nav داخلی در صورت کمبود ارتفاع scroll شود.

## فایل‌های مرجع

### Course برای ظاهر

این فاز تنها جایی است که خواندن کد پروژه قدیمی مجاز است، و فقط این دو مورد:

- `../Course/apps/front/src/components/elements/Sidebar.tsx`
- بخش `Dashboard Sidebar` در `../Course/apps/front/src/app/globals.css`

هندسه قوس، عرض‌ها و ارتفاع‌ها در همین سند به‌صورت عددی آمده‌اند؛ اگر این دو فایل هم نیاز نشدند، باز نشوند. فایل‌های `DashboardLayout.tsx`, `*DashboardItem.tsx`, `BtnNav.tsx` و `MoreSheet.tsx` نسخه اول باز نمی‌شوند: اولی‌ها معادل دقیق در Course1 دارند و دو تای آخر مربوط به Bottom Navigation‌اند که حذف شده است.

### Course1 برای معماری و داده

- `apps/front/src/components/layouts/DashboardLayout.tsx`
- `apps/front/src/components/layouts/parts/DashboardSidebar.tsx`
- `apps/front/src/components/layouts/parts/DashboardBottomNav.tsx`
- `apps/front/src/components/layouts/parts/DashboardSkeleton.tsx`
- `apps/front/src/utils/dashboard-nav.config.ts`

`DashboardBottomNav.tsx` پس از حذف آخرین consumer باید بازنشسته شود؛ حذف آن پیش از اثبات صفر شدن consumer مجاز نیست.

## نتیجه بررسی وضعیت فعلی Course1

این طراحی هنوز در کد فعلی اعمال نشده است:

- `DashboardSidebar.tsx` اکنون sidebar سفید/خنثی با border دارد و background آبی نسخه اول را ندارد.
- active item فعلی یک pill آبی با `rounded-2xl` است؛ pseudo-elementهای بالا و پایین و اتصال قوسی نسخه اول وجود ندارند.
- breakpoint فعلی sidebar از `md` با عرض `84px` شروع می‌شود، متن فقط از `xl` دیده می‌شود و عرض باز `288px` است.
- `DashboardBottomNav.tsx` هنوز زیر `md` render می‌شود و همه tabها را در grid چهارستونه قرار می‌دهد.

پس نتیجه ممیزی «اعمال نشده» است. اجرای موارد این سند باید وضعیت بالا را به قرارداد جدید تبدیل کند.

## ساختار shell هدف

### از md به بالا

```text
┌────────────── 256px ──────────────┬──────────────────────────────┐
│ blue sidebar / icon + text        │ white main canvas            │
│ logo row: 64px                    │ padding: 24px                 │
│ nav item: 60px                    │ content: fluid, min-width 0   │
│ scroll nav when needed            │ independent vertical scroll  │
└───────────────────────────────────┴──────────────────────────────┘
```

### پایین md

```text
┌── 72px ──┬────────────────────────┐
│ blue rail│ white main canvas      │
│ logo mark│ padding: 12–16px       │
│ icons    │ content: min-width 0   │
│ scroll   │ independent scroll     │
└──────────┴────────────────────────┘
```

- dashboard container ارتفاع viewport و `overflow-hidden` داشته باشد.
- `main` دارای `min-w-0`, `overflow-y-auto` و background سفید کامل باشد.
- padding main در زیر `md` برابر `12–16px` و از `md` به بالا `24px` باشد.
- به‌دلیل باقی ماندن rail عمودی، padding پایین ویژه Bottom Navigation حذف شود.
- max-width فعلی `7xl` فقط اگر با صفحه مرجع هم‌خوان است حفظ شود؛ tableهای عریض باید از فضای در دسترس استفاده کنند.
- header و footer سراسری تغییر معماری نمی‌کنند. ارتفاع و scroll dashboard با حضور آن‌ها در browser کنترل شود.

## رنگ و هندسه سایدبار

- background کامل: semantic token `--primary` با مرجع بصری `#1F1F8E`؛ hex در layout تکرار نشود.
- focus-visible داخل سایدبار از `--ring-on-primary` (سفید) استفاده کند، نه `--ring`؛ چون `--ring` و پس‌زمینه سایدبار هر دو `#1F1F8E` هستند و ring نامرئی می‌شود.
- foreground عادی: سفید.
- logo row: ارتفاع `64px`.
- nav item در حالت باز: ارتفاع `60px`، آیکون با فضای ثابت حدود `60px` و عنوان در ادامه.
- nav item در حالت compact: اندازه بصری حداقل `56x56px` و آیکون در مرکز rail.
- item عادی: متن و آیکون سفید.
- hover و active: background سفید، متن و آیکون از `--primary`.
- transition رنگ و background حدود `150–200ms` و بدون blur، scale یا glow باشد.

## الزام قوس نسخه اول

قوس فقط یک توضیح پیشنهادی نیست و باید واقعاً پیاده‌سازی شود:

- item در hover و active به سطح سفید main متصل شود.
- شعاع item باز حدود `30px` باشد.
- دو pseudo-element بالا و پایین، اتصال مقعر/قوسی نسخه اول را بسازند.
- در rail فشرده همان فرم با نسبت کوچک‌تر، شعاع حدود `24px` و pseudo-element متناسب اجرا شود.
- قوس روی hover با mouse و روی active در تمام ورودی‌ها دیده شود.
- روی دستگاه touch که hover پایدار نیست، active state مسیر جاری همیشه قوس را نشان دهد.
- pseudo-elementها نباید hit area، focus ring یا کلیک tab مجاور را مسدود کنند.
- قوس همیشه در لبه مجاور محتوای اصلی قرار گیرد. محصول فقط EN/FR و LTR است؛ هیچ کار یا تستی برای RTL انجام نمی‌شود.

## ساختار semantic آیتم‌ها

- هر tab یک `Link` واحد داخل `li` باشد.
- `button` داخل `Link`، `Link` داخل `button` یا هر interactive element تو در تو ممنوع است.
- ظاهر آیتم نباید شبیه مجموعه‌ای از buttonهای جداگانه داخل یک پنل باشد؛ خود سایدبار یک navigation rail یکپارچه است.
- source آیتم‌ها همچنان `dashboard-nav.config.ts` باشد.
- query string و deep linkهای فعلی حفظ شوند.
- `aria-current="page"` برای مسیر فعال اعمال شود.

## رفتار متن در breakpointها

- از `md` به بالا label ترجمه‌شده هر tab دیده شود.
- پایین `md` label بصری مخفی شود، اما accessible name حذف نشود.
- در icon-only rail، label با `aria-label` و متن `sr-only` در دسترس screen reader باشد.
- tooltip ترجمه‌شده روی hover و keyboard focus نمایش داده شود.
- tooltip نباید تنها راه دسترسی به نام باشد.
- iconها اندازه ثابت حدود `20–22px` داشته باشند تا rail نلرزد.

## Logo و هویت نقش

- از `md` به بالا logo/mark به‌همراه label نقش ترجمه‌شده نمایش داده شود.
- پایین `md` فقط mark فشرده نمایش داده شود.
- labelهای نقش از i18n و نقش واقعی user بیایند.
- پایین سایدبار در حالت باز می‌تواند role/user summary ساده داشته باشد.
- در حالت compact، summary متنی مخفی و در صورت نیاز avatar یا role icon با accessible label نمایش داده شود.
- هیچ بخش سایدبار glass یا نیمه‌شفاف نباشد.

## دسترسی همه tabها

چون More sheet حذف می‌شود، هیچ tab فرعی از config جدا نمی‌شود:

- Professional: تمام ۱۰ آیتم config در nav scrollable.
- Provider: تمام ۸ آیتم.
- Organization: تمام ۷ آیتم.
- Admin: تمام ۶ آیتم.
- Association: تمام ۷ آیتم.

ترتیب فعلی config حفظ شود. در viewport کم‌ارتفاع، فقط container ناوبری scroll شود و logo/identity تا حد امکان ثابت بمانند.

## سازگاری tabها

- labelها همچنان از `labelKey` و i18n بیایند.
- state داخلی قدیمی Course برنگردد؛ `Link` و URL منبع navigation باقی بمانند.
- parent mapping مانند `certificate-form -> certificates` حفظ شود.
- tabهای detail فرعی که در config نمایش داده نمی‌شوند parent صحیح را active کنند.
- back/forward مرورگر و refresh روی URL مستقیم state صحیح را نشان دهند.

## Skeleton

`DashboardSidebarSkeleton` باید هر دو حالت را بدون layout shift تقلید کند:

- از `md` به بالا عرض `256px`، logo placeholder و rowهای آیکون + متن.
- پایین `md` عرض `72px` و rowهای icon-only.
- background skeleton shell با سایدبار آبی هماهنگ باشد و placeholderها contrast ملایم داشته باشند.
- `DashboardBottomNavSkeleton` پس از حذف آخرین consumer بازنشسته شود.

## فایل‌های مورد تغییر در این فاز

- `components/layouts/DashboardLayout.tsx`
- `components/layouts/parts/DashboardSidebar.tsx`
- `components/layouts/parts/DashboardSkeleton.tsx`
- `utils/dashboard-nav.config.ts` فقط در صورت نیاز به metadata دسترس‌پذیری؛ placement موبایل اضافه نمی‌شود.
- `app/globals.css` برای classهای shell و هندسه قوسی محدود به navigation؛ رنگ فقط از tokenهای global فاز ۱ خوانده شود.
- `DashboardBottomNav.tsx` و import آن، فقط پس از اثبات عدم مصرف حذف شوند.

## Gate پایان فاز

سایدبار یک component مشترک است، پس تأیید آن روی **یک نقش** انجام و برای چهار نقش دیگر فقط render شدن nav و صحت آیتم‌ها بررسی می‌شود. حداکثر دو اسکرین‌شات before/after (`375` و `1440`) ذخیره شود؛ طبق [`rules.md`](./rules.md) وارد context نشود.

- سایدبار عمودی روی نقش مرجع در `375`, `768` و `1440` تأیید شده و چهار نقش دیگر smoke check شده‌اند.
- در `767px` فقط icon و در `768px` icon + text دیده می‌شود.
- هیچ Bottom Navigation، More button یا More sheet در dashboard render نمی‌شود.
- hover و active واقعاً فرم قوسی سفید نسخه اول را نشان می‌دهند.
- tabها interactive nesting ندارند و هرکدام یک Link semantic هستند.
- tooltip، `aria-label`, `sr-only`, focus-visible و `aria-current` تأیید شده‌اند.
- focus-visible داخل سایدبار آبی با `--ring-on-primary` واقعاً دیده می‌شود.
- nav در ارتفاع کم scroll می‌شود و هیچ tab گم نمی‌شود.
- direct URL و back/forward active state صحیح دارند.
- main و تمام سطح محتوایی سفید کامل هستند.
