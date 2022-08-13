import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import * as eva from '@eva-design/eva';
import { RootNavigator } from './navigation/RootNavigator';
import { AuthenticatedUserProvider } from './providers';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { default as theme } from './custom-theme.json';
import { RootSiblingParent } from 'react-native-root-siblings';
import * as Notifications from 'expo-notifications';
import "firebase/firestore";
import * as Sentry from 'sentry-expo';


export async function allowsNotificationsAsync() {
  const settings = await Notifications.getPermissionsAsync();
  return (
    settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

Sentry.init({
  dsn: "https://fe1adda58a1b43ada79f9eceda654d09@o1172350.ingest.sentry.io/6267258",
  enableInExpoDevelopment: true,
  debug: false,
});



const App = () => {



  
 

  return (
    <AuthenticatedUserProvider>
    <StatusBar barStyle='dark-content' />
      <SafeAreaProvider>
      <RootSiblingParent>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={{...eva.light,...theme}}>
      <RootNavigator/>
      </ApplicationProvider>
      </RootSiblingParent>
      </SafeAreaProvider>
    </AuthenticatedUserProvider>
  );


};



export default App;
