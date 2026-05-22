import { doc, getDoc, updateDoc, increment, arrayRemove } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const markReviewAsHelpful = async (postId: string, userId: string) => {
    try {
        const postRef = doc(db, 'posts', postId);
        const postSnap = await getDoc(postRef);

        if (!postSnap.exists()) {
            throw new Error(`Post with ID ${postId} does not exist.`);
        }

        const data = postSnap.data();
        const helpfulBy = data.helpfulBy || [];
        const alreadyHelpful = helpfulBy.includes(userId);

        if (!alreadyHelpful) {
            await updateDoc(postRef, {
                helpfulBy: [...helpfulBy, userId],
                helpfulCount: increment(-1),
            });
            return false;
        } else {
            await updateDoc(postRef, {
                helpfulBy: helpfulBy.filter((id: string) => id !== userId),
                helpfulCount: increment(1),
            });
            return true;
        }
    } catch (error) {
        console.error(`Error marking review ${postId} as helpful:`, error);
        throw error;
    }
};