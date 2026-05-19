import {
  collection,
  addDoc,
  serverTimestamp,
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
    createdAt: serverTimestamp(),
  });

};