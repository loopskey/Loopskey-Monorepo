# فاز ۶: صفحات عمومی و احراز هویت

پیش‌نیاز: [`rules.md`](./rules.md).

## هدف

پس از تثبیت dashboard، همان زبان بصری ساده Course به صفحات عمومی و auth تعمیم داده شود. قابلیت‌ها و routeهای اضافه‌شده در Course1 حذف نمی‌شوند.

## قانون سفید در صفحات عمومی

قانون عمومی سفید در [`rules.md`](./rules.md) است. نکات مخصوص این فاز:

- footer تیره Course عیناً بازگردانده نمی‌شود؛ ساختار ستون‌ها حفظ می‌شود اما با border-top، متن تیره و linkهای muted روی سفید اجرا می‌شود.
- تمام `blur-3xl` blobهای تزئینی صفحات عمومی حذف شوند. این همان جایی است که بیشتر مصرف `--brand-teal` قرار دارد.

## بازنشستگی `--brand-teal`

این فاز تنها جایی است که توکن `--brand-teal` تعیین تکلیف می‌شود:

1. blur blobهای teal در `services/page.tsx`، `LandingOrgShowcase`، `LandingProviderSection`، `LandingRoadmapShowcase`، `LandingTestimonial` و `AboutPageClient` با حذف تزئینات از بین می‌روند.
2. badge و متن باقی‌مانده در `LandingOrgShowcase`، `LandingProviderSection` و `LandingRoadmapShowcase` به neutral یا `--brand-orange-text` منتقل شوند.
3. پس از اثبات صفر شدن مصرف با `rg`، سه توکن `--brand-teal`, `--brand-teal-foreground`, `--brand-teal-text` و mapping آن‌ها در `@theme inline` از `globals.css` حذف شوند.
4. این بازنشستگی شامل `--chart-3` نیست؛ teal به‌عنوان رنگ نمودار باقی می‌ماند.

## Header و Footer

### نشانی تاریخی Course (باز نشود)

- `components/templates/Navbar/NavbarPage.tsx`
- `components/modules/Navbar/*`
- `components/layouts/Footer.tsx`
- `components/modules/Footer/*`

### مقصد Course1

- `components/layouts/Header.tsx`
- `components/layouts/Footer.tsx`
- `components/layouts/parts/*`

### Header هدف

- ارتفاع `64px` مانند Course، background سفید و border-bottom ظریف.
- حالت scrolled فقط shadow کم اضافه کند؛ opacity و backdrop blur نداشته باشد.
- nav link عادی ساده و link فعال با متن primary و underline یا tint بسیار ملایم.
- mobile menu یک panel سفید با radius `12px` و shadow متوسط باشد؛ overlay blur حذف شود.
- Language، Start و User menu رفتار فعلی Course1 را حفظ کنند.

### Footer هدف

- ساختار چندستونه فعلی Course1 حفظ شود چون routeهای جدید بیشتری دارد.
- background سفید، border-top و فاصله عمودی متعادل.
- radial gradient و `backdrop-blur` حذف شود.
- social actionها outline ساده باشند.
- contrast متن muted روی سفید کنترل شود.

## Landing page

### نشانی تاریخی Course (باز نشود)

- `components/templates/Home/HomePage.tsx`
- `components/modules/Home/HeroSection/*`
- `components/modules/Home/RoadmapFeature.tsx`
- `components/modules/Home/FeaturedCategories.tsx`
- `components/modules/Home/FeaturedContent/*`
- `components/modules/Home/Services.tsx`
- `components/modules/Home/CTA.tsx`

### مقصد Course1

- `components/modules/Landing/*`
- `components/modules/Landing/parts/*`

### ترتیب پیشنهادی

1. Hero با headline، توضیح، search و CTA؛ بدون glow/blur/gradient text.
2. Roadmap showcase.
3. Popular categories.
4. Featured/spotlight content.
5. Provider و Organization sections.
6. Services و testimonial.
7. CTA پایانی.

sectionهای Course1 از نظر feature غنی‌تر هستند و باید حفظ شوند. فقط hierarchy، card style، spacing و background مطابق Course ساده شود. SplitText و animationهای سنگین در صورت حفظ باید reduced-motion و کوتاه شوند؛ حذف آن‌ها ترجیح دارد اگر ارزش محتوایی ندارند.

## Content catalog و search

- `/content` مقصد اصلی Course1 است و route قدیمی `/search` یا `/courses` جایگزین آن نمی‌شود.
- search bar، filter sidebar، result grid، pagination و stateها همان الگوی ساده و سفید بقیه فازها را بگیرند؛ فایل قدیمی `SearchResults` باز نمی‌شود.
- Card محتوا سفید، border ظریف، radius `12px` و تصویر با aspect ratio ثابت باشد.
- filter در desktop sidebar و در mobile drawer/dialog قابل دسترس باشد.
- tab نوع محتوا، query string و رفتار endpoint فعلی Course1 ثابت بماند.

## صفحات جزئیات محتوا

| Course1 | نشانی تاریخی Course (باز نشود) |
| --- | --- |
| `courses/[slug]` | `CourseDetails` و `Course/CourseSidebar` |
| `events/[slug]` | `Event/EventDetailsPage` |
| `podcasts/[slug]` | `Podcast/PodcastDetailPage` |
| `youtube/[slug]` | `Youtube/YoutubeDetailsPage` |

- route و slug نسخه دوم حفظ شود.
- hero جزئیات از حالت glass به layout سفید دو ستونه تبدیل شود.
- action sidebar سفید، sticky و borderدار باشد.
- metadata به badgeهای ساده و بخش‌ها به Card سفید تقسیم شوند.
- curriculum، schedule، episodes، videos، review form و review list از نظر رفتار تغییر نکنند.

## Auth و activation

### مقصدها

- Professional، Provider، Organization، Association و Admin auth.
- Organization/Association activation.
- OAuth bridge و password-change flowهای موجود.

### طراحی هدف

- بوم سفید، Card مرکزی سفید با border و shadow کم.
- panel تزئینی glass یا gradient حذف شود یا به تصویر/رنگ تخت محدود تبدیل شود.
- input و button از primitiveهای فاز ۳ استفاده کنند.
- role identity با icon یا label کوچک نشان داده شود، نه background بزرگ رنگی.
- error، validation، OTP، loading و redirect stateها حفظ شوند.
- password manager، autofill، keyboard submit و screen-reader labelها بررسی شوند.

## صفحات شرکتی و ثابت

صفحات `about`, `contact`, `faq`, `services`, `solutions/*`, `company/*`, `support/*`, `terms`, `privacy-policy` و `cookies` الزاماً در Course نمونه مستقیم ندارند.

- از همان container `max-w-7xl`, section gap و Card سفید استفاده کنند.
- صفحات متنی طولانی حداکثر عرض خوانا داشته باشند.
- decorative gradientها حذف شوند.
- نقشه، accordion، form و link behavior فعلی باقی بمانند.

## حذف نهایی legacy visualها

پس از مهاجرت آخرین consumer ظاهر قدیمی، و فقط با اثبات `rg`:

- propهای compatibility، CSSهای `glass-panel`, `glass-card-enter` و variantهای gradient حذف شوند.
- توکن‌های `--brand-teal*` طبق بخش بازنشستگی بالا حذف شوند.
- [`galaxy-background.tsx`](../../../apps/front/src/components/elements/galaxy-background.tsx) صفر مصرف‌کننده دارد و حذف شود.
- `split-text.tsx` (۲ مصرف) و `reveal-scroll.tsx` (۱۶ مصرف) نگه داشته می‌شوند اما باید با `prefers-reduced-motion` و دامنه motion [`rules.md`](./rules.md) سازگار شوند؛ حذف‌شان لازم نیست.
- rename احتمالی `GlassCard` در cleanup مستقل انجام شود.
- هیچ class یا token مورد استفاده صفحه مهاجرت‌نشده‌ای زودتر حذف نشود.

### Gate بودجه این فاز

صفحات عمومی زیادند؛ بررسی مرورگر به این موارد محدود شود: landing، `/content`، یک صفحه detail، یک صفحه auth و یک صفحه ثابت متنی — هرکدام در `375` و `1440`. باقی صفحات فقط با ممیزی متنی `rg` تأیید شوند.

## Gate پایان فاز

- تمام routeهای عمومی و auth روی بوم سفید هستند.
- header و footer در mobile/desktop پایدارند.
- search/filter/detail/auth flowها regression ندارند.
- هیچ route جدید Course1 برای شبیه‌سازی Course حذف یا rename نشده است.
- صفحات طولانی، dialogها و dropdownها contrast و focus صحیح دارند.
