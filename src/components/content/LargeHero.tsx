import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.png";
import heroVideoOne from "@/assets/hero-video-1.mp4";
import heroVideoTwo from "@/assets/hero-video-2.mp4";

const heroVideos = [heroVideoOne, heroVideoTwo];
const DISSOLVE_DURATION_MS = 500;
const CTA_ROTATE_MS = 6000;

const heroCtas = [
  {
    eyebrow: "Gift Boxes",
    title: "Explore personalised gift boxes",
    description:
      "Browse the core collection and jump straight into the boxes designed for every occasion.",
    to: "/#gift-boxes",
  },
  {
    eyebrow: "Date Reminders",
    title: "Set up date reminders",
    description:
      "Save birthdays, anniversaries, and key dates so you never miss the moment again.",
    to: "/reminders#add-date",
  },
  {
    eyebrow: "Personalisation",
    title: "Add a photo or handwritten note",
    description:
      "Jump into the personalisation flow and make the gift feel thoughtful before it even arrives.",
    to: "/product/2#personalisation",
  },
];

const LargeHero = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeCtaIndex, setActiveCtaIndex] = useState(0);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const transitionTimeoutRef = useRef<number | null>(null);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    const activeVideo = videoRefs.current[activeIndex];
    const nextIndex = (activeIndex + 1) % heroVideos.length;
    const nextVideo = videoRefs.current[nextIndex];
    const playActiveVideo = activeVideo?.play();

    playActiveVideo?.catch(() => {
      // Autoplay can be blocked in some environments even when muted.
    });

    const handleEnded = () => {
      if (isTransitioningRef.current) {
        return;
      }

      isTransitioningRef.current = true;
      setIsTransitioning(true);

      if (nextVideo) {
        nextVideo.currentTime = 0;
      }

      const playNextVideo = nextVideo?.play();

      playNextVideo?.catch(() => {
        // Keep the current frame visible if the next video cannot autoplay.
      });

      transitionTimeoutRef.current = window.setTimeout(() => {
        activeVideo?.pause();

        if (activeVideo) {
          activeVideo.currentTime = 0;
        }

        setActiveIndex(nextIndex);
        setIsTransitioning(false);
        isTransitioningRef.current = false;
      }, DISSOLVE_DURATION_MS);
    };

    activeVideo?.addEventListener("ended", handleEnded);

    return () => {
      activeVideo?.removeEventListener("ended", handleEnded);

      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
    };
  }, [activeIndex]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveCtaIndex((currentIndex) => (currentIndex + 1) % heroCtas.length);
    }, CTA_ROTATE_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const nextIndex = (activeIndex + 1) % heroVideos.length;

  return (
    <section className="w-full mb-16 px-6">
      <style>
        {`
          @keyframes cta-progress {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
          }
        `}
      </style>
      <div className="relative mb-3 overflow-hidden bg-[#f6f1eb] aspect-[4/5] sm:aspect-[3/2] lg:aspect-[16/9]">
        {heroVideos.map((videoSrc, index) => {
          const isActive = index === activeIndex;
          const isIncoming = isTransitioning && index === nextIndex;

          return (
            <video
              key={videoSrc}
              ref={(element) => {
                videoRefs.current[index] = element;
              }}
              muted
              playsInline
              preload="auto"
              poster={heroImage}
              aria-hidden={!isActive && !isIncoming}
              aria-label="GOOJ curated gift boxes"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-linear ${
                isActive || isIncoming ? "opacity-100" : "opacity-0"
              } ${isTransitioning && isActive ? "opacity-0" : ""}`}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          );
        })}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/18 to-black/5" />
        <div className="absolute inset-x-0 bottom-0 z-10 grid px-6 pb-6 text-white sm:left-auto sm:right-8 sm:inset-x-auto sm:w-[19rem] sm:px-0 sm:pb-8 lg:right-10 lg:w-[18.5rem] lg:pb-10 xl:right-12 xl:w-[19.5rem] xl:pb-12">
          {heroCtas.map((cta, index) => {
            const isActive = index === activeCtaIndex;

            return (
              <Link
                key={cta.title}
                to={cta.to}
                aria-hidden={!isActive}
                tabIndex={isActive ? 0 : -1}
                className={`col-start-1 row-start-1 block transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
                  isActive
                    ? "pointer-events-auto translate-x-0 opacity-100 blur-0"
                    : "pointer-events-none translate-x-5 opacity-0 blur-[2px]"
                }`}
              >
                <div className="flex flex-col gap-3">
                  <div className="min-h-[3.6rem] sm:min-h-[4.6rem]">
                    <h2 className="max-w-[16ch] text-xl font-light leading-snug tracking-[-0.03em] sm:text-[1.55rem]">
                      {cta.title}
                    </h2>
                  </div>

                  <div className="flex gap-2">
                    {heroCtas.map((_, indicatorIndex) => (
                      <span
                        key={`cta-${cta.title}-${indicatorIndex}`}
                        className="h-px flex-1 overflow-hidden bg-white/25"
                      >
                        <span
                          className="block h-full origin-left bg-white"
                          style={{
                            transform:
                              indicatorIndex === activeCtaIndex
                                ? undefined
                                : "scaleX(0)",
                            animation:
                              indicatorIndex === activeCtaIndex
                                ? `cta-progress ${CTA_ROTATE_MS}ms linear forwards`
                                : "none",
                          }}
                        />
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="absolute inset-0 flex items-end">
          <div className="w-full p-6 md:p-8 lg:p-10 xl:p-12">
            <div className="hidden max-w-xl space-y-4 text-white sm:block">
              <h1 className="text-[clamp(2.75rem,7vw,6.5rem)] font-light leading-[0.88] tracking-[-0.05em]">
                GooJ It!
              </h1>
              <p className="max-w-lg text-sm font-light leading-6 text-white/88 md:text-lg md:leading-8">
                Curated gift boxes that get you out of jail.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LargeHero;
