// import React from 'react';
// import {StatusBar} from 'react-native';
// import {SafeAreaProvider} from 'react-native-safe-area-context';
// import AppNavigator from './src/navigation/AppNavigator';
// import './global.css';

// export default function App() {
//   return (
//     <SafeAreaProvider>
//       <StatusBar
//         barStyle="light-content"
//         backgroundColor="transparent"
//         translucent
//       />
//       <AppNavigator />
//     </SafeAreaProvider>
//   );
// }

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider } from './src/context/AppContext';
import StackNavigator from './src/navigation/StackNavigator';
import { initDatabase } from './src/database/db';

const App = () => {
    useEffect(() => {
        // Initialize database on app start
        const setupDatabase = () => {
            const success = initDatabase();
            if (success) {
                console.log('✅ Database initialized successfully');
            } else {
                console.error('❌ Database initialization failed');
            }
        };

        setupDatabase();
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AppProvider>
                <NavigationContainer>
                    <StatusBar barStyle="light-content" backgroundColor="#000000" />
                    <StackNavigator />
                </NavigationContainer>
            </AppProvider>
        </GestureHandlerRootView>
    );
};

export default App;

// import React, { useEffect } from 'react';
// import { StatusBar, Platform } from 'react-native';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
// import AppNavigator from './src/navigation/AppNavigator';
// import RNBootSplash from "react-native-bootsplash"; // 👈 bootsplash import

// // If you really have global.css (rare for RN) - otherwise ignore
// import './global.css';

// export default function App() {
//   useEffect(() => {
//     const init = async () => {
//       // yaha tum app start hone par koi bhi async kaam karna chaho to kar sakte ho
//       // jaise user auth check, local storage read, etc.
//       await new Promise(resolve => setTimeout(resolve, 1000)); // demo delay
//     };

//     init().finally(() => {
//       RNBootSplash.hide({ fade: true }); // 👈 splash hide karega jab init complete hoga
//     });
//   }, []);

//   return (
//     <SafeAreaProvider>
//       {/* StatusBar: Keep it opaque for Android, translucent only if you want content under statusbar */}
//       <StatusBar
//         barStyle="light-content"
//         backgroundColor={Platform.OS === 'android' ? '#111827' : 'transparent'}
//         translucent={Platform.OS !== 'android'}
//       />
//       <AppNavigator />
//     </SafeAreaProvider>
//   );
// }
