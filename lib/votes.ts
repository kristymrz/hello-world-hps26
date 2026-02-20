import { createClient } from '@/lib/supabase/client';

/**
 * Queries caption_votes for a specific caption and profile.
 * Returns the single matching row if it exists, or null if it does not.
 * Logs and returns null on error.
 */
export async function getUserVoteForCaption(captionId: string, profileId: string) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('caption_votes')
      .select('*')
      .eq('caption_id', captionId)
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user vote for caption:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception fetching user vote for caption:', error);
    return null;
  }
}

/**
 * Inserts a new row into caption_votes.
 * Uses .select().single() to return the newly inserted row.
 * Logs and throws on error.
 */
export async function insertVote(captionId: string, profileId: string, voteValue: 1 | -1) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('caption_votes')
      .insert({
        caption_id: captionId,
        profile_id: profileId,
        vote_value: voteValue,
        created_datetime_utc: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting vote:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Exception inserting vote:', error);
    throw error;
  }
}

/**
 * Deletes the row from caption_votes where id equals voteId.
 * Logs and throws on error.
 */
export async function deleteVote(voteId: number) {
  const supabase = createClient();
  try {
    const { error } = await supabase
      .from('caption_votes')
      .delete()
      .eq('id', voteId);

    if (error) {
      console.error('Error deleting vote:', error);
      throw error;
    }
  } catch (error) {
    console.error('Exception deleting vote:', error);
    throw error;
  }
}
