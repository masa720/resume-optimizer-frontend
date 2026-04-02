import Header from "@/components/header";

const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-8 py-10">{children}</main>
    </div>
  );
};

export default AuthenticatedLayout;
