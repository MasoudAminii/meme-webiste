import Image from "next/image";
import NavLinks from "./NavLinks";
import ThemeChange from "./ThemeChange";
import { GoHomeFill } from "react-icons/go";
import { BsImageFill } from "react-icons/bs";
import { HiSquares2X2 } from "react-icons/hi2";
import { FaPenSquare } from "react-icons/fa";
import InstallPWAButton from "@/Components/Structure/InstallPWAButton";
import Link from "next/link";

const navLinks = [
  {
    href: "/",
    label: "صفحه اصلی",
    icon: <GoHomeFill size={30} />,
    match: ["/"],
  },
  {
    href: "/gallery",
    label: "گالری آثار",
    icon: <BsImageFill size={30} />,
    match: ["/gallery"],
  },
  {
    href: "/reels",
    label: "حلقه فیلم",
    icon: <HiSquares2X2 size={30} />,
    match: ["/reels", "/video"],
  },
  {
    href: "/about-us",
    label: "درباره ما",
    icon: <FaPenSquare size={30} />,
    match: ["/about-us"],
  },
];

const Header = () => {
  return (
    <>
      {/* Desktop Nav */}
      <nav
        className="sticky top-8 z-50 flex max-w-[367px] min-w-[367px] flex-col justify-between gap-8 rounded-[20px] bg-[var(--gradient-2)] p-6 shadow-2xl max-lg:hidden"
        style={{
          height: "clamp(600px, calc(100vh - 4rem), 958px)",
          minHeight: "768px",
          maxHeight: "958px",
          backgroundImage: "var(--gradient-2)",
        }}
      >
        <div className="header-top flex max-w-[250px] flex-shrink-0 flex-col justify-between">
          <Link href="/" className="mb-8" title="صفحه اصلی">
            <div className="logo flex items-center gap-4">
              <div className="image-logo relative flex-shrink-0 overflow-hidden rounded-2xl">
                <Image
                  src="/logo/shia-meme-logo.jpg"
                  alt="Logo"
                  width={80}
                  height={80}
                  priority
                  className="h-auto max-h-[100px] w-auto max-w-[100px]"
                />
              </div>
              <div className="flex flex-shrink-0 flex-col">
                <span className="text-secondary text-xl font-extrabold">
                  میم شیعه
                </span>
                <span className="text-secondary text-lg font-extrabold">
                  shia meme
                </span>
              </div>
            </div>
          </Link>
          <div className="navlinks min-h-0 flex-1 overflow-y-auto">
            <NavLinks links={navLinks} />
          </div>
        </div>

        <div className="header-bottom flex-shrink-0 space-y-4">
          <div className="darkmode-button bg-link-bg flex items-center justify-between rounded-[20px] p-4 text-xl">
            <ThemeChange />
          </div>
          <div>
            <InstallPWAButton />
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <nav className="MobileNav block lg:hidden">
        <div className="TopNav flex items-center justify-between py-4">
          <Link href={"/"} title="صفحه اصلی">
            <div className="logo-text flex flex-shrink-0 flex-col">
              <span className="text-secondary text-xl font-extrabold">
                میم شیعه
              </span>
              <span className="text-secondary text-lg font-extrabold capitalize">
                shia meme
              </span>
            </div>
          </Link>
          <div className="icons flex gap-2">
            <div className="darkmode">
              <ThemeChange />
            </div>
            <div>
              <InstallPWAButton />
            </div>
          </div>
        </div>
        <div className="BottomNav from-link-fade via-link-fade fixed inset-x-0 bottom-0 z-50 w-full bg-gradient-to-t to-transparent px-2 lg:hidden">
          <NavLinks links={navLinks} />
        </div>
      </nav>
    </>
  );
};

export default Header;
