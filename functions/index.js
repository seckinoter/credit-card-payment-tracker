const functions = require("firebase-functions");
const admin = require('firebase-admin');
const { Expo } = require('expo-server-sdk');
const { query, collection } = require('@google-cloud/firestore')

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const app = admin.initializeApp(functions.config().firebase);

const db = admin.firestore(app);

// exports.NotificationScheduler = functions.pubsub.schedule('every 5 minutes').onRun(context => {
//     let expo = new Expo({ accessToken: "ugwIbvPd9S5hhFRRda9V3G3KV7rsQz0EcS_tSFO6" });

    // Create the messages that you want to send to clients
    // let messages = [];
    // let AllPushTokens = [];

    exports.sendNotification = functions.pubsub.schedule('every 5 minutes').onRun(async function(req, res) {
      try {
        let expo = new Expo();
        let CardsToday = "";
        let plusOne = new Date();
        let messages = [];
        let users = [];
        plusOne = new Date(plusOne.setDate(plusOne.getDate() + 1));
        const getUsers = db.collection("users").get().then((idQuery) => {
          idQuery.forEach((user) => {
            users.push({uid: user.data().uid, token: user.data().token});
          });
        })

        getUsers.then(() => {

          setTimeout(() => {
            users.forEach((user) => {
              messages = [];
              CardsToday = "";
              const getCards = db.collection("cards").doc(user.uid).collection("userCards").where("SonOdeme", "<=",plusOne).get().then((querySnapshot) => {
                messages =[];
                querySnapshot.forEach((doc) => {
                  CardsToday = "";
                  CardsToday = doc.data().KartNo;
                  console.log("cardsToday:" +CardsToday + " , " + user.token);
                  if (CardsToday != "") {
                    messages.push({
                      to: user.token,
                      sound: 'default',
                      title: 'Kart Ödemen Var!',
                      body: CardsToday +' nolu kartının son ödeme tarihi bugün ya da ödemesi geçmiş',
                    })
                }
              });
            });
              Promise.all([getCards]).then(() => {
                for (var i=0; i < messages.length; i++){
                  console.log("messages: "+messages[i].body);
                }
              let chunks = expo.chunkPushNotifications(messages);
              let tickets = [];
              (async () => {
          // Send the chunks to the Expo push notification service. There are
          // different strategies you could use. A simple one is to send one chunk at a
          // time, which nicely spreads the load out over time:
            for (let chunk of chunks) {
            try {
              let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
              console.log(ticketChunk);
              tickets.push(...ticketChunk);
              // NOTE: If a ticket contains an error code in ticket.details.error, you
              // must handle it appropriately. The error codes are listed in the Expo
              // documentation:
              // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            } catch (error) {
              console.error(error);
            }
          }
        })();
  
              }) 
            })
          },5000)

        })
        
      }
        catch (error) {
          console.log("error: " + error);
        }});
