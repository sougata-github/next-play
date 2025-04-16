import FormSection from "../sections/FormSection";

interface Props {
  videoId: string;
}

const VideoView = ({ videoId }: Props) => {
  return (
    <div className="px-4 pt-2.5 max-w-screen-lg lg:pb-32 pb-20">
      <FormSection videoId={videoId} />
    </div>
  );
};

export default VideoView;
