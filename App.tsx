import React, { useState } from "react";
import { View, Text, StatusBar, StyleSheet, TouchableOpacity, Modal, Image, 
  PermissionsAndroid, 
  Platform} from 'react-native';
import { RNCamera } from 'react-native-camera';
import CameraRoll from "@react-native-community/cameraroll";
import * as ImagePicker from 'react-native-image-picker';

export default function App() {
  const [type, setType] = useState(RNCamera.Constants.Type.back);
  const [open, setOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  async function takePicture(camera) {
    const options = { quality: 0.5, base64: true };
    const data = await camera.takePictureAsync(options);

    setCapturedPhoto(data.uri);
    setOpen(true);
    console.log('Foto tirada camera: ' + data.uri);

    savePicture(data.uri);
  }

  function toggleCam(){
    setType( type === RNCamera.Constants.Type.back ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back );
  }

  async function hasAndroidPermission(){
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
    const hasPermission = await PermissionsAndroid.check(permission);
    if(hasPermission){
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  }

  async function savePicture(data){
      if(Platform.OS === 'android' && !(await hasAndroidPermission())){
        return;
      }

     CameraRoll.save(data, "photo")
     .then((res) => {
       console.log("Salvo com sucesso!");
     })
     .catch((err) => {
       console.log("Erro ao salvar: " + err);
     });
  }

  function openAlbum(){
      const options = {
        title: 'Selecione uma foto',
        chooseFromLibraryButtonTitle: 'Buscar foto do álbum...',
        noData: true,
        mediaType: 'photo'
      }

      ImagePicker.launchImageLibrary(options, (response)  => {

        if(response.didCancel){
          console.log('Image Picker cancelado...');
        }else if(response.error){
          console.log('Gerou um erro: ' + response.error)
        }else{
          setCapturedPhoto(response.assets[0].uri);
          setOpen(true);
        }
      })
  }

  return (
    <View style={styles.container}>
      <StatusBar />
      <RNCamera
        style={styles.preview}
        type={type}
        flashMode={RNCamera.Constants.FlashMode.auto}
        androidCameraPermissionOptions={{
          title: 'Permissão para usar a camera',
          message: 'Precisamos usar a sua camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancelar'
        }}
      >
        {
          ({ camera, status, recordAndroidPermissionStatus }) => {
            if (status !== 'READY') return <View />;
            return (
              <View style={{ marginBottom: 35, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <TouchableOpacity
                  onPress={() => takePicture(camera)}
                  style={styles.capture}
                >
                  <Text>Tirar foto</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={openAlbum}
                  style={styles.capture}
                >
                  <Text>Álbum</Text>
                </TouchableOpacity>

              </View>
            )
          }
        }
      </RNCamera>

        <View style={styles.camPosition}>
          <TouchableOpacity onPress={toggleCam}>
            <Text>
              Trocar
            </Text>
          </TouchableOpacity>
        </View>
      {capturedPhoto &&
        <Modal
          animationType='slide' transparent={false} visible={open}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', margin: 20 }}>
            <TouchableOpacity style={{ margin: 10 }}
              onPress={() => setOpen(false)}
            >
              <Text style={{ fontSize: 24 }}>
                Fechar
              </Text>
            </TouchableOpacity>

            <Image 
              resizeMode='contain'
              style={{width: 350, height: 350, borderRadius: 15}}
              source={{ uri: capturedPhoto }}
            />
          </View>

        </Modal>
      }

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },

  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },

  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20
  },
  camPosition:{
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    height: 40,
    position: 'absolute',
    right: 25,
    top: 60

  }
})