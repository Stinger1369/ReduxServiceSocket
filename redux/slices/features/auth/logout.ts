import {createAsyncThunk} from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {PURGE} from "redux-persist";
import i18n from "i18next";
import {socketService} from "../../../../services/socketService";
import {NavigationProp} from "@react-navigation/native";
import {RootStackParamList} from "../../../../navigation/types";

interface LogoutArgs {
  navigation: NavigationProp<RootStackParamList>;
}

interface ErrorResponse {
  error: string;
  action: string;
}

// Logout thunk
export const logout = createAsyncThunk < void,
  LogoutArgs, {rejectValue: ErrorResponse} > ("auth/logout", async ({
    navigation
  }, {rejectWithValue, dispatch}) => {
    try {
      // Disconnect WebSocket
      socketService.disconnect();
      console.log("logout: WebSocket disconnected");

      // Clear AsyncStorage
      await Promise.all([AsyncStorage.removeItem("token"), AsyncStorage.removeItem("user"), AsyncStorage.removeItem("preferredLanguage")]);
      console.log("logout: AsyncStorage cleared successfully");

      // Reset language
      try {
        if (i18n.isInitialized) {
          await i18n.changeLanguage("en");
          console.log("logout: Language reset to en");
        } else {
          console.warn("logout: i18n not initialized, skipping language reset");
        }
      } catch (i18nError) {
        console.error("logout: Failed to reset language:", i18nError);
      }

      // Dispatch PURGE to reset Redux state
      dispatch({
        type: PURGE,
        key: "root",
        result: () => null
      });

      // Navigate to IntroScreen
      navigation.navigate("AuthStack", {screen: "Intro"});
      console.log("logout: Navigated to IntroScreen");

      return;
    } catch (error) {
      console.error("logout: Failed to clear AsyncStorage:", error);
      return rejectWithValue({error: "Failed to logout", action: "Veuillez réessayer."});
    }
  });

// Extra reducers pour logout
export const addLogoutExtraReducers = (builder : any) => {
  builder.addCase(logout.pending, (state : any) => {
    state.loading = true;
    state.error = null;
    console.log("logout: Logout pending");
  }).addCase(logout.fulfilled, (state : any) => {
    state.isAuthenticated = false;
    state.token = null;
    state.user = null;
    state.preferredLanguage = "en";
    state.error = null;
    state.errorAction = null;
    state.passwordChangeSuccess = false;
    state.isVerified = false;
    state.verificationSuccess = false;
    state.resendCooldown = 0;
    state.resetCode = null;
    state.loading = false;
    console.log("logout: Logout fulfilled");
  }).addCase(logout.rejected, (state : any, action : PayloadAction<ErrorResponse>) => {
    state.loading = false;
    state.error = action.payload.error;
    state.errorAction = action.payload.action;
    console.log("logout: Logout rejected, error:", action.payload.error);
  });
};
