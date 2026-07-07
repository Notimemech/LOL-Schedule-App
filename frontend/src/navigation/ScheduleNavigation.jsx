import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import ScheduleScreen from '../screens/matches/ScheduleScreen'

const Stack = createNativeStackNavigator()

const ScheduleNavigation = () => {
  return (
    <Stack.Navigator initialRouteName="Schedule" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
    </Stack.Navigator>
  )
}

export default ScheduleNavigation