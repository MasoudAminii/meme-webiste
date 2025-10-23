import Header from "@/Components/Structure/Header/Header";
import Footer from "@/Components/Structure/Footer";
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto flex max-w-screen-2xl">
      <div className="flex min-h-screen w-full flex-col lg:origin-top lg:scale-[0.80] lg:flex-row lg:gap-8 lg:p-8 xl:scale-[0.90] 2xl:scale-100">
        {/* Header Sidebar */}
        <aside className="w-full max-lg:px-4 lg:sticky lg:top-8 lg:h-screen lg:w-auto">
          <Header />
        </aside>

        {/* Main Content Area - Uses flex-1 to fill remaining space */}
        <div className="flex min-h-0 flex-1 flex-col max-lg:px-4">
          {/* Main content takes available space minus footer */}
          <main className="flex flex-1 flex-col">{children}</main>

          {/* Footer sticks to bottom */}
          <footer className="">
            <Footer />
          </footer>
        </div>
      </div>
    </div>
  );
}
