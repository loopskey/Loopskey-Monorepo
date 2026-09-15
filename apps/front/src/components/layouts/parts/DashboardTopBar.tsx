import { LanguageToggleBtn } from "@elements/language-switcher";
import { UserMenu } from "@layouts/parts/user-menu";
import { Logo } from "@layouts/parts/logo";

export const DashboardTopBar = () => {
  return (
    <header className="sticky top-0 z-40 w-full shrink-0 border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="flex items-center gap-2">
          <LanguageToggleBtn />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
