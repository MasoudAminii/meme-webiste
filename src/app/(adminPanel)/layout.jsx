import AdminHeader from "./AdminHeader";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export default async function AdminPanelLayout({ children }) {
  const session = await getServerSession(authOptions);
  const username = session?.user?.username ?? null;

  return (
    <div className="relative mx-auto flex min-h-screen max-w-[2560px] flex-col lg:flex-row">
      {/* Header Sidebar */}
      <aside className="w-full md:w-auto md:flex-shrink-0">
        <AdminHeader username={username} />
      </aside>

      <div className="flex min-h-0 flex-1 flex-col">
        <main className="flex min-h-0 flex-1 flex-col p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
