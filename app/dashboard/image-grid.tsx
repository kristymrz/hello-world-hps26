"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { getUserVoteForCaption, insertVote, deleteVote } from '@/lib/votes';

const ITEMS_PER_PAGE = 12;

function CaptionCard({ image }: { image: any }) {
  const [currentVote, setCurrentVote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isPressed, setIsPressed] = useState<1 | -1 | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function getProfileAndVote() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfileId(user.id);
        const vote = await getUserVoteForCaption(image.captionId, user.id);
        setCurrentVote(vote);
      }
    }
    getProfileAndVote();
  }, [supabase, image.captionId]);

  const handleVote = async (voteValue: 1 | -1) => {
    if (!profileId) return;

    setIsLoading(true);
    try {
      if (!currentVote) {
        const newVote = await insertVote(image.captionId, profileId, voteValue);
        setCurrentVote(newVote);
      } else if (currentVote.vote_value === voteValue) {
        await deleteVote(currentVote.id);
        setCurrentVote(null);
      } else {
        await deleteVote(currentVote.id);
        const newVote = await insertVote(image.captionId, profileId, voteValue);
        setCurrentVote(newVote);
      }
    } catch (error) {
      console.error('Error handling vote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div key={image.id} className="card flex flex-col">
      <div className="flex-grow">
        <Image
          src={image.url}
          alt={image.image_description || "Image"}
          width={300}
          height={200}
          className="w-full h-48 object-contain"
        />
        <p className="mt-2 text-[25px] text-center">{image.caption}</p>
      </div>
      <div 
        style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '16px', width: '100%' }}
      >
        <button
          onClick={() => handleVote(1)}
          onMouseDown={() => { if (!isLoading && profileId) setIsPressed(1); }}
          onMouseUp={() => setIsPressed(null)}
          onMouseLeave={() => setIsPressed(null)}
          disabled={isLoading || !profileId}
          style={{ 
            fontSize: '40px', 
            width: '40px', 
            height: '40px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: (!profileId || isLoading) ? 'not-allowed' : 'pointer', 
            opacity: (!profileId || isLoading) ? 0.4 : 1,
            color: currentVote?.vote_value === 1 ? 'green' : 'gray', 
            background: 'none', 
            border: '1px solid lightgrey', 
            borderRadius: '6px',
            padding: '4px',
            transform: isPressed === 1 ? 'scale(0.85)' : 'scale(1)',
            transition: 'transform 0.1s ease',
            backgroundColor: isPressed === 1 ? '#e9d5ff' : 'transparent'
          }}
          title="Upvote"
        >
          ▲
        </button>
        <button
          onClick={() => handleVote(-1)}
          onMouseDown={() => { if (!isLoading && profileId) setIsPressed(-1); }}
          onMouseUp={() => setIsPressed(null)}
          onMouseLeave={() => setIsPressed(null)}
          disabled={isLoading || !profileId}
          style={{ 
            fontSize: '40px', 
            width: '40px', 
            height: '40px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: (!profileId || isLoading) ? 'not-allowed' : 'pointer', 
            opacity: (!profileId || isLoading) ? 0.4 : 1,
            color: currentVote?.vote_value === -1 ? 'red' : 'gray', 
            background: 'none', 
            border: '1px solid lightgrey', 
            borderRadius: '6px',
            padding: '4px',
            transform: isPressed === -1 ? 'scale(0.85)' : 'scale(1)',
            transition: 'transform 0.1s ease',
            backgroundColor: isPressed === -1 ? '#e9d5ff' : 'transparent'
          }}
          title="Downvote"
        >
          ▼
        </button>
      </div>
    </div>
  );
}

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
          captionId: captionData.id,
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
      <div className="black-box grid grid-cols-3 gap-y-6 gap-x-4 px-4 pb-4 pt-0">
        {images.map((image) => (
          <CaptionCard key={image.id} image={image} />
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
