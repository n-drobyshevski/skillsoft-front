import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { AuthModals, CompactAuthModals } from "@/components/auth/auth-modals";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-semibold">SkillSoft</h1>
        </div>

        {/* Navigation - hidden on mobile */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <a href="/competencies" className="transition-colors hover:text-foreground/80">
            Competencies
          </a>
          <a href="/behavioral-indicators" className="transition-colors hover:text-foreground/80">
            Indicators
          </a>
          <a href="/assessment-questions" className="transition-colors hover:text-foreground/80">
            Questions
          </a>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center space-x-2">
          <SignedOut>
            {/* Desktop Auth Modals */}
            <div className="hidden sm:block">
              <AuthModals showLabels={true} />
            </div>
            
            {/* Mobile Auth Modals */}
            <div className="block sm:hidden">
              <CompactAuthModals />
            </div>
          </SignedOut>
          
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                  userButtonPopoverCard: "bg-background border border-border shadow-lg",
                  userButtonPopoverActionButton: "hover:bg-accent text-foreground",
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

export default Header;