import prisma from "@/lib/db";
import PostsContainer from "./PostsContainer"; // Add this import

const page = async () => {
  const posts = await prisma.mediaItem.findMany();

  return (
    <div className="min-h-screen">
      <div className="max-w-screen-xl">
        <div className="AboutContainerWrapper max-lg:mb-24">
          <PostsContainer data={posts} />
        </div>
      </div>
    </div>
  );
};

export default page;
