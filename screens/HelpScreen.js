import React from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { db } from '../config/firebase';
import 'firebase/app';
import 'firebase/firestore';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';







export const HelpScreen = ({navigation}) => {

    const [text, onChangeText] = React.useState("");


const onFormSubmit = (message, user) => {
    if(text != ""){
    const sendMessage = addDoc(collection(db, "helpMessages"), {
        message: message,
        user: user,
        sendTime: new Date()
    });
    sendMessage.then(() => {
        Alert.alert("Mesajınız başarıyla gönderildi. En kısa sürede size dönüş sağlayacağız.");
        onChangeText("");
        
    }).catch((error) => {
        Alert.alert("Mesajınız kaydedilemedi. Hata: " + error);
    })
} else {
    Alert.alert("Mesaj boş olamaz!");
}
    

}


    return(
        <ScrollView>
        <View style={{flex:1, justifyContent:'center', marginTop:'30%'}}>
        <Text style={styles.header}>Mesajınız</Text>
        <TextInput
            multiline={true}
            style={styles.input}
            placeholder="Lütfen iletmek istedğiniz mesajı yazınız."
            onChangeText={onChangeText}
            value={text}
            returnKeyType={"done"}
            blurOnSubmit={true}
        />
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={() => onFormSubmit(text, getAuth().currentUser.email)}
        ><Text style={styles.submitText}>Gönder</Text></TouchableOpacity>
        </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    input:{
    height: '100%',
    width:'90%',
    paddingTop:20,
    justifyContent:'center',
    textAlignVertical:'center',
    margin: 12,
    paddingLeft: 10,
    paddingRight:10,
    borderWidth: 1.5,
    borderRadius: 15,
    borderColor: '#032B43',
    },
    header:{
    fontSize:16,
    fontWeight:'500',
    textAlign:'left',
    paddingLeft:15
    },
    submitBtn: {
        backgroundColor: "#f47920",
        height: 50,
        margin: 12,
        justifyContent: "center",
        borderRadius: 10,
        width: '90%',
    },
    submitText: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 18,
      },
})