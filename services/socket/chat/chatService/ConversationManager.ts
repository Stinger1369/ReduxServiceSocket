import {ConnectionManager} from "./ConnectionManager";

export class ConversationManager {
  private connectionManager: ConnectionManager;

  constructor(connectionManager : ConnectionManager) {
    this.connectionManager = connectionManager;
    console.log("ConversationManager: Constructor called");
  }

  async joinPrivateConversation(otherUserId : string): Promise<void> {
    console.log("ConversationManager: joinPrivateConversation called, otherUserId:", otherUserId);
    try {
      await this.connectionManager.emit("joinPrivate", {otherUserId});
      console.log("ConversationManager: joinPrivateConversation successful");
    } catch (error) {
      if (error instanceof Error && error.message.includes("Conversation not found")) {
        console.log(`ConversationManager: Conversation not found with ${otherUserId}, proceeding with temporary conversation`);
        return;
      }
      console.error("ConversationManager: joinPrivateConversation failed:", error);
      throw error;
    }
  }

  async joinPublicConversation(groupId : string): Promise<void> {
    console.log("ConversationManager: joinPublicConversation called, groupId:", groupId);
    try {
      await this.connectionManager.emit("joinPublic", {groupId});
      console.log("ConversationManager: joinPublicConversation successful");
    } catch (error) {
      console.error("ConversationManager: joinPublicConversation failed:", error);
      throw error;
    }
  }
}
