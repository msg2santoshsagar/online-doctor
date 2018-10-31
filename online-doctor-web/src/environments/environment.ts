// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

const BASE_URL = "http://localhost:3000";
//const BASE_URL = "http://192.168.43.15:3000";

export const environment = {
  production: false,
  CURRENT_USER_END_POINT: BASE_URL + "/api/users/currentUser",
  LOGIN_END_POINT: BASE_URL + "/api/users/login",
  LOGOUT_END_POINT: BASE_URL + "/api/users/logout",
  MESSAGE_LIST_END_POINT: BASE_URL + "/api/messages/messageList",
  MESSAGE_LIST_BY_USER_END_POINT: BASE_URL + "/api/messages/messageListByUser",
  ANSWER_SELECTED_END_POINT: BASE_URL + "/api/messages/answerSelected",
  CONSULATATION_PACKAGE_PURCHASED_END_POINT: BASE_URL + "/api/messages/consultationPacagePurchased"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
