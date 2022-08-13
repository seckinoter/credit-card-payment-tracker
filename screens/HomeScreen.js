import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button, ScrollView, RefreshControl } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { collection, doc, getDocs, where } from "firebase/firestore";
import {db} from '../config/firebase'
import { query, orderBy, onSnapshot, setDoc } from "firebase/firestore"
import { Text, Card } from '@ui-kitten/components';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useIsFocused } from '@react-navigation/native';
import firebase from "firebase/compat/app";
import { FontAwesome } from '@expo/vector-icons';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AntDesign } from '@expo/vector-icons';

export const HomeScreen = ({navigation}) => {

  const [cards, setCards] = useState([]);
  const [shouldUpdate, setShouldUpdate] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activity, setActivity] = useState(true);

  const isFocused = useIsFocused();

  let today = new Date();
  let plusFive = new Date();
  plusFive = new Date(plusFive.setDate(plusFive.getDate() + 5));


  const user = getAuth().currentUser;
  useEffect(() => {
    const q = query(collection(db, "cards", user.uid, "userCards"), where("SonOdeme", "<=", plusFive), orderBy("SonOdeme", "asc"));
    onSnapshot(q, (querySnapshot) => {
      setCards(
        querySnapshot.docs.map((doc) => ({
          id: doc.id,
          bank: doc.data().Banka,
          cardNo: doc.data().KartNo,
          sonOdeme: doc.data().SonOdeme.seconds,
          cardholder: doc.data().KartSahibi,
        }))
      );
    });
    registerForPushNotificationsAsync();
  }, []);

 const registerForPushNotificationsAsync = async () => {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Bildirim servisi için token alınamadı!');
        return;
      }
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      if (token) {
        await setDoc(doc(db, "users", getAuth().currentUser.email), {
          userMail: getAuth().currentUser.email,
          token: token,
        }, { merge : true});
      }
    } else {
      alert('Bildirim servisi için fiziksel bir cihaz kullanmalısınız!');
    }
  }

  useEffect(() => {
    setShouldUpdate(true);
  }, [isFocused]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false),1500);
  }, []);

  const Header = (props, cardholder, bank, cardNo, sonOdeme) => (
    <View {...props}>
    {new Date(sonOdeme * 1000) < today ?
      <FontAwesome name="warning" size={26} color="red" style={{flex:1, textAlign:'center', paddingBottom:20}} /> : null
    }
      <Text category="h6">{cardNo}</Text>
      <Text category="s1">
        {bank} {cardholder}
      </Text>
    </View>
  );



  return (
    <ScrollView contentContainerStyle={{ flex: 0 }}
    refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            title="Yenileniyor..."
            tintColor="#f47920"
          />
        }
        showsVerticalScrollIndicator="false"
    >
    <View style={styles.container}>
    <Text
        category="h6"
        style={styles.headerText}
      >Ödemesi Geçmiş ya da Yakın Kartlar</Text>
    {cards.length > 0 ?
    cards.map((card) => (
      <Card
              key={card.id}
              style={styles.card}
              status={
                new Date(card.sonOdeme * 1000) < today ? "danger" : "success"
              }
              header={Header(null, card.cardholder, card.bank, card.cardNo, card.sonOdeme)}
              onPress={() => navigation.navigate('Kartlar')}
            >
              <Text style={styles.text}>
                Son Ödeme Tarihi:{" "}
                {new Date(card.sonOdeme * 1000).toLocaleDateString("tr-TR")}
              </Text>
            </Card>
    ))
    : 
    <>
    <AntDesign name="checkcircle" size={50} color="green" style={styles.headerText} />   
    <Text category={"s1"} style={styles.headerText}>Ödemesi geçmiş ya da 5 gün içinde ödenecek kartınız yok!</Text>
    </>
    }
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
    padding: 8,
  },
  headerText: {
    flex:1,
    textAlign:'center',
    paddingTop: 20,
    paddingBottom: 30
  },
  card: {
    margin:10,
    borderRadius:15
  }
});
