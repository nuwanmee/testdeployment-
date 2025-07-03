import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  name?: string;
  className?: string;
}

export default function Avatar({ src, name, className = '' }: AvatarProps) {
  return src ? (
    <Image
      src={src}
      alt={name || 'User avatar'}
      width={40}
      height={40}
      className={`rounded-full ${className}`}
    />
  ) : (
    <div
      className={`bg-gray-300 rounded-full flex items-center justify-center ${className}`}
    >
      <span className="text-gray-600 font-medium">
        {name?.charAt(0).toUpperCase() || 'U'}
      </span>
    </div>
  );
}