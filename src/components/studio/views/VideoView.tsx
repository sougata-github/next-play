import FormSection from "../sections/FormSection";

interface Props {
  videoId: string;
}

const VideoView = ({ videoId }: Props) => {
  return (
    <div className="px-4 pt-2.5 max-w-screen-lg lg:h-screen lg:pb-0 pb-20">
      <FormSection videoId={videoId} />
    </div>
  );
};

export default VideoView;
