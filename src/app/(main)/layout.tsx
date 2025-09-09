import Header from "@/Components/Structure/Header/Header";
import Footer from "@/Components/Structure/Footer";
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto flex min-h-screen max-w-screen-2xl flex-col max-lg:px-4 lg:flex-row lg:gap-8 lg:p-8">
      {/* Header Sidebar */}
      <aside className="w-full md:w-auto md:flex-shrink-0">
        <Header />
      </aside>

      {/* Main Content Area - Uses flex-1 to fill remaining space */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Main content takes available space minus footer */}
        <main className="flex flex-1 flex-col">{children}</main>

        {/* Footer sticks to bottom */}
        <footer className="mt-auto flex-shrink-0">
          <Footer />
        </footer>
      </div>
    </div>
  );
}
