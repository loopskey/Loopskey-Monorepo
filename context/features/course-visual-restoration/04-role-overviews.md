# فاز ۴: بازطراحی Overview نقش‌ها

پیش‌نیاز: [`rules.md`](./rules.md).

## قانون مرجع بصری

بخش‌های «مرجع Course» در این سند فقط **نشانی تاریخی** هستند و باز نمی‌شوند. ترکیب هدف هر Overview به‌صورت متنی زیر همان بخش آمده و همان قرارداد اجراست. تصمیم‌های spacing و شعاع از [`rules.md`](./rules.md) می‌آید.

## ترتیب اجرا

Overviewها به ترتیب `Professional -> Provider -> Organization -> Admin -> Association` مهاجرت شوند. پس از هر نقش screenshot و رفتار تأیید شود تا خطای طراحی در پنج dashboard تکثیر نشود.

## قواعد مشترک

- ترتیب داده و قابلیت از Course1 می‌آید؛ ترتیب بصری تا حد امکان از Course الهام می‌گیرد.
- صفحه با header فشرده شروع می‌شود، نه hero شیشه‌ای.
- KPIها بعد از header و در grid استاندارد قرار می‌گیرند.
- بخش‌های chart/list در Cardهای سفید و با gap `24px` قرار می‌گیرند.
- CTA اصلی آبی و CTAهای دیگر outline هستند.
- هر Overview باید loading، empty، error و success واقعی خود را حفظ کند.

## Professional Overview

### نشانی تاریخی Course (باز نشود)

- `Dashboard/professional/Home/ProfessionalHome.tsx`
- `ProfessionalHomeHeader.tsx`
- `HomeSummaryCards.tsx`
- `HomeChartPanel.tsx`
- `HomeActiveCourses.tsx`
- `HomeRecommendedGrid.tsx`
- `HomeUpcommingEvents.tsx`

### مقصد Course1

- `ProfessionalDashboard/ProfessionalOverviewTab.tsx`
- componentهای `overview-*.tsx` در `ProfessionalDashboard/parts`

### ترکیب هدف

1. header سفید و فشرده با welcome، توضیح، View Calendar و Browse Courses.
2. خلاصه وضعیت یادگیری؛ داده‌های فعلی Course1 حفظ و در کارت‌های ساده نشان داده شوند.
3. CPD progress، roadmap progress و upcoming calendar در grid یک/دو/سه‌ستونه.
4. recommendations در Card سفید تمام‌عرض.
5. recent activities و certificates در grid `2/3 + 1/3` desktop.

Course قدیمی chartهای PDU بیشتری در Overview داشت، اما نباید داده‌ای که Course1 در این endpoint ندارد جعل شود. اگر همان داده در tab tracker موجود است، فقط با تصمیم محصول به Overview افزوده شود.

## Provider Overview

### نشانی تاریخی Course (باز نشود)

- `Dashboard/provider/DashboardHome/WelcomeSection.tsx`
- `StatsGrid.tsx`
- `PerformanceSection.tsx`
- `UpcommingSession.tsx`
- `QuickActionSection.tsx`

### مقصد Course1

- `ProviderDashboard/ProviderOverviewTab.tsx`
- `ProviderDashboard/parts/provider-*.tsx`

### ترکیب هدف

1. welcome/header ساده با Refresh، View All Events و Create Event.
2. range filter به‌صورت segmented control یا گروه Button ساده؛ بدون wrapper Card مستقل و بزرگ.
3. چهار KPI: events، registrations، views و conversion.
4. performance chart در `2/3` و status summary در `1/3`.
5. upcoming events با rowهای compact؛ نه کارت‌های تو در تو با radius 24px.
6. quick actions با Buttonهای outline تمام‌عرض.
7. top events و tips در Cardهای ساده.

AreaChart گرادیانی فعلی به LineChart یا AreaChart با fill بسیار کم تبدیل شود. event cardهای `rounded-3xl bg-background/45` به row سفید با border و radius `8px` تبدیل شوند.

## Organization Overview

### نشانی تاریخی Course (باز نشود)

- `Dashboard/organization/OrgHome/OrgHome.tsx`
- `Dashboard/organization/OrgHome/KpiCard.tsx`

### مقصد Course1

- `OrgDashboard/OrgOverviewTab.tsx`
- `OrgDashboard/parts/org-overview-*.tsx`

### ترکیب هدف

1. header با عنوان، توضیح و Refresh.
2. چهار KPI: total members، active members، compliance و non-compliant.
3. compliance chart و members needing attention در grid `2/3 + 1/3` یا نزدیک به نسبت Course.
4. trending topics در Card تمام‌عرض.

کارت‌های داخلی `rounded-3xl bg-background/45` حذف و به rowهای ساده با divider یا border تبدیل شوند. progress و severity حفظ شود. tooltip نمودار سفید و بدون shadow بسیار بزرگ باشد.

## Admin Overview

### نشانی تاریخی Course (باز نشود)

- `Dashboard/admin/Home/AdminHome.tsx`
- `AdminHomeHeader.tsx`
- `AdminKpiGrid.tsx`
- `KpiCard.tsx`
- `ChartCard.tsx`

### مقصد Course1

- `AdminDashboard/AdminOverviewTab.tsx`
- `AdminDashboard/parts/admin-overview-metric-card.tsx`

### ترکیب هدف

1. header compact با وضعیت Live/Updating یا Refresh.
2. چهار KPI pipeline درخواست‌ها.
3. request trend و status distribution در grid دو ستونه.
4. recent users و recent audit logs در grid دو ستونه.

الگوی Admin Course کمی متراکم‌تر است: label کوچک، value بزرگ، icon box خنثی و hover shadow محدود. gradient hover قدیمی نیز به‌دلیل قرارداد سفید حذف شود.

## Association Overview

Course نقش Association نداشت؛ بنابراین این صفحه کپی مستقیم ندارد.

### مقصد Course1

- `AssociationDashboard/AssociationOverviewTab.tsx`
- componentهای `association-overview-*.tsx`

### قاعده استنتاج

- shell و KPI از Organization.
- requirements و attention از Organization compliance panels.
- reports و activity از Admin chart/list patterns.
- empty state انجمن از element مشترک فقط در صورت وجود consumer واقعی استفاده کند؛ در غیر این صورت local و ساده بماند.
- قابلیت‌ها و ترتیب داده Course1 حفظ شوند و فقط skin بصری یکسان شود.

## قرارداد رنگ نمودار Overviewها

- Professional: progress اصلی indigo و track خنثی؛ مقدار عددی و accessible summary حفظ شود.
- Provider: registrations indigo و revenue/comparison teal؛ area fill تک‌رنگ با opacity کم باشد.
- Organization: compliant سبز، at-risk نارنجی تیره و non-compliant قرمز بر اساس key ثابت داده باشند.
- Admin: trend تک‌سری indigo؛ approved سبز، pending نارنجی و rejected قرمز با semantic mapping نمایش داده شوند.
- Association: `renewalReady` سبز، `onTrack` indigo، `atRisk` نارنجی، critical قرمز و `notStarted` slate باشد.
- همه chartها روی Card سفید و فقط با light palette اجرا شوند؛ قرارداد کامل در [بازبینی سیستم رنگ نمودارها](./chart-color-system-review.md) است.

## معیار پذیرش هر Overview

بررسی مرورگر برای هر Overview فقط در دو viewport `375` و `1440` و در حالت success انجام شود. loading، empty و error با خواندن کد و حفظ شاخه‌های موجود تأیید شوند، نه با بازتولید مرورگری. حداکثر یک اسکرین‌شات `1440` برای هر نقش ذخیره شود و طبق [`rules.md`](./rules.md) وارد context نشود.

- [ ] header، CTA و KPIها در 375px بدون overflow هستند.
- [ ] در 1440px hierarchy شبیه Course و تراکم منطقی است.
- [ ] همه Cardها سفید هستند.
- [ ] هیچ ظاهر glass، `backdrop-blur`، glow یا radius `2rem` در subtree مهاجرت‌شده باقی نمانده است؛ باقی ماندن نام `GlassCard` با implementation مرکزی ساده‌شده مجاز است.
- [ ] همه رنگ‌ها از tokenهای semantic/content/chart آمده‌اند و raw color نقش‌محور اضافه نشده است.
- [ ] داده، link، refetch، mutation و empty/error behavior با قبل یکسان است.
- [ ] نمودارها در resize از container خارج نمی‌شوند.
- [ ] رنگ statusهای نمودار با Badge و متن همان status یکسان و مستقل از ترتیب آرایه است.
- [ ] chart canvas، tooltip و legend در حالت light-only سفید و خوانا هستند.
- [ ] کلیدهای i18n موجود مصرف شده‌اند و متن hard-code اضافه نشده است.

## Gate پایان فاز

پنج Overview در دو viewport `375` و `1440` و در حالت success تأیید شوند. بررسی متن فرانسوی فقط روی **یک** Overview با طولانی‌ترین متن انجام شود تا سرریز layout اثبات شود؛ تکرار آن روی پنج نقش لازم نیست.

برای تأیید کارفرما پنج تصویر `1440` نهایی کنار baseline موجود در [`baseline/course1/`](./baseline/course1/) ارائه شود.
