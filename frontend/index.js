import { registerRootComponent } from 'expo';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setThemeSync } from './src/styles/colors';

const Root = () => {
  const [loaded, setLoaded] = useState(false);
  const [AppComponent, setAppComponent] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const theme = await AsyncStorage.getItem('appTheme');
        if (theme) {
          setThemeSync(theme);
        }
      } catch (e) {
        console.error('Failed to load theme', e);
      } finally {
        let initialRoute = 'SignIn';
        try {
          const token = await AsyncStorage.getItem('userToken');
          if (token) initialRoute = 'MainTabs';
        } catch (e) {
          // ignore
        }
        
        // Dynamically require App.js so that styles evaluate AFTER the theme is set.
        const appModule = require('./App');
        setAppComponent(() => (props) => {
          const App = appModule.default;
          return <App initialRouteName={initialRoute} {...props} />;
        });
        setLoaded(true);
      }
    }
    init();
  }, []);

  if (!loaded || !AppComponent) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050708', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00F5E1" />
      </View>
    );
  }

  return <AppComponent />;
};

registerRootComponent(Root);
