import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Formik } from 'formik';
import { sendPasswordResetEmail } from 'firebase/auth';

import { passwordResetSchema } from '../utils';
import { Colors, auth } from '../config';
import { View, TextInput, Button, FormErrorMessage } from '../components';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [errorState, setErrorState] = useState('');

  const handleSendPasswordResetEmail = values => {
    const { email } = values;

    sendPasswordResetEmail(auth, email)
      .then(() => {
        console.log('Success: Password Reset Email sent.');
        navigation.navigate('Login');
      })
      .catch(error => setErrorState(error.message));
  };

  return (
    <View isSafe style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.screenTitle}>Şifrenizi sıfırlayın</Text>
      </View>
      <View style={styles.formArea}>
      <Formik
        initialValues={{ email: '' }}
        validationSchema={passwordResetSchema}
        onSubmit={values => handleSendPasswordResetEmail(values)}
      >
        {({
          values,
          touched,
          errors,
          handleChange,
          handleSubmit,
          handleBlur
        }) => (
          <>
            <TextInput
              name='email'
              leftIconName='email'
              placeholder='Mail adresinizi giriniz'
              autoCapitalize='none'
              keyboardType='email-address'
              textContentType='emailAddress'
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
            />
            <FormErrorMessage error={errors.email} visible={touched.email} />
            {errorState !== '' ? (
              <FormErrorMessage error={errorState} visible={true} />
            ) : null}
            <Button style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Sıfırlama Mailini Gönder</Text>
            </Button>
          </>
        )}
      </Formik>
      <Button
        style={styles.borderlessButtonContainer}
        borderless
        title={'Giriş Ekranına Dön'}
        onPress={() => navigation.navigate('Login')}
      />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
  },
  innercontainer: {
    alignItems: 'center',

  },
  screenTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.black,
    paddingTop: 20,
    textAlign:'center',
    paddingTop:50
  },
  button: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: Colors.orange,
    padding: 10,
    borderRadius: 8
  },
  buttonText: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: '700'
  },
  borderlessButtonContainer: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  formArea: {
    flex: 1,
    marginTop: 100
  }
});
