import React from 'react';
import { Download } from 'lucide-react';
import Image from 'next/image';
import { download } from '@/lib/utils';

interface ImageCardProps {
  imageUrl: string;
  index: number;
  className?: string;
}

export const ImageCard: React.FC<ImageCardProps> = ({ imageUrl, index, className = '' }) => {

  return (
    <div className={`group relative h-full w-full overflow-hidden rounded-lg ${className}`}>
      <img 
        src={imageUrl} 
        alt={`Generated image ${index + 1}`} 
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Download Button */}
      {/* <a 
        href={imageUrl} 
        download={`generated-image-${index}.png`}
        className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-900 shadow-md backdrop-blur-md transition hover:bg-white"
      >
        <Download className="h-4 w-4" />
        Download
      </a> */}
      
                          <button 
                          className='absolute bottom-4 right-4 flex items-center gap-2 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-900 shadow-md backdrop-blur-md transition hover:bg-white' 
                          onClick={(e) => download(imageUrl, `generated-image-${index}.png`)}

                          >
                          {/* <Image
                            src="/assets/icons/download.svg"
                            alt="Download"
                            width={24}
                            height={24}
                            className="pb-[6px]"
      
                          /> */}
                          <Download className="h-4 w-4" />
                          Download
                          </button>
    </div>
  );
};
