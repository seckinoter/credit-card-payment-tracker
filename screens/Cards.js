import { Pressable, TouchableOpacity } from "react-native";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { query, orderBy, onSnapshot } from "firebase/firestore";
import { collection, getDocs, where } from "firebase/firestore";
import { db } from "../config/firebase";
import "firebase/firestore";
import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, TextInput, Alert, View } from "react-native";
import { Button, Card, Layout, Text, Icon, RadioGroup, Radio, Spinner } from "@ui-kitten/components";
import Toast from "react-native-root-toast";
import { ScrollView, RefreshControl } from "react-native";
import { FontAwesome, AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { getAuth } from "firebase/auth";

export const CardsScreen = ({ navigation, route }) => {
  const [cards, setCards] = useState([]);
  const [shouldUpdate, setShouldUpdate] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [searchCard, setSearchCard] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [radioIndex, setRadioIndex] = React.useState(0);
  
  const isFocused = useIsFocused();

  let today = new Date();

  const user = getAuth().currentUser;

  useEffect(() => {
    const q = query(collection(db, "cards", user.uid, "userCards"), orderBy("SonOdeme", "asc"));
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
  }, [isFocused, shouldUpdate]);

  const TrashIcon = (props) => <Icon {...props} name="trash-2-outline" />;

  const EditIcon = (props) => <Icon {...props} name="edit-outline" />;

  const PaidIcon = (props) => (
    <Icon {...props} name="checkmark-circle-outline" />
  );

  const Header = (props, cardholder, bank, cardNo, sonOdeme) => (
    <View {...props}>
    {new Date(sonOdeme * 1000) < today ?
      <FontAwesome name="warning" size={26} color="red" style={{flex:1, textAlign:'center', paddingBottom:20}} /> : null
    }
      <Text category="h6">{cardNo}</Text>
      <Text category="s1">
        {bank} - {cardholder}
      </Text>
    </View>
  );

  const Footer = (docID, cardNo, bank, cardholder, sonOdeme) => (
    <View style={[styles.footerContainer]}>
      <Button
        style={styles.footerControl}
        size="medium"
        status="danger"
        accessoryLeft={TrashIcon}
        onPress={() => deleteCard(docID, cardNo)}
      >
        Sil
      </Button>
      <Button
        style={styles.footerControl}
        size="medium"
        status="basic"
        accessoryLeft={EditIcon}
        onPress={() =>
          navigation.navigate("Kart Düzenle", {
            docID: docID,
            cardNo: cardNo,
            bank: bank,
            cardHolder: cardholder,
            sonOdeme: sonOdeme,
            ShouldUpdate: true,
          })
        }
      >
        Düzenle
      </Button>
      <Button
        style={styles.footerControl}
        textStyle={{ fontSize: 20 }}
        size="medium"
        status="success"
        accessoryLeft={PaidIcon}
        onPress={() => setPaid(docID, cardNo, sonOdeme)}
      >
        Ödendi İşaretle
      </Button>
    </View>
  );

  const deleteCard = (docID, cardNo) => {
    Alert.alert("Kart Silme Onayı", cardNo + " no'lu kart silinsin mi?", [
      {
        text: "Sil",
        onPress: () =>
          firebase
            .firestore()
            .collection("cards")
            .doc(user.uid).collection("userCards").doc(docID)
            .delete()
            .then(() => {
              let toast = Toast.show("  Kart silindi  ", {
                duration: 2000,
                position: 0,
                shadow: true,
                animation: true,
                hideOnPress: true,
              });
            })
            .catch((error) => {
              Alert.alert("Kart Silinemedi", "Hata : " + error);
            }),
      },
      { text: "Vazgeç", style: "cancel" },
    ]);
  };

  const setPaid = (docID, cardNo, sonOdeme) => {
    today = new Date();
    let prevDate = new Date(sonOdeme * 1000);
    let nextDate = new Date(prevDate.setMonth(prevDate.getMonth() + 1));
    let OneAndHalfMonthAhead = new Date(today.setDate(today.getDate() + 45));
    Alert.alert(
      "Kart Ödendi Onayı",
      cardNo + " no'lu kart ödendi olarak işaretlensin mi?",
      [
        {
          text: "İşaretle ve Güncelle",
          onPress: () => {
            if (OneAndHalfMonthAhead > nextDate) {
              firebase
                .firestore()
                .collection("cards")
                .doc(user.uid).collection("userCards").doc(docID)
                .update({
                  SonOdeme: nextDate,
                })
                .then(() => {
                  let toast = Toast.show(
                    "Kartın Son Ödeme Tarihi Güncellendi",
                    {
                      duration: 3000,
                      position: 0,
                      shadow: true,
                      animation: true,
                      hideOnPress: true,
                      opacity: 1,
                    }
                  );
                })
                .catch((error) => {
                  Alert.alert("Veritabanı Hatası", "Kartın son ödeme tarihi güncellenemedi. Hata : " + error);
                });
            } else {
              Alert.alert(
                "Son Ödeme Tarihi Hatası",
                "Son ödeme tarihini bir aydan daha ötesi için güncelleyemezsiniz"
              );
            }
          },
        },
        { text: "Vazgeç", style: "cancel" },
      ]
    );
  };

  useEffect(() => {
    let searchLookup = ""
    if (radioIndex == 0) {
      searchLookup = "KartNo";
    } else if (radioIndex == 1) {
      searchLookup = "Banka";
    } else {
      searchLookup = "KartSahibi";
    }
    if (searchValue.trim() != "" && searchValue != null){
    // firebase.firestore().collection("cards").where(searchLookup, ">=", searchValue).where(searchLookup, "<=", searchValue+ '\uf8ff')
    const q = query(collection(db, "cards", user.uid, "userCards"), where(searchLookup, ">=", searchValue), where(searchLookup, "<=", searchValue+ '\uf8ff'));
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
  } else {
    const q = query(collection(db, "cards", user.uid, "userCards"), orderBy("SonOdeme", "asc"));
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
  }
  },[searchValue])

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPressIn={() => setSearchCard(searchCard => !searchCard)}
        style={{flex:1, justifyContent:'center', paddingRight:25}}
        hitSlop={{left:40}}
        >
        <FontAwesome name="search" size={24} color="black"/>
        </Pressable>
      ),
    });
  }, [navigation]);



  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false),1500);
  }, []);

  // console.log('Son odeme: ' +new Date(sonOdeme*1000));
  console.log(today);

  return (
    <React.Fragment>
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
        <View style={{ flex: 0 }}>
        {searchCard ?
        <>
        <TextInput
          style={styles.input}
          placeholder={radioIndex == 0 ? "Aramak için kart numarası girin" : (radioIndex == 1 ? "Banka girin" : "Kart Sahibi girin")}
          onChangeText={setSearchValue}
          value={searchValue}
          keyboardType={radioIndex == 0 ? 'numeric' : 'default'}
          returnKeyType="done"
        />
        <RadioGroup
        selectedIndex={radioIndex}
        onChange={index => setRadioIndex(index)}
        style={styles.radio}>
        <Radio>Kart Numarası</Radio>
        <Radio>Banka</Radio>
        <Radio>Kart Sahibi</Radio>
      </RadioGroup>
        </> : null}
        {cards.length > 0 ?
          cards.map((card) => (
            <Card
              key={card.id}
              style={styles.card}
              status={
                new Date(card.sonOdeme * 1000) < today ? "danger" : "success"
              }
              header={Header(null, card.cardholder, card.bank, card.cardNo, card.sonOdeme)}
              footer={Footer(
                card.id,
                card.cardNo,
                card.bank,
                card.cardholder,
                card.sonOdeme
              )}
            >
              <Text style={styles.text}>
                Son Ödeme Tarihi:{" "}
                {new Date(card.sonOdeme * 1000).toLocaleDateString("tr-TR")}
              </Text>
            </Card>
          ))
          :
          <>
          <FontAwesome5 name="info-circle" size={50} color="#ffbc2b" style={{textAlign:"center",marginTop:30}}/>
          <Text category={"s1"} style={{textAlign:"center", fontSize:18,marginTop:30}}>Kart bulunamadı!</Text>
          <Text category={"p1"} style={{textAlign:"center", fontSize:14,marginTop:20,marginHorizontal:10}}>Aşağıdaki menüde bulunan "Kart Ekle" sayfasından yeni bir kart ekleyebilirsiniz.</Text>
          </>
          }
        </View>
      </ScrollView>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    flex: 1,
    margin: 5,
    borderRadius: 20,
    borderColor: "#e0e0e0",
    borderWidth: 3,
  },
  input: {
    height: 50,
    margin: 12,
    paddingLeft: 10,
    borderWidth: 1.5,
    borderRadius: 15,
    borderColor: '#8a8a8a'
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  footerControl: {
    marginHorizontal: 50,
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  text: {
    color: "black",
    fontWeight: "400",
    fontSize: 16,
  },
  radio: {
    flex:1,
    flexDirection:'row',
    justifyContent: 'center'
  }
});
