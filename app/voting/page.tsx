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

  const [{ data, error }, { count }] = await Promise.all([
    supabase
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
      .order('created_datetime_utc', { ascending: false })
      .range(0, ITEMS_PER_PAGE - 1),
    supabase
      .from('captions')
      .select('*, images!inner(*)', { count: 'exact', head: true })
      .eq('is_public', true)
      .eq('images.is_public', true)
      .not('content', 'is', null)
      .neq('content', ''),
  ]);

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
      <div className="mt-8 px-4 text-center">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', flexShrink: 0 }}>
            <polygon points="12,2 14.9,8.8 22,9.3 16.8,14 18.5,21 12,17.3 5.5,21 7.2,14 2,9.3 9.1,8.8" fill="#FAFF4A" />
          </svg>
          <p className="text-white" style={{ fontSize: '1.5rem', margin: 0 }}>Upvote the funniest photo + caption combos, downvote the ones that miss the mark!</p>
          <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', flexShrink: 0 }}>
            <polygon points="12,2 14.9,8.8 22,9.3 16.8,14 18.5,21 12,17.3 5.5,21 7.2,14 2,9.3 9.1,8.8" fill="#FAFF4A" />
          </svg>
        </div>
      </div>
      <div>
        <ImageGrid initialImages={initialImages} totalCount={count ?? 0} />
      </div>
    </div>
  );
}