import { getAllUsers } from "@/actions/usersActions";
import UsersContainer from "./UsersContainer";

const page = async () => {
  // Fetch users data from the server
  const result = await getAllUsers();
  const users = result.success ? result.data : [];

  return (
    <div className="min-h-screen">
      <div className="max-w-screen-xl">
        {/* Header */}
        <div className="bg-bg-1 mb-6 flex items-center justify-between rounded-2xl p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold">مدیریت کاربران</h1>
            <p className="text-light-dark mt-1">
              نمایش و مدیریت کاربران سیستم — مدیریت نقش‌ها و دسترسی‌ها
            </p>
          </div>
        </div>
        <div className="UsersContainerWrapper">
          <UsersContainer data={users} />
        </div>
      </div>
    </div>
  );
};

export default page;
