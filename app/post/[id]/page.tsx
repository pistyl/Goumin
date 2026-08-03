import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import PostDetailClient from '@/components/PostDetailClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  const postId = params.id;

  // 1. Récupérer les détails de la publication
  let postResult;
  try {
    postResult = await db.query(
      `SELECT 
        posts.*, 
        users.username, 
        users.subscription_tier,
        (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id AND comments.status = 'approved') as comment_count,
        (SELECT COUNT(*) FROM reactions WHERE reactions.post_id = posts.id) as reaction_count,
        EXISTS(SELECT 1 FROM reactions WHERE reactions.post_id = posts.id AND reactions.user_id = $1) as user_reacted
       FROM posts 
       LEFT JOIN users ON posts.user_id = users.id 
       WHERE posts.id = $2 AND posts.status = 'approved'`,
      [user.id, postId]
    );
  } catch (err) {
    console.error('Error fetching post detail:', err);
    notFound();
  }

  if (postResult.rows.length === 0) {
    notFound();
  }

  const postRow = postResult.rows[0];
  const post = {
    id: postRow.id,
    circle_id: postRow.circle_id,
    user_id: postRow.user_id,
    content: postRow.content,
    is_anonym: postRow.is_anonym,
    status: postRow.status,
    created_at: postRow.created_at.toISOString(),
    username: postRow.username,
    subscription_tier: postRow.subscription_tier,
    comment_count: parseInt(postRow.comment_count),
    reaction_count: parseInt(postRow.reaction_count),
    user_reacted: postRow.user_reacted
  };

  // 2. Récupérer les commentaires approuvés
  let commentsResult;
  try {
    commentsResult = await db.query(
      `SELECT 
        comments.*, 
        users.username, 
        users.subscription_tier 
       FROM comments 
       LEFT JOIN users ON comments.user_id = users.id 
       WHERE comments.post_id = $1 AND comments.status = 'approved' 
       ORDER BY comments.created_at ASC`,
      [postId]
    );
  } catch (err) {
    console.error('Error fetching comments:', err);
    commentsResult = { rows: [] };
  }

  const comments = commentsResult.rows.map(row => ({
    id: row.id,
    post_id: row.post_id,
    user_id: row.user_id,
    content: row.content,
    is_passed_here: row.is_passed_here,
    status: row.status,
    created_at: row.created_at.toISOString(),
    username: row.username,
    subscription_tier: row.subscription_tier
  }));

  return <PostDetailClient user={user} post={post} comments={comments} />;
}
