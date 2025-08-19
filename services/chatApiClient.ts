import * as httpMethods from "./chatApi/httpMethods";
import * as userMethods from "./chatApi/userMethods";
import * as likeDislikeMethods from "./chatApi/likeDislikeMethods";
import * as postMethods from "./chatApi/postMethods";
import * as commentMethods from "./chatApi/commentMethods";
import * as chatMethods from "./chatApi/chatMethods";
import * as friendMethods from "./chatApi/friendMethods";
import * as notificationMethods from "./chatApi/notificationMethods";

const chatApiClient = {
  ...httpMethods,
  ...userMethods,
  ...likeDislikeMethods,
  ...postMethods,
  ...commentMethods,
  ...chatMethods,
  ...friendMethods,
  ...notificationMethods
};

export default chatApiClient;
