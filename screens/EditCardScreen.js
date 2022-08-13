import { Formik } from "formik";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  Text,
  Button,
  Alert,
  TouchableOpacity,
  Pressable
} from "react-native";
import { View } from "../components";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";
import "firebase/firestore";
import RNPickerSelect from "react-native-picker-select";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
// import { TouchableOpacity } from "react-native-gesture-handler";
import firebase from "firebase/compat/app";
import "firebase/auth";
import { useIsFocused } from "@react-navigation/native";
import Toast from 'react-native-root-toast';
import { UserInterfaceIdiom } from "expo-constants";
import { getAuth } from "firebase/auth";

export const EditCardScreen = ({ route, navigation }) => {
  const [selectedBank, setSelectedBank] = useState("");
  const [banks, setBanks] = useState([]);
  const [date, setDate] = useState("");
  const [mode, setMode] = useState("date");
  const [showSubmit, setShow] = useState(false);
  const [cardholder, setCardholder] = useState("");
  const [shouldUpdate, setShouldUpdate] = useState(false);

  const { docID, cardNo, bank, cardHolder, sonOdeme, ShouldUpdate } =
    route.params;
  let today = new Date();
  today = new Date(today.setDate(today.getDate() - 1));
  today = new Date(today.setHours(0, 0, 0));

  const isFocused = useIsFocused();

  const user = getAuth().currentUser;

  useEffect(() => {
    const q = query(collection(db, "banks"), orderBy("BankName", "asc"));
    onSnapshot(q, (querySnapshot) => {
      setBanks(
        querySnapshot.docs.map((doc) => ({
          label: doc.data().BankName,
          value: doc.data().BankName,
          id: doc.id,
        }))
      );
    });
    setSelectedBank(bank);
    setShouldUpdate(ShouldUpdate);
  }, []);

  useEffect(() => {
    setSelectedBank(bank);
    setCardholder(cardHolder);
    setDate(new Date(sonOdeme * 1000));
  }, [isFocused]);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
  };

  const onFormSubmit = () => {
    // Alert.alert("Kart No Hatası", date + '' + tomorrow.setDate(today.getDate() + 1))
    if (
      selectedBank == null ||
      selectedBank == undefined ||
      selectedBank == ""
    ) {
      Alert.alert("Kart Kaydedilemedi", "Lütfen banka seçiniz");
    } else if (cardholder == "" || cardHolder == null) {
      Alert.alert(
        "Kart Kaydedilemedi",
        "Lütfen kart sahibini alanını doldurun"
      );
    } else if (date < today) {
      Alert.alert(
        "Tarih Hatası",
        "Son ödeme tarihi olarak geçmiş bir tarih seçemezsiniz!"
      );
    } else {
      firebase
        .firestore()
        .collection("cards").doc(user.uid).collection("userCards")
        .doc(docID)
        .update({
          Banka: selectedBank ? selectedBank : bank,
          KartSahibi: cardholder ? cardholder : cardHolder,
          SonOdeme: date ? date : new Date(sonOdeme * 1000),
          uid : user.uid
        })
        .then(() => {
          Alert.alert(
            "Kart Kaydedildi",
            "Banka: " +
              selectedBank +
              "\n" +
              "Kart No: " +
              cardNo +
              "\n" +
              "Kart Sahibi: " +
              (cardholder ? cardholder : cardHolder) +
              "\n" +
              "Son Ödeme Tarihi: " +
              date.toLocaleDateString(),
            [
              {
                text: "Tamam",
                onPress: () => {
                  navigation.navigate("Kartlar");
                  setShouldUpdate(true);
                },
              },
            ]
          );
        }
        )
        .catch((error) =>
          Alert.alert("Firestore Hatası", "Kart güncellenemedi" + error)
        );
    }
    //   firebase.firestore().collection("cards").add({
    //     Banka: selectedBank,
    //     KartNo: maskedValue,
    //     KartSahibi: cardholder,
    //     SonOdeme: date,
    // });
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <>
        <TouchableOpacity onPress={() => navigation.navigate("Kartlar")}
        style={{flex:1, justifyContent:'center', paddingRight:25, flexDirection:'row', alignItems:'center'}}
        >
        <Ionicons name="ios-chevron-back" size={24} color="#007aff" /><Text style={{color:"#007aff", fontSize:16}}>Geri Dön</Text>
        </TouchableOpacity>
        </>
      ),
    });
  }, [navigation]);

  return (
    <>
      <View style={styles.container}>
        <Text style={{ fontSize: 22, textAlign: "center", paddingBottom: 70 }}>
          {cardNo}
        </Text>
        <Text style={{ marginLeft: 15 }}>Banka</Text>
        <RNPickerSelect
          key={banks.id}
          style={{
            ...pickerSelectStyles,
            iconContainer: { top: 28, right: 30 },
          }}
          items={banks}
          value={selectedBank ? selectedBank : bank}
          onValueChange={(value) => setSelectedBank(value)}
          placeholder={{ label: "Banka Seçiniz", value: null }}
          Icon={() => {
            return <AntDesign name="down" size={18} color="black" />;
          }}
          doneText="Seç"
        />
        <Text style={{ marginLeft: 15 }}>Kart Sahibi</Text>
        <TextInput
          autoCapitalize="words"
          style={styles.input}
          value={cardholder ? cardholder : cardHolder}
          placeholder="Kart Sahibi"
          onChangeText={setCardholder}
        />
        <Text style={{ marginLeft: 15 }}>Son Ödeme Tarihi</Text>
        <DateTimePicker
          testID="dateTimePicker"
          value={date ? date : new Date(sonOdeme * 1000)}
          mode={mode}
          is24Hour={true}
          display="spinner"
          onChange={onChange}
          locale="tr"
          minimumDate={new Date(2022, 1, 1)}
          style={{ ...styles.input, left: 0 }}
        />
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={() => onFormSubmit()}
        >
          {showSubmit ? (
            <AntDesign
              name="check"
              size={40}
              color="white"
              style={styles.submitIcon}
            />
          ) : (
            <Text style={styles.submitText}>Bilgileri Güncelle</Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
    padding: 8,
  },
  input: {
    height: 50,
    margin: 12,
    paddingLeft: 10,
    borderWidth: 1,
    borderRadius: 15,
  },
  submitBtn: {
    backgroundColor: "#f47920",
    height: 50,
    margin: 12,
    justifyContent: "center",
    borderRadius: 10,
  },
  submitText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 18,
  },

  submitIcon: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    margin: 12,
    borderWidth: 1,
    borderRadius: 15,
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "purple",
    borderRadius: 8,
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
