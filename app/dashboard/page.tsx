import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import ImageGrid from './image-grid';
import { SignOutButton } from '@/components/SignOutButton';

const ITEMS_PER_PAGE = 12;

export default async function DashboardPage() {
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
    .range(0, ITEMS_PER_PAGE - 1);

  if (error) {
    console.error("Error fetching images and captions:", error);
    // Handle error appropriately
  }

  const initialImages = data?.map(captionData => {
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

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex justify-end p-4">
        <SignOutButton />
      </div>
      <div className="flex flex-col items-center" style={{ marginBottom: '8px' }}>
        <h1 className="font-[700] text-black leading-none uppercase" style={{ fontSize: '84px', marginBottom: '0px' }}>the humor project</h1>
        <h2 className="font-[600] text-black" style={{ fontSize: '44px', marginTop: '0px' }}>Welcome, {user.email}</h2>
      </div>
      <ImageGrid initialImages={initialImages} />
    </div>
  );
}
