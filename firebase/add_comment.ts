import {
  collection,
  addDoc,
  serverTimestamp,
  increment, updateDoc,
  doc,
} from 'firebase/firestore';

import { db } from '../firebaseConfig';

export const addComment = async (
  reviewId: string,
  authorId: string,
  authorName: string,
  content: string
) => {

  await addDoc(collection(db, 'comments'), {
    reviewId,
    authorId,
    authorName,
    content,
    createdAt: new Date(),
  });
  await updateDoc(doc(db, 'posts', reviewId), {
    commentsCount: increment(1),
  });

};