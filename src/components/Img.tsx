import Image, { type ImageProps } from "next/image";

type Props = Omit<ImageProps, "alt"> & {
  alt: string;
  className?: string;
};

export function Img({ className, alt, priority, sizes, ...props }: Props) {
  return (
    <Image
      alt={alt}
      className={className}
      sizes={
        sizes ||
        "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      }
      priority={priority}
      loading={priority ? undefined : "lazy"}
      quality={priority ? 82 : 75}
      {...props}
    />
  );
}
