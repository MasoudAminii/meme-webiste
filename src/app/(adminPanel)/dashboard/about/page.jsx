import AboutContainer from "./AboutContainer";
import prisma from "@/lib/db";

const AboutDashboard = async () => {
  const aboutData = await prisma.aboutUs.findFirst();

  return (
    <div className="min-h-screen">
      <div className="max-w-screen-xl">
        {/* Header */}
        <div className="bg-bg-1 mb-6 flex items-center justify-between rounded-2xl p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold">داشبورد صفحه درباره ما</h1>
            <p className="text-light-dark mt-1">
              نمایش و مدیریت محتوای صفحه درباره ما — (داده‌ها همان‌طور که ارسال
              کردید هستند)
            </p>
          </div>
        </div>
        <div className="AboutContainerWrapper">
          <AboutContainer data={aboutData} />
        </div>
      </div>
    </div>
  );
};

export default AboutDashboard;
