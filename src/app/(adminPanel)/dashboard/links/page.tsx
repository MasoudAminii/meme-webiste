import prisma from "@/lib/db";
import LinksContainer from "./LinksContainer";

const page = async () => {
  const linksData = await prisma.link.findMany({
    orderBy: { position: "asc" }, // ✅ Add this
  });
  return (
    <div>
      <div className="max-w-screen-xl">
        <div className="bg-bg-1 mb-6 flex items-center justify-between rounded-2xl p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold">داشبورد مدیریت</h1>
            <p className="text-light-dark mt-1">نمای کلی آمار و عملکرد سیستم</p>
          </div>
        </div>
        <div className="LinksContainer">
          <LinksContainer data={linksData} />
        </div>
      </div>
    </div>
  );
};

export default page;
