import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { addReviewPost } from '../../firebase/add_post_review';
import { CommonStyles, Colors } from '../../constants/Theme';

export default function AjouterPostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const router = useRouter();
  const [rating, setRating] = useState('');
  const [image, setImage] = useState('');
  const numericRating = Number(rating);

  if (numericRating < 0 || numericRating > 5) {
    Alert.alert('Erreur', 'La note doit être entre 0 et 5.');
    return;
  }

  useEffect(() => {
    console.log("Checking auth state for AjouterPost...");
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (!currentUser && !loading) {
        console.warn("User not logged in, redirecting to connexion");
        router.replace('/connexion');
      }
    });
    return () => unsubscribe();
  }, [loading]);

  const handleSubmit = async () => {
    console.log("Publish button clicked");
    if (!title.trim() || !content.trim() || !rating.trim() || !image.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    if (!user) {
      console.error("No user found during submission");
      return;
    }

    setSending(true);
    try {
      console.log("Attempting to add post to Firestore...");
      const postId = await addReviewPost(title, content, rating, image, user.uid, user.displayName || 'Anonyme');
      console.log("Post successfully created with ID:", postId);
      
      Alert.alert('Succès', 'Votre critique a été publiée !');
      
      // Reset form
      setTitle('');
      setContent('');
      
      // Redirect to home
      console.log("Redirecting to home page...");
      router.replace('/');
    } catch (error: any) {
      console.error("Error during post publication:", error);
      Alert.alert('Erreur', 'Impossible de publier la critique : ' + error.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={CommonStyles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) return null;

  return (
    <ScrollView contentContainerStyle={CommonStyles.container}>
      <Text style={CommonStyles.title}>Nouvelle critique</Text>
      
      <View style={CommonStyles.card}>
        <Text style={CommonStyles.label}>Titre de l'oeuvre</Text>
        <TextInput
          style={CommonStyles.input}
          placeholder="Ex: Titanic"
          value={title}
          onChangeText={setTitle}
          editable={!sending}
        />

        <Text style={CommonStyles.label}>Votre avis</Text>
        <TextInput
          style={[CommonStyles.input, styles.textArea]}
          placeholder="Donnez votre avis sur cette œuvre..."
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          editable={!sending}
        />

        <Text style={CommonStyles.label}>Affiche de l'oeuvre</Text>
        <TextInput
          style={CommonStyles.input}
          placeholder="URL de l'image"
          value={image}
          onChangeText={setImage}
        />

        <Text style={CommonStyles.label}>Note sur 5</Text>
        <TextInput
          style={CommonStyles.input}
          placeholder="Ex: 4"
          value={rating}
          onChangeText={setRating}
          keyboardType="numeric"
        />
        <Pressable 
          style={[CommonStyles.button, CommonStyles.buttonSuccess, sending && CommonStyles.disabled]} 
          onPress={handleSubmit}
          disabled={sending}
        >
          <Text style={CommonStyles.buttonText}>{sending ? 'Publication...' : 'Publier la critique'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  textArea: { minHeight: 150 },
});
