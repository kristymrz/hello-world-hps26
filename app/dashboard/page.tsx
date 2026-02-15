import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import ImageGrid from './image-grid';
import { SignOutButton } from '@/components/SignOutButton';

const ITEMS_PER_PAGE = 12;

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

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
      url: image.url,
      image_description: image.image_description,
      caption: captionData.content,
    };
  }).filter(Boolean) || [];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-2xl">Welcome, {user.email}</h1>
        <SignOutButton />
      </div>
      <h1 className="comic-title">the humor project</h1>
      <h2 className="comic-subtitle">captions list</h2>
      <ImageGrid initialImages={initialImages} />
    </div>
  );
}
