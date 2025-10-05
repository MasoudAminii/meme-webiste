export default function Footer() {
  return (
    <div className="hidden w-full lg:block">
      {/* right→left two-colour fade */}
      <div className="bg-bg-1 mx-auto flex w-full flex-col items-center justify-between rounded-full px-4 py-4 shadow sm:px-6 md:flex-row">
        <span className="text-center text-sm md:text-left lg:text-base">
          تمامی حقوق برای وبسایت شیعه میم محفوظ است.
        </span>
        <span className="text-light-dark mt-2 text-sm md:mt-0 lg:text-base">
          طراحی و توسعه توسط «
          <a
            href="https://armanegar.com"
            target="_blank"
            className="font-bold hover:underline"
          >
            ارمانگار
          </a>
          »
        </span>
      </div>
    </div>
  );
}
