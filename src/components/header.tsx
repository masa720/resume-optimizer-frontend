"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fetchProfile } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ArrowRightStartOnRectangleIcon,
  ClockIcon,
  HomeIcon,
  PlusIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchProfile();
        setDisplayName(profile.username);
      } catch {
        // Profile not found — fall back to email
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email) {
          setDisplayName(data.user.email);
        }
      }
    };
    loadProfile();

    const handleProfileUpdate = (e: Event) => {
      const { username } = (e as CustomEvent).detail;
      setDisplayName(username);
    };
    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("profile-updated", handleProfileUpdate);
  }, []);

  const navLinkClass = (href: string) => {
    const isActive =
      href === "/" ? pathname === "/" : pathname?.startsWith(href);

    return [
      "inline-flex items-center gap-1.5 rounded-[var(--radius-control)] px-3 py-1.5 text-[13px] font-medium transition-colors",
      isActive
        ? "bg-primary/12 text-foreground"
        : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
    ].join(" ");
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/88 backdrop-blur-lg">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-base font-bold tracking-tight text-foreground"
          >
            <Image
              src="/favicon.svg"
              alt="Resume Optimizer logo"
              width={36}
              height={36}
              className="h-9 w-9"
              priority
            />
            Resume Optimizer
          </Link>

          <nav className="ml-1 hidden items-center gap-1 rounded-(--radius-control) border border-border/70 bg-card/70 p-1 md:flex">
            <Link href="/" className={navLinkClass("/")}>
              <HomeIcon className="size-4" />
              Home
            </Link>
            <Link href="/new" className={navLinkClass("/new")}>
              <PlusIcon className="size-4" />
              Analyze
            </Link>
            <Link href="/analyses" className={navLinkClass("/analyses")}>
              <ClockIcon className="size-4" />
              History
            </Link>
          </nav>

          <div className="ml-auto hidden items-center gap-1 rounded-(--radius-control) border border-border/70 bg-card/70 p-1 sm:flex">
            {displayName && (
              <Link href="/settings" className={navLinkClass("/settings")}>
                <UserCircleIcon className="size-4" />
                {displayName}
              </Link>
            )}
            <button
              className="inline-flex items-center gap-1.5 rounded-(--radius-control) px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
              onClick={handleSignOut}
            >
              <ArrowRightStartOnRectangleIcon className="size-4" />
              Sign out
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-1 border-t border-border/60 py-2 md:hidden">
          <Link href="/" className={navLinkClass("/")}>
            <HomeIcon className="size-4" />
            Home
          </Link>
          <Link href="/new" className={navLinkClass("/new")}>
            <PlusIcon className="size-4" />
            Analyze
          </Link>
          <Link href="/analyses" className={navLinkClass("/analyses")}>
            <ClockIcon className="size-4" />
            History
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
