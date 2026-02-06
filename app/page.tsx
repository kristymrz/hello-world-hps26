"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Image from "next/image";

const ITEMS_PER_PAGE = 12;

export default function Home() {
  const [images, setImages] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      
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
        .eq('is_public', true) // Filter for public captions
        .eq('images.is_public', true) // Filter for public images within the join
        .range(startIndex, endIndex);

      if (error) {
        console.error("Error fetching images and captions:", error);
        setError(error.message);
        setHasMore(false); // If there's an error, assume no more items
      } else {
        const processedImages = data?.map(captionData => {
          // Safely determine the image object, accounting for it potentially being an array or a direct object
          const image = Array.isArray(captionData.images) ? captionData.images[0] : captionData.images;
          if (!image) {
            return null; // Skip if no valid image data
          }
          return {
            id: image.id,
            url: image.url,
            image_description: image.image_description,
            caption: captionData.content,
          };
        }).filter(Boolean) || [];

        if (page === 0) {
          setImages(processedImages);
        } else {
          setImages((prevImages) => [...prevImages, ...processedImages]);
        }
        
        setHasMore(data?.length === ITEMS_PER_PAGE);
      }
      setLoading(false);
    };

    fetchImages();
  }, [page]);

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  if (loading && images.length === 0) return <p className="text-center mt-8">Loading images...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">Error: {error}</p>;

  return (
    <div className="flex flex-col min-h-screen">
      <h1 className="comic-title">the humor project</h1>
      <h2 className="comic-subtitle">captions list</h2>
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
    </div>
  );
}