import ReelsHeader from "@/Components/Structure/Header/ReelsHeader";

export default function ReelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto flex min-h-screen max-w-screen-2xl flex-col lg:flex-row lg:gap-8 lg:p-8">
      {/* Header Sidebar */}
      <aside className="w-full md:w-auto md:flex-shrink-0">
        <ReelsHeader />
      </aside>

      <div className="flex min-h-0 flex-1 flex-col">
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
