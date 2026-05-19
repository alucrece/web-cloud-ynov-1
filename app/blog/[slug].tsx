import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getPostById } from '../../firebase/get_single_post';
import { Post } from '../../firebase/get_post_data';
import { CommonStyles, Colors } from '../../constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { markReviewAsHelpful } from '../../firebase/update_helpful';
import { auth } from '../../firebaseConfig';

export default function ReviewDetailPage() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (slug) {
      getPostById(slug as string)
        .then(setPost)
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
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
        <Text style={styles.rating}>⭐ {post.rating}/5</Text>
        <Text style={styles.author}>Par {post.authorName}</Text>
        <View style={styles.divider} />
        <Text style={styles.content}>{post.content}</Text>
        <Pressable style={styles.helpfulButton} onPress={handleHelpful}>
          <Text style={styles.helpfulText}>
            👍 Avis pertinent ({post.helpfulCount || 0})
          </Text>
        </Pressable>
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
});
