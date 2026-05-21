import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getPostById } from '../../firebase/get_single_post';
import { Post } from '../../firebase/get_post_data';
import { CommonStyles, Colors } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { markReviewAsHelpful } from '../../firebase/update_helpful';
import { auth } from '../../firebaseConfig';
import { addComment } from '../../firebase/add_comment';
import { subscribeToComments, ReviewComment } from '../../firebase/get_comment';

export default function ReviewDetailPage() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [commentText, setCommentText] = useState('');

  const handleHelpful = async () => {
    if (!post || !auth.currentUser) return;
    try {

      const wasAdded = await markReviewAsHelpful(
        post.id,
        auth.currentUser.uid
      );

      setPost({
        ...post,
        helpfulCount: wasAdded
          ? (post.helpfulCount || 0) + 1
          : (post.helpfulCount || 0) - 1,

        helpfulBy: wasAdded
          ? [...(post.helpfulBy || []), auth.currentUser.uid]
          : (post.helpfulBy || []).filter(
              id => id !== auth.currentUser?.uid
            ),
      });
    } catch (error) {
      console.error("Error marking review as helpful:", error);
    }
  };

  const handleAddComment = async () => {
    //if (!commentText.trim() || !auth.currentUser || !post) return;
    console.log("Bouton envoyer cliqué");
    console.log("Valeur actuelle :", commentText);

  if (!commentText.trim()) {
      console.log("Commentaire vide");
      return;
    }

    if (!auth.currentUser) {
      console.log("Utilisateur non connecté");
      return;
    }

    if (!post) {
      console.log("Post introuvable");
      return;
    }
    try {
      await addComment(
        post.id,
        auth.currentUser.uid,
        auth.currentUser.displayName || 'Anonyme',
        commentText
      );

      setPost({
        ...post,
        commentsCount: (post.commentsCount || 0) + 1,
      });
      setCommentText('');

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (slug) {
      getPostById(slug as string)
        .then(setPost)
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));

       const unsubscribeComments = subscribeToComments(
        slug as string,
        setComments
      );

      return () => unsubscribeComments();
    }
  }, [slug]);

  if (loading) {
    return (
      <View style={CommonStyles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={CommonStyles.center}>
        <Text style={styles.errorText}>Critique introuvable.</Text>
        <Pressable style={[CommonStyles.button, CommonStyles.buttonPrimary]} onPress={() => router.back()}>
          <Text style={CommonStyles.buttonText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={CommonStyles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        <Text style={styles.backText}>Retour</Text>
      </Pressable>

      <View style={CommonStyles.card}>
        <Image
          source={{ uri: post.image }}
          style={styles.coverImage}
        />
        <Text style={styles.date}>
          {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Date inconnue'}
        </Text>
        <Text style={CommonStyles.title}>{post.title}</Text>
        <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= post.rating ? "star" : "star-outline"}
                size={18}
                color="#FFD700"
              />
            ))}
          </View>
        <Text style={styles.author}>Par {post.authorName}</Text>
        <View style={styles.divider} />
        <Text style={styles.content}>{post.content}</Text>
        <Pressable style={styles.helpfulButton} onPress={handleHelpful}>
          <Text style={styles.helpfulText}>
            👍 Avis pertinent ({post.helpfulCount || 0})
          </Text>
        </Pressable>
        <Text style={styles.commentsTitle}> 💬 {post.commentsCount || 0} Commentaires </Text>

        <TextInput
          style={styles.commentInput}
          placeholder="Ajouter un commentaire..."
          value={commentText}
          onChangeText={(text) => {
            console.log(text);
            setCommentText(text);
          }}
        />
        <Pressable style={styles.commentButton} onPress={handleAddComment}>
          <Text style={styles.commentButtonText}> Envoyer </Text>
        </Pressable>
        {comments.map(comment => (
          <View key={comment.id} style={styles.commentCard}>

            <Text style={styles.commentAuthor}>
              {comment.authorName}
            </Text>

            <Text style={styles.commentContent}>
              {comment.content}
            </Text>

          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { color: Colors.primary, marginLeft: 8, fontSize: 16, fontWeight: '600' },
  date: { color: Colors.textSecondary, fontSize: 12, marginBottom: 8, textTransform: 'uppercase' },
  author: { color: Colors.primary, fontWeight: 'bold', marginBottom: 15 },
  divider: { height: 1, backgroundColor: Colors.gray, marginBottom: 20 },
  content: { fontSize: 16, color: Colors.text, lineHeight: 26 },
  errorText: { fontSize: 18, marginBottom: 20, color: Colors.danger },
  coverImage: { width: '100%', height: 200, marginBottom: 20, borderRadius: 8 },
  rating: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  helpfulButton: { marginTop: 30, backgroundColor: Colors.primary, padding: 12, borderRadius: 8, alignItems: 'center' },
  helpfulText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  commentsTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 40, marginBottom: 20 },
  commentInput: { borderWidth: 1, borderColor: Colors.gray, borderRadius: 8, padding: 10, marginBottom: 10 },
  commentButton: { backgroundColor: Colors.primary, padding: 12, borderRadius: 8, alignItems: 'center' },
  commentButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  commentCard: { backgroundColor: Colors.gray, padding: 15, borderRadius: 8, marginBottom: 15, marginTop: 15 },
  commentAuthor: { fontWeight: 'bold', marginBottom: 5 },
  commentContent: { color: Colors.text },
  ratingContainer: { flexDirection: 'row', marginBottom: 6, gap: 1, alignItems: 'center' },
});
