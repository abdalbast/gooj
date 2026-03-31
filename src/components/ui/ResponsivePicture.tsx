import { forwardRef, type ImgHTMLAttributes } from "react";

interface ResponsivePictureProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  avifSrc?: string;
  pictureClassName?: string;
  src: string;
}

const ResponsivePicture = forwardRef<HTMLImageElement, ResponsivePictureProps>(
  ({ avifSrc, pictureClassName, src, ...imgProps }, ref) => {
    const shouldUseAvif =
      typeof navigator === "undefined" || !navigator.userAgent.toLowerCase().includes("firefox");

    return (
      <picture className={pictureClassName}>
        {avifSrc && shouldUseAvif ? <source srcSet={avifSrc} type="image/avif" /> : null}
        <img ref={ref} src={src} {...imgProps} />
      </picture>
    );
  },
);

ResponsivePicture.displayName = "ResponsivePicture";

export default ResponsivePicture;
