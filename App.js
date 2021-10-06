import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  NativeBaseProvider,
  Box,
  Input,
  Flex,
  Button,
  ZStack,
} from 'native-base';
import MapView, { Marker } from 'react-native-maps';
import Dialog from 'react-native-dialog';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [placeName, setPlaceName] = useState('');
  const [placeDescription, setPlaceDescription] = useState('');
  const [markers, setMarkers] = useState([]);

  const storeData = async () => {
    try {
      await AsyncStorage.setItem('@markers', JSON.stringify(markers));
    } catch (e) {
      console.log('Error....');
    }
  };

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('@markers');
      if (value !== null) {
        setMarkers(JSON.parse(value));
      }
    } catch (e) {
      console.log('Errorrrrrrr');
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    storeData();
  }, [markers]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const Header = () => {
    return (
      <Box
        bg={{
          linearGradient: {
            colors: ['lightBlue.300', 'violet.800'],
            start: [0, 0],
            end: [1, 0],
          },
        }}
        p={8}
        rounded="lg"
      >
        <Flex align="center" justify="flex-end">
          <Box
            _text={{
              fontSize: 'xl',
              fontWeight: 'bold',
              color: 'white',
              top: 3,
            }}
          >
            My places
          </Box>
        </Flex>
      </Box>
    );
  };

  const config = {
    dependencies: {
      'linear-gradient': require('expo-linear-gradient').LinearGradient,
    },
  };

  const openDialog = () => {
    setModalVisible(true);
  };

  const cancelPlace = () => {
    setModalVisible(false);
  };

  const AddMarker = async () => {
    try {
      let newCity = await Location.geocodeAsync(placeName);
      if (newCity !== null) {
        setMarkers([
          ...markers,
          {
            id: Math.random(),
            name: placeName,
            description: placeDescription,
            latlng: {
              latitude: newCity[0].latitude,
              longitude: newCity[0].longitude,
            },
          },
        ]);
      }
      setModalVisible(false);
    } catch (e) {
      return;
    }
  };

  return (
    <NativeBaseProvider config={config} flex={1}>
      <ZStack flex={1}>
        <MapView
          style={{
            height: '100%',
            width: '100%',
          }}
          initialRegion={{
            //lat and long for finland
            latitude: 61.9241,
            longitude: 25.7482,
            latitudeDelta: 15,
            longitudeDelta: 0.05,
          }}
        >
          {markers.map((marker, index) => {
            return (
              <Marker
                key={index}
                coordinate={marker.latlng}
                title={marker.name}
                description={marker.description}
              />
            );
          })}
        </MapView>
        <Header />
        <Box
          flex={1}
          height="100%"
          alignSelf="flex-end"
          justifyContent="flex-end"
        >
          <Button margin={5} onPress={openDialog}>
            Add
          </Button>
        </Box>
      </ZStack>

      <Dialog.Container visible={modalVisible}>
        <Dialog.Title>Add a new MyPlace</Dialog.Title>
        <View>
          <View>
            <Input
              onChangeText={(text) => setPlaceName(text)}
              placeholder="City"
            />
          </View>
          <View>
            <Input
              onChangeText={(text) => setPlaceDescription(text)}
              placeholder="Description"
            />
          </View>
        </View>
        <Dialog.Button label="Cancel" onPress={cancelPlace} />
        <Dialog.Button label="Save" onPress={AddMarker} />
      </Dialog.Container>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
