import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import ImageGrid from './image-grid';
import { Navbar } from '@/components/Navbar';

const ITEMS_PER_PAGE = 12;

export default async function VotingPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

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
    .not('content', 'is', null)
    .neq('content', '')
    .order('created_datetime_utc', { foreignTable: 'images', ascending: false })
    .order('id', { ascending: false })
    .range(0, ITEMS_PER_PAGE - 1);

  if (error) {
    console.error("Error fetching images and captions:", error);
  }

  const transformed = data?.map(captionData => {
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
  }) || [];

  const initialImages = transformed.filter(item =>
    item &&
    item.id &&
    item.captionId &&
    item.url &&
    item.caption
  ) as any[];

  return (
    <div className="flex flex-col min-h-screen bg-[#571F43] text-white">
      <Navbar userEmail={user.email} />
      <div className="mt-8">
        <ImageGrid initialImages={initialImages} />
      </div>
    </div>
  );
}