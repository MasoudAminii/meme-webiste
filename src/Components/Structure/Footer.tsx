
export default function Footer() {
  return (
    <div className="hidden w-full lg:block">
      {/* right→left two-colour fade */}
      <div className="mx-auto flex w-full flex-col items-center justify-between rounded-full bg-white px-4 py-4 shadow sm:px-6 md:flex-row">
        <span className="text-center text-sm text-gray-700 md:text-left lg:text-base">
          تمامی حقوق برای وبسایت شیعه میم محفوظ است.
        </span>
        <a className="mt-2 text-sm text-blue-600 hover:underline md:mt-0 lg:text-base">
          طراحی و توسعه توسط «<span className="font-bold">ارمانگار</span>»
        </a>
      </div>
    </div>
  );
}
