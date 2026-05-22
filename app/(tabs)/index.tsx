import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useEffect, useState } from 'react';
import { CommonStyles, Colors } from '../../constants/Theme';
import { subscribeToPosts, Post } from '../../firebase/get_post_data';
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const unsubscribePosts = subscribeToPosts((data) => {
      setPosts(data);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribePosts();
    };
  }, []);

  const renderPost = ({ item }: { item: Post }) => (
    <View style={CommonStyles.card}>

      <Image
        source={{ uri: item.image }}
        style={styles.postImage}
      />

      <Text style={styles.postTitle}>{item.title}</Text>
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= item.rating ? "star" : "star-outline"}
            size={18}
            color="#FFD700"
          />
        ))}
      </View>
      <Text style={styles.postAuthor}>Par {item.authorName}</Text>
      <Text style={styles.postContent} numberOfLines={3}>{item.content}</Text>

      <Pressable 
        style={styles.readMore} 
        onPress={() => router.push({ pathname: '/blog/[slug]', params: { slug: item.id } })}
      >
        <Text style={styles.readMoreText}>Lire la suite →</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={CommonStyles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={CommonStyles.title}>Critiques récentes</Text>
            {!user && (
              <View style={styles.loginPrompt}>
                <Text style={styles.loginPromptText}>Connectez-vous pour publier vos propres critiques !</Text>
                <Pressable style={[CommonStyles.button, CommonStyles.buttonPrimary]} onPress={() => router.push('/connexion')}>
                  <Text style={CommonStyles.buttonText}>Se connecter</Text>
                </Pressable>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 50 }} />
          ) : (
            <Text style={styles.emptyText}>Aucune critique pour le moment</Text>
          )
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 20 },
  loginPrompt: { backgroundColor: Colors.gray, padding: 15, borderRadius: 12, marginBottom: 20 },
  loginPromptText: { marginBottom: 10, color: Colors.text, textAlign: 'center' },
  postImage: { width: '100%', height: 200, marginBottom: 10, borderRadius: 8, backgroundColor: Colors.gray, resizeMode: 'cover' },
  rating: { fontSize: 14, fontWeight: 'bold', color: Colors.primary, marginBottom: 6 },
  ratingContainer: { flexDirection: 'row', marginBottom: 6, gap: 1, alignItems: 'center' },
  postTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
  postAuthor: { fontSize: 12, color: Colors.textSecondary, marginBottom: 12, textTransform: 'uppercase' },
  postContent: { fontSize: 15, color: '#444', lineHeight: 22, marginBottom: 15 },
  readMore: { alignSelf: 'flex-end' },
  readMoreText: { color: Colors.primary, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, color: Colors.textSecondary, fontSize: 16 },
});
