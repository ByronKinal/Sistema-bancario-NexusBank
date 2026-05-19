import animationVideo from '../../../assets/animation/Sinfondo.webm';

export const AnimatedLogo = () => {
  return (
    <div className="animated-logo-root">
      <video
        className="animated-logo-video"
        src={animationVideo}
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  );
};

export default AnimatedLogo;

