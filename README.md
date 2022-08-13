# Credit Card Payment Tracker
A simple credit card payment tracking app with push notifications built with React Native
## My motivation behind the project
I built this project for personal and family use. For example, when you have twenty cards from ten banks it starts to become difficult to track your payments. You need to keep track of payments carefully or the banks are ready to apply interests.
This app aims to solve this basic yet important problem. My other motivation was to learn or at least have an idea about mobile development and React Native. Since I already know about React, I can say it was not hard to develop in RN.
## What did I learn with this project?
Until I started to build this project, I was only using class components in React at my job and functional components were in my learning list. So, this project helped me to build
understanding of functional components and hooks in React.

I wanted to complete this project in a shortest possible time so my parents can use it in family business. My purpose when I'm starting this project was also to learn node.js for backend but there were time constraints. Therefore, I decided to use
Firebase. I know SQL but I never really experienced NoSQL before this project. I read about differences between SQL and NoSQL DBs but with this project I was able to clearly see the differences. I used Cloud Firestore as the database in this project.
I kept all the records on Cloud Firestore. I also used Firebase Cloud Functions in order to check the database and send push notifications if there is a payment in this day or a forgotten payment. 

I used Expo to build and deploy in this project. I liked Expo in a way since it really makes the process simple. However, like everything in life it has advantages and disadvantages. For example, you cannot use all iOS and Android APIs. Would I use Expo again? Probably not. I would build and deploy natively.

## Self-critics
- I am aware that project structure is a little bit messy.
- I could create the state arrays and it would be much more clean. For example, in the AddCardScreen component I kept every single card info in different state. But using it like below would be much better.
```
const [cardData, setCardData] = useState({ cardHolder : "", cardNo : "", paymentDate : new Date() }) // etc.
```
- Some of my functions are more complex than it should normally have been. I could have splitted some functions into simpler and clearer functions.

There are more things to enhance in this codebase but these are the first ones that comes to my mind.

### Things to add
I used expo-firebase-starter repo as my starter template. If you want to learn or curious about Expo, React Native and Firebase combination you can reach the repo from [this link](https://github.com/expo-community/expo-firebase-starter).
