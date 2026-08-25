import Link from 'next/link';
import Image from 'next/image';

interface AuthorCardProps {
  author: {
    name: string;
    slug: string;
    avatar?: string | null;
    bio?: string | null;
    role?: string | null;
    company?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
  };
  showLink?: boolean;
}

export default function AuthorCard({ author, showLink = true }: AuthorCardProps) {
  const initials = author.name.split(' ').map(w => w[0]).join('').slice(0, 2);
  const roleText = [author.role, author.company].filter(Boolean).join(' at ');

  const content = (
    <div className="flex items-start gap-3">
      {author.avatar ? (
        <Image
          src={author.avatar}
          alt={author.name}
          width={48}
          height={48}
          className="rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center text-brand font-bold font-sora text-sm shrink-0">
          {initials}
        </div>
      )}
      <div className="min-w-0">
        <span className="font-sora font-bold text-sm text-navy dark:text-white">{author.name}</span>
        {roleText && (
          <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta">{roleText}</p>
        )}
        {author.bio && (
          <p className="text-xs text-gray-400 dark:text-gray-500 font-jakarta mt-1 line-clamp-2">{author.bio}</p>
        )}
        {(author.twitter || author.linkedin) && (
          <div className="flex items-center gap-2 mt-1.5">
            {author.twitter && (
              <a href={author.twitter} target="_blank" rel="noopener noreferrer" className="text-xs text-brand hover:underline font-jakarta" onClick={e => e.stopPropagation()}>
                Twitter
              </a>
            )}
            {author.linkedin && (
              <a href={author.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-brand hover:underline font-jakarta" onClick={e => e.stopPropagation()}>
                LinkedIn
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (showLink) {
    return (
      <Link href={`/authors/${author.slug}`} className="block hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
