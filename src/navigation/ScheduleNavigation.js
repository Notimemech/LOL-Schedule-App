import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import ScheduleScreen from '../pages/ScheduleScreen'
import DetailScreen from '../pages/DetailScreen'

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