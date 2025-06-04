import VideosSection from "../sections/VideosSection";
import UserSection from "../sections/UserSection";

interface Props {
  userId: string;
}

const UserView = ({ userId }: Props) => {
  return (
    <div className="flex flex-col max-w-[1300px] px-4 pt-2.5 mx-auto mb-10 gap-y-6">
      <UserSection userId={userId} />
      <VideosSection userId={userId} />
    </div>
  );
};

export default UserView;
