import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

export interface Post {
  id: string;
  title: string;
  content: string;
  rating: number;
  image: string;
  authorId: string;
  authorName: string;
  createdAt: any;
}

/**
 * Subscribes to the posts collection and executes a callback with the data.
 * @param callback Function to call with the list of posts.
 * @returns Unsubscribe function.
 */
export const subscribeToPosts = (callback: (posts: Post[]) => void) => {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  
  return onSnapshot(q, (querySnapshot) => {
    const posts: Post[] = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post);
    });
    callback(posts);
  }, (error) => {
    console.error("Error subscribing to posts:", error);
  });
};
