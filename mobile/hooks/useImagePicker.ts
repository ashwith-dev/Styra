import { useState, useCallback } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { checkImage } from "../lib/image";

export interface PickedImage {
  uri: string;
}

interface UseImagePickerReturn {
  /** The picked image URI, or null if none selected. */
  image: PickedImage | null;
  /** Loading state during compression. */
  processing: boolean;
  /** Open the camera. */
  takePhoto: () => Promise<void>;
  /** Open the gallery. */
  pickFromGallery: () => Promise<void>;
  /** Clear the picked image. */
  reset: () => void;
}

export function useImagePicker(): UseImagePickerReturn {
  const [image, setImage] = useState<PickedImage | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleResult = useCallback(
    async (result: ImagePicker.ImagePickerResult) => {
      if (result.canceled || !result.assets[0]) return;

      setProcessing(true);
      try {
        const asset = result.assets[0];
        const check = await checkImage(asset.uri);

        if (!check.valid || !check.uri) {
          Alert.alert("Invalid Image", check.reason || "Please choose a different photo.");
          return;
        }

        setImage({ uri: check.uri });
      } finally {
        setProcessing(false);
      }
    },
    [],
  );

  const takePhoto = useCallback(async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Camera Permission",
        "Camera access is needed to take photos of your clothing items.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.9,
      mediaTypes: ["images"],
    });
    await handleResult(result);
  }, [handleResult]);

  const pickFromGallery = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Gallery Permission",
        "Gallery access is needed to add your clothing items.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.9,
      mediaTypes: ["images"],
    });
    await handleResult(result);
  }, [handleResult]);

  const reset = useCallback(() => {
    setImage(null);
  }, []);

  return { image, processing, takePhoto, pickFromGallery, reset };
}
