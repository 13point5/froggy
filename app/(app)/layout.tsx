import { SignedIn, SignedOut } from "@clerk/nextjs";
import { SignInDialog, SignUpDialog } from "@/components/auth-dialogs";
import { Sidebar } from "@/components/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedOut>
        <header className="flex gap-2 justify-end p-4">
          <SignInDialog />
          <SignUpDialog />
        </header>
        {children}
      </SignedOut>
      <SignedIn>
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </SignedIn>
    </>
  );
}
