# فاز ۵: تب‌های داخلی داشبورد

پیش‌نیاز: [`rules.md`](./rules.md).

## راهبرد اجرا

مهاجرت بر اساس archetype انجام شود، نه صرفاً پوشه. ابتدا table/listها، سپس detail/formها، بعد chart-heavyها و در پایان settings. این ترتیب primitiveهای مشترک را زودتر تثبیت می‌کند.

جدول‌های «مرجع بصری Course» در این سند فقط نشانی تاریخی‌اند و باز نمی‌شوند؛ قواعد archetype در پایین همین سند قرارداد اجراست.

برای هر tab:

1. فایل مقصد Course1 و hook/endpointهای آن ثبت شود.
2. layout و component presentation تغییر کند.
3. query، mutation، validation، cache invalidation، URL و i18n ثابت بمانند.
4. ممیزی متنی با regexهای [`rules.md`](./rules.md) روی همان پوشه اجرا شود.

## بودجه بررسی این فاز

تعداد tabها زیاد است، پس بررسی مرورگر به سطح archetype محدود می‌شود، نه تک‌تک tabها:

- برای هر archetype (list/table، form/wizard، chart/report، settings، dialog/drawer) **یک** tab نماینده در `375` و `1440` کامل بررسی و یک اسکرین‌شات ذخیره شود.
- باقی tabهای همان archetype فقط smoke check شوند: باز شدن، نبود overflow افقی، و پاس شدن ممیزی متنی.
- loading/empty/error با حفظ شاخه‌های موجود در کد تأیید شوند؛ بازتولید مرورگری آن‌ها لازم نیست.
- عملیات create/edit/delete/export/upload فقط یک‌بار در نماینده archetype آزمایش شود.

## Professional

| Course1 tab | نشانی تاریخی Course (باز نشود) | نکته |
| --- | --- | --- |
| `calendar` | `Dashboard/professional/Calendar` | toolbar و calendar سفید و compact |
| `courses` | `Dashboard/professional/MyCourse` | Card دوره، filter و progress |
| `roadmap` | `Dashboard/professional/Roadmap` | timeline ساده؛ داده جدید حفظ شود |
| `certificates` | `Dashboard/professional/Certificates` | summary + grid/table سفید |
| `certificate-form` | نزدیک‌ترین form در Certificates | parent active state حفظ شود |
| `payments` | `Dashboard/professional/Payments` | summary و transaction list |
| `cpd-pdu-tracker` | `Dashboard/professional/PDU` | chart، filter، activity list |
| `cpd-pdu-progress` | `Dashboard/professional/PDU` | قابلیت جدید؛ skin قدیمی |
| `add-activity` | `PDU/LogInlineForm` | wizard فعلی حفظ، ظاهر ساده شود |
| `activity-detail` | row/detail الگوی PDU | deep link و back action حفظ شود |
| `external-learning` | PDU و Course cards | قابلیت جدید؛ ظاهر استنتاجی |
| `profile` | `Profile` template قدیمی | پنل‌های profile سفید |
| `wishlist` | `Wishlist` template قدیمی | card list و search ساده |
| `settings` | `Dashboard/professional/Setting` | section و fields سفید |

ترتیب پیشنهادی: `courses -> certificates -> payments -> calendar -> cpd tracker -> cpd progress -> activity flows -> roadmap -> profile -> wishlist -> settings`.

## Provider

| Course1 tab | نشانی تاریخی Course (باز نشود) |
| --- | --- |
| `my-events` | `Dashboard/provider/Events` |
| `create-event` | `Dashboard/provider/CreateEvent` |
| `attendees` | `Dashboard/provider/Attendees` |
| `analytics` | `Dashboard/provider/Analytics` |
| `promotion-requests` | `Dashboard/provider/Promotion` |
| `settings` | `Dashboard/provider/Settings` |
| `my-goals` | `Dashboard/common/DashboardGoals` |

ترتیب پیشنهادی: `my-events -> attendees -> promotion -> analytics -> create-event -> goals -> settings`.

## Organization

| Course1 tab | نشانی تاریخی Course (باز نشود) |
| --- | --- |
| `members` | `Dashboard/organization/Members` |
| `assignments` | `Dashboard/organization/Assignment` |
| `event-catalog` | `Dashboard/organization/Event` |
| `cpd-categories` | `Dashboard/organization/CPD` |
| `reports` | `Dashboard/organization/Report` |
| `settings` | `Dashboard/organization/OrganizationSettings.tsx` |

ترتیب پیشنهادی: `members -> assignments -> event catalog -> CPD categories -> reports -> settings`.

## Admin

| Course1 tab | نشانی تاریخی Course (باز نشود) | نکته |
| --- | --- | --- |
| `org-access-requests` | `Dashboard/admin/Access` | table/card responsive |
| `users` | `Dashboard/admin/Users` | filter، table، pagination |
| `organization-users` | `Dashboard/admin/Org` | detail subview حفظ شود |
| `associations` | نزدیک‌ترین Admin Org pattern | قابلیت جدید |
| `settings` | Admin Profile/Settings patterns | فرم ساده و سفید |

## Association

Course مرجع مستقیم ندارد. mapping بصری پیشنهادی:

| Course1 tab | archetype مرجع |
| --- | --- |
| `members` | Organization Members |
| `requirements` | Organization CPD + Assignment |
| `learning-content` | Event Catalog + Course cards |
| `reports` | Organization Reports |
| `messages` | Admin list/detail |
| `settings` | Organization Settings |

## قوانین خاص archetypeها

### List/Table

- filter bar ساده، table سفید، header خنثی، row hover بسیار روشن.
- mobile overflow داخل table container؛ صفحه نباید horizontal scroll بگیرد.
- pagination و bulk actions رفتار قبلی را حفظ کنند.

### Form/Wizard

- stepper ساده با primary برای مرحله فعال.
- preview panel سفید و sticky فقط در viewport مناسب.
- validation و dirty-state فعلی حفظ شود.
- submit دوگانه، dialog confirmation و upload behavior تغییر نکند.

### Chart/Report

- chart داخل Card سفید و tooltip سفید.
- export/filterها در header فشرده قرار گیرند.
- chart library همچنان lazy load شود.
- تک‌سری از indigo، دوسری از indigo/teal و categoryهای غیرمعنایی از palette مرکزی استفاده کنند.
- statusها از semantic key ثابت استفاده کنند؛ رنگ وابسته به index یا ترتیب response ممنوع است.
- axis، grid، legend، track و tooltip از tokenهای مرکزی [سیستم رنگ نمودارها](./chart-color-system-review.md) بیایند.
- dark palette یا branch مربوط به theme ساخته نشود؛ print/export نیز سفید باشد.
- summary یا جدول قابل‌دسترسی داده را مستقل از tooltip ارائه کند.

### Settings

- هر گروه setting یک Card یا section سفید با divider باشد.
- switch، select و input از primitiveهای استاندارد استفاده کنند.
- save bar در mobile قابل دسترس باشد و زیر rail عمودی یا کنترل sticky دیگری قرار نگیرد.

### Dialog/Drawer

- surface سفید، radius `12–16px`, border و shadow متوسط.
- backdrop ساده و بدون blur سنگین.
- title/description و focus trap حفظ شوند.

## کنترل بدهی در طول migration

- consumerهای migrate‌شده نباید override شیشه‌ای جدید به `GlassCard` یا `Card` اضافه کنند.
- رنگ chart، status و content type از token یا mapping مرکزی بیاید.
- fallbackهای JavaScript palette باید mirror توکن‌های `:root` باشند و پالت دوم مستقلی نسازند.
- بعد از هر batch، regexهای ممیزی [`rules.md`](./rules.md) روی همان پوشه اجرا شوند. این جست‌وجوها فقط audit هستند و جایگزینی کور و global ممنوع است.

## Gate پایان فاز

- همه tabهای config برای هر پنج نقش render و قابل پیمایش هستند.
- hidden/deep-link tabها parent active صحیح دارند.
- عملیات create/edit/delete/export/upload بدون regression انجام می‌شوند.
- loading/empty/error/success و keyboard behavior برای نماینده هر archetype تأیید شده‌اند.
- ممیزی متنی روی تمام پوشه‌های مهاجرت‌شده pass است.
- ظاهر همه tabها با قرارداد سفید و componentهای فاز ۳ سازگار است.
