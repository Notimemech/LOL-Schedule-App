import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import ScheduleScreen from '../screens/matches/ScheduleScreen'
import DetailScreen from '../screens/matches/DetailScreen'

const Stack = createNativeStackNavigator()

const ScheduleNavigation = () => {
  return (
    <Stack.Navigator initialRouteName="Schedule">
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  )
}

export default ScheduleNavigation