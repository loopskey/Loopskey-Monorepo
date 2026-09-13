import { LanguageToggleBtn } from "@elements/language-switcher";
import { UserMenu } from "@layouts/parts/user-menu";
import { Logo } from "@layouts/parts/logo";

export const DashboardTopBar = () => {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b bg-background px-3 md:px-6">
      <div className="flex w-full items-center justify-between gap-3">
        <Logo />

        <div className="flex items-center gap-2">
          <LanguageToggleBtn />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
