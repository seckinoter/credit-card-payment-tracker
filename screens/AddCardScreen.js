import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, TextInput, Text, Alert } from "react-native";
import { View } from "../components";
import { MaskedTextInput } from "react-native-mask-text";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";
import "firebase/firestore";
import RNPickerSelect from "react-native-picker-select";
import { AntDesign } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { TouchableOpacity } from "react-native-gesture-handler";
import firebase from "firebase/compat/app";
import "firebase/auth";
import { getAuth } from "firebase/auth";
import { useIsFocused } from "@react-navigation/native";

export const AddCardScreen = ({ navigation }) => {
  const [maskedValue, setMaskedValue] = useState("");
  const [unMaskedValue, setUnmaskedValue] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [banks, setBanks] = useState([]);
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("date");
  const [showSubmit, setShow] = useState(false);
  const [cardholder, setCardholder] = useState("");
  const [saveAttempt, setSaveAttempt] = useState(false);
  const [shouldUpdate, setShouldUpdate] = useState(false);
  let [pickerBorder, setPickerBorder] = useState(null);
  // const [canSave, setCanSave] = useState(false);

  let cardCheck = useRef(null);
  let maskInputRef = useRef();
  const isFocused = useIsFocused();



  let today = new Date();
  today = new Date(today.setDate(today.getDate() - 1));
  today = new Date(today.setHours(0, 0, 0));

  const user = getAuth().currentUser;

  /* function to get all tasks from firestore in realtime */
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
  }, []);

  useEffect(() => {
    setShouldUpdate(true);
  },[isFocused])

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
  };

  const onFormSubmit = () => {
    // Alert.alert("Kart No Hatası", date + '' + tomorrow.setDate(today.getDate() + 1))
    console.log('button clicked');
    console.log('date: '+date);
    console.log('today: '+today);
    if (
      selectedBank == null ||
      selectedBank == undefined ||
      selectedBank == ""
    ) {
      Alert.alert("Kart Kaydedilemedi", "Lütfen banka seçiniz");
    } else if (maskedValue.length != 19) {
      Alert.alert("Kart No Hatası", "Hatalı Kart Numarası");
    } else if (cardholder == "") {
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
      firebase.firestore().collection('cards').doc(user.uid).collection("userCards").where("KartNo", "==", maskedValue).get().then(
        (querySnapshot) => {
          cardCheck.current = querySnapshot.size;
          if (cardCheck.current > 0) {
            Alert.alert("Kayıtlı Kart!", maskedValue + " no'lu kart zaten kayıtlı");
          }
          if (cardCheck.current == 0) {
            firebase.firestore().collection("cards").doc(user.uid).collection("userCards").add({
              Banka: selectedBank,
              KartNo: maskedValue,
              KartSahibi: cardholder,
              SonOdeme: date,
              uid : user.uid
            });
            Alert.alert(
              "Kart Kaydedildi",
              "Banka: " +
                selectedBank +
                "\n" +
                "Kart No: " +
                maskedValue +
                "\n" +
                "Kart Sahibi: " +
                cardholder +
                "\n" +
                "Son Ödeme Tarihi: " +
                date.toLocaleDateString()
            );
            cardCheck.current = null;
            setSelectedBank("");
            setMaskedValue("");
            setUnmaskedValue("");
            setCardholder("");
            setDate(new Date());
            maskInputRef.current.clear();
          }
        }
      )
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={{ marginLeft: 15 }}>Banka</Text>
        <RNPickerSelect
          key={banks.id}
          style={{
            ...pickerSelectStyles,
            iconContainer: { top: 28, right: 30, },
          }}
          items={banks}
          value={selectedBank}
          onValueChange={(value) => setSelectedBank(value)}
          placeholder={{ label: "Banka Seçiniz", value: null }}
          Icon={() => {
            return <AntDesign name="down" size={18} color="black" />;
          }}
          doneText="Seç"
        />
        <Text style={{ marginLeft: 15 }}>Kart No</Text>
        <MaskedTextInput
          mask="9999 **** **** 9999"
          onChangeText={(text, rawText) => {
            setMaskedValue(text);
            setUnmaskedValue(rawText);
          }}
          ref={maskInputRef}
          style={styles.input}
          clearButtonMode='always'
          maxLength={19}
          keyboardType="numeric"
          returnKeyType="done"
          placeholder="1234 **** **** 1234"
        />
        <Text style={{ marginLeft: 15 }}>Kart Sahibi</Text>
        <TextInput
          autoCapitalize="words"
          style={styles.input}
          value={cardholder}
          placeholder="Kart Sahibi"
          onChangeText={setCardholder}
        />
        <Text style={{ marginLeft: 15 }}>Son Ödeme Tarihi</Text>
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
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
            <Text style={styles.submitText}>Kartı Kaydet</Text>
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
    borderWidth: 1.5,
    borderRadius: 15,
    borderColor: '#8a8a8a'
  },
  inputFocus: {
    height: 50,
    margin: 12,
    paddingLeft: 10,
    borderWidth: 1.5,
    borderRadius: 15,
    borderColor: '#62bb46'
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
    borderWidth: 1.5,
    borderRadius: 15,
    borderColor: '#8a8a8a',
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
