import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Adds a new blog post to Firestore.
 * @param title The title of the post.
 * @param content The content of the post.
 * @param authorId The UID of the author.
 * @param authorName The name of the author.
 * @returns A promise that resolves to the created document ID.
 */
export const addReviewPost = async (title: string, content: string, rating: string, image: string, authorId: string, authorName: string) => {
  try {
    const docRef = await addDoc(collection(db, "posts"), {
      title,
      content,
      rating,
      image,
      authorId,
      authorName,
      createdAt: serverTimestamp(),
      helpfulCount: 0,
      helpfulBy: [],
      commentsCount: 0,
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};
