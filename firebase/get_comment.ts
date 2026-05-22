import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';

import { db } from '../firebaseConfig';

export interface ReviewComment {
  id: string;
  authorName: string;
  content: string;
  createdAt: any;
}

export const subscribeToComments = (
  reviewId: string,
  callback: (comments: ReviewComment[]) => void
) => {

  const q = query(
    collection(db, 'comments'),
    where('reviewId', '==', reviewId),
    //orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {

    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as ReviewComment[];

    callback(comments);

  });
};