"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

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
        <h1 className="text-lg font-semibold">Resume Optimizer</h1>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </header>
  );
};

export default Header;
