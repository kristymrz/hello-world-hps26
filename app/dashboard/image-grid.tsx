"use client";

import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

const ITEMS_PER_PAGE = 12;

export default function ImageGrid({ initialImages }: { initialImages: any[] }) {
  const [images, setImages] = useState(initialImages);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialImages.length === ITEMS_PER_PAGE);
  const supabase = createClient();

  const handleLoadMore = async () => {
    setLoading(true);
    const startIndex = page * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE - 1;

    const { data, error } = await supabase
      .from('captions')
      .select(`
        id,
        content,
        images!inner (
          id,
          url,
          image_description,
          created_datetime_utc
        )
      `)
      .eq('is_public', true)
      .eq('images.is_public', true)
      .range(startIndex, endIndex);

    if (error) {
      console.error("Error fetching images and captions:", error);
      setHasMore(false);
    } else {
      const processedImages = data?.map(captionData => {
        const image = Array.isArray(captionData.images) ? captionData.images[0] : captionData.images;
        if (!image) {
          return null;
        }
        return {
          id: image.id,
          url: image.url,
          image_description: image.image_description,
          caption: captionData.content,
        };
      }).filter(Boolean) || [];

      setImages((prevImages) => [...prevImages, ...processedImages]);
      setHasMore(data?.length === ITEMS_PER_PAGE);
      setPage(prevPage => prevPage + 1);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="black-box grow grid grid-cols-3 gap-4 p-4">
        {images.map((image) => (
          <div key={image.id} className="card">
            <Image
              src={image.url}
              alt={image.image_description || "Image"}
              width={300}
              height={200}
              layout="responsive"
              objectFit="contain"
            />
            <p className="mt-2 text-sm">{image.caption}</p>
          </div>
        ))}
      </div>
      {hasMore && !loading && (
        <div className="flex justify-center mt-4 mb-8">
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            View More
          </button>
        </div>
      )}
      {!hasMore && images.length > 0 && !loading && (
        <p className="text-center mt-4 mb-8 text-gray-500">No more images to load.</p>
      )}
      {loading && <p className="text-center mt-8">Loading more images...</p>}
    </div>
  );
}
