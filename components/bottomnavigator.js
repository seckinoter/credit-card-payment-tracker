import React, {useState, useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation, BottomNavigationTab, Layout, Icon } from '@ui-kitten/components';
import { HomeScreen, LoginScreen } from '../screens';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddCardScreen } from '../screens/AddCardScreen';
import { CardsScreen } from '../screens/Cards';
import { EditCardScreen } from '../screens/EditCardScreen';
import { HelpScreen } from '../screens/HelpScreen';
import { Button, View, Text } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { auth } from '../config';
import { db } from '../config/firebase';
import { FontAwesome } from '@expo/vector-icons';
import { doc, updateDoc, deleteField } from "firebase/firestore";
import { FontAwesome5 } from '@expo/vector-icons'; 

const { Navigator, Screen } = createBottomTabNavigator();
// let user = auth.currentUser ? auth.currentUser.email : "";
const ProfileScreen = ({navigation}) => {

  const [user, setUser] = useState("");

  useEffect(() => {
    setUser(auth.currentUser.email);
  },[])

  return (
  <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  <Text style={{fontSize:20, textAlign:'center', fontWeight:'600', paddingVertical:80, marginTop:-100}}>Merhaba, {"\n"} {user}</Text>
    <Button title='Destek' onPress={() => navigation.navigate('Destek')}></Button>
    <Button title='Çıkış Yap' onPress={LogOut}></Button>
  </Layout>
  )
};

const LogOut = () => {
  const userOutMail = getAuth().currentUser.email;
  const userRef = doc(db, 'users', userOutMail);
// Remove the 'capital' field from the document
signOut(auth).then(() => {

  (async() => {await updateDoc(userRef, {
    token: deleteField()
  })})();

}).catch(error => console.log('Error logging out: ', error));
  
  
  }

const PersonIcon = (props) => (
    <Icon {...props} name='person-outline'/>
  );

  const CardIcon = (props) => (
    <Icon {...props} name='credit-card-outline'/>
  );

  const HomeIcon = (props) => (
    <Icon {...props} name='home-outline'/>
  );

  const AddCardIcon = (props) => (
    <Icon {...props} name='plus-square-outline'/>
  );
  

const BottomTabBar = ({ navigation, state }) => (
  <BottomNavigation
    selectedIndex={state.index}
    onSelect={index => navigation.navigate(state.routeNames[index])}
    style={{backgroundColor:'white' ,paddingBottom:30, paddingTop:10}}
    >
    <BottomNavigationTab title='Ana Sayfa' icon={HomeIcon}/>
    <BottomNavigationTab title='Kartlar' icon={CardIcon}/>
    <BottomNavigationTab title='Kart Ekle' icon={AddCardIcon}/>
    <BottomNavigationTab title='Profil' icon={PersonIcon}/>
  </BottomNavigation>
);

const TabNavigator = () => (
  <Navigator tabBar={props => <BottomTabBar {...props} />}>
    <Screen name='Ana Sayfa' component={HomeScreen}/>
    <Screen name='Kartlar' component={CardsScreen}/>
    <Screen name='Kart Ekle' component={AddCardScreen}/>
    <Screen name='Profil' component={ProfileScreen}/>
    <Screen name='Kart Düzenle' component={EditCardScreen}/>
    <Screen name='Destek' component={HelpScreen}/>
    
  </Navigator>
);

export const AppNavigator = () => (
  // <NavigationContainer>
    <TabNavigator/>
  // </NavigationContainer>
);