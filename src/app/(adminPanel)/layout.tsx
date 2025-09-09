import Header from "./AdminHeader";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto flex min-h-screen max-w-[2560px] flex-col lg:flex-row">
      {/* Header Sidebar */}
      <aside className="w-full md:w-auto md:flex-shrink-0">
        <Header />
      </aside>

      <div className="flex min-h-0 flex-1 flex-col">
        <main className="flex min-h-0 flex-1 flex-col p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
