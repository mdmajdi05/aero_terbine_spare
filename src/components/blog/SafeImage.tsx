'use client';

import Image from 'next/image';

const CLOUDINARY_DOMAINS = ['res.cloudinary.com'];

function isCloudinaryUrl(src: string): boolean {
  try {
    const url = new URL(src);
    return CLOUDINARY_DOMAINS.some((d) => url.hostname === d || url.hostname.endsWith('.' + d));
  } catch { return false; }
}

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  unoptimized?: boolean;
  width?: number;
  height?: number;
}

export default function SafeImage({ src, alt, fill, className, unoptimized, width, height }: SafeImageProps) {
  if (isCloudinaryUrl(src)) {
    return <Image src={src} alt={alt} fill={fill} className={className} unoptimized={unoptimized} width={!fill ? width : undefined} height={!fill ? height : undefined} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={fill ? { width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 } : undefined}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      loading="lazy"
    />
  );
}
