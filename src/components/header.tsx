"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Header = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="border-b">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-semibold">Resume Optimizer</h1>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm hover:underline">
              New
            </Link>
            <Link href="/analyses" className="text-sm hover:underline">
              History
            </Link>
          </nav>
        </div>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </header>
  );
};

export default Header;
