import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true
  }) 
})

export default function App() {

  const notificationListener = useRef();
  const responseListener = useRef();

  const [notification, setNotification] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');

  useEffect(() => {

    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
    
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response); // object
      console.log('addNotificationResponseReceivedListener');
    })

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  });

  return (
    <View style={styles.container}>
      <Text>Expo Push Token: {expoPushToken} </Text>
      <Text>Titre: {notification && notification.request.content.title}</Text>
      <Text>Body: {notification && notification.request.content.body}</Text>
      <Text>Data: {notification && notification.request.content.data.data}</Text>
      <Button
        title="Cliquer"
        onPress={async () => {
          await handleNotification();
        }}
      />
    </View>
  );
}

async function handleNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Acheter du pain",
      body: "Notre première notification locale",
      data: { data: 'DonkeyGeek'}
    },
    trigger: {
      seconds: 10
    }
  })
}

async function registerForPushNotificationsAsync() {

  let token;

  if (Constants.isDevice) {
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const {status} = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert("Pas de jeton de notification Push");
      return;
    }

    token = ( await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);


  } else {
    alert('Les Notifications Push ne fonctionnent pas sur un simulateur!')
  }

  return token;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
