import Header from "@/components/header";

const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main className="flex-1 p-6">{children}</main>
    </>
  );
};

export default AuthenticatedLayout;
