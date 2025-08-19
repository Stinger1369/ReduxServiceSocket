import {ConnectionManager} from "./ConnectionManager";
import {ChatMessageDto} from "../chatTypes";

export class MessageHandler {
  private connectionManager: ConnectionManager;

  constructor(connectionManager : ConnectionManager) {
    this.connectionManager = connectionManager;
    console.log("MessageHandler: Constructor called");
  }

  async sendMessage(recipientId : string | undefined, groupId : string | undefined, content : string): Promise<void> {
    console.log("MessageHandler: sendMessage called, recipientId:", recipientId, "groupId:", groupId, "content:", content);
    const state = this.connectionManager.getState();
    if (!state.userId) {
      console.error("MessageHandler: UserId is missing, state:", state);
      throw new Error("UserId is missing");
    }
    const payload: any = {
      event: groupId
        ? "groupMessage"
        : "privateMessage",
      sender: state.userId,
      senderEmail: state.email,
      firstName: state.firstName,
      lastName: state.lastName,
      message: {
        recipientId,
        groupId,
        content
      }
    };
    try {
      console.log(
        "MessageHandler: Sending", groupId
        ? "groupMessage"
        : "privateMessage",
      ", payload:",
      JSON.stringify(payload));
      await this.connectionManager.emit(
        groupId
        ? "groupMessage"
        : "privateMessage",
      payload);
      console.log("MessageHandler: Message sent successfully");
    } catch (error) {
      console.error("MessageHandler: Failed to send message:", error);
      throw error;
    }
  }

  async sendTyping(recipientId : string | undefined, groupId : string | undefined): Promise<void> {
    console.log("MessageHandler: sendTyping called, recipientId:", recipientId, "groupId:", groupId);
    const state = this.connectionManager.getState();
    if (!state.userId) {
      console.error("MessageHandler: UserId is missing, state:", state);
      throw new Error("UserId is missing");
    }
    try {
      await this.connectionManager.emit("typing", {recipientId, groupId});
      console.log("MessageHandler: Typing event sent successfully");
    } catch (error) {
      console.error("MessageHandler: Failed to send typing event:", error);
      throw error;
    }
  }

  async sendStopTyping(recipientId : string | undefined, groupId : string | undefined): Promise<void> {
    console.log("MessageHandler: sendStopTyping called, recipientId:", recipientId, "groupId:", groupId);
    const state = this.connectionManager.getState();
    if (!state.userId) {
      console.error("MessageHandler: UserId is missing, state:", state);
      throw new Error("UserId is missing");
    }
    try {
      await this.connectionManager.emit("stopTyping", {recipientId, groupId});
      console.log("MessageHandler: StopTyping event sent successfully");
    } catch (error) {
      console.error("MessageHandler: Failed to send stopTyping event:", error);
      throw error;
    }
  }

  async likeMessage(messageId : string, conversationId : string): Promise<void> {
    console.log("MessageHandler: likeMessage called, messageId:", messageId, "conversationId:", conversationId);
    const state = this.connectionManager.getState();
    if (!state.userId) {
      console.error("MessageHandler: UserId is missing, state:", state);
      throw new Error("UserId is missing");
    }
    try {
      await this.connectionManager.emit("likeMessage", {messageId, conversationId});
      console.log("MessageHandler: Like message sent successfully");
    } catch (error) {
      console.error("MessageHandler: Failed to like message:", error);
      throw error;
    }
  }

  async unlikeMessage(messageId : string, conversationId : string): Promise<void> {
    console.log("MessageHandler: unlikeMessage called, messageId:", messageId, "conversationId:", conversationId);
    const state = this.connectionManager.getState();
    if (!state.userId) {
      console.error("MessageHandler: UserId is missing, state:", state);
      throw new Error("UserId is missing");
    }
    try {
      await this.connectionManager.emit("unlikeMessage", {messageId, conversationId});
      console.log("MessageHandler: Unlike message sent successfully");
    } catch (error) {
      console.error("MessageHandler: Failed to unlike message:", error);
      throw error;
    }
  }

  async dislikeMessage(messageId : string, conversationId : string): Promise<void> {
    console.log("MessageHandler: dislikeMessage called, messageId:", messageId, "conversationId:", conversationId);
    const state = this.connectionManager.getState();
    if (!state.userId) {
      console.error("MessageHandler: UserId is missing, state:", state);
      throw new Error("UserId is missing");
    }
    try {
      await this.connectionManager.emit("dislikeMessage", {messageId, conversationId});
      console.log("MessageHandler: Dislike message sent successfully");
    } catch (error) {
      console.error("MessageHandler: Failed to dislike message:", error);
      throw error;
    }
  }

 async deleteMessage(messageId: string, conversationId: string): Promise<void> {
  console.log("MessageHandler: deleteMessage called, messageId:", messageId, "conversationId:", conversationId);
  const state = this.connectionManager.getState();
  if (!state.userId) {
    console.error("MessageHandler: UserId is missing, state:", state);
    throw new Error("UserId is missing");
  }
  try {
    await this.connectionManager.emit("deleteMessage", { messageId, conversationId, userId: state.userId });
    console.log("MessageHandler: Delete message sent successfully");
  } catch (error) {
    console.error("MessageHandler: Failed to delete message:", error);
    throw error;
  }
}

  async updateMessage(messageId : string, conversationId : string, content : string): Promise<void> {
    console.log("MessageHandler: updateMessage called, messageId:", messageId, "conversationId:", conversationId, "content:", content);
    const state = this.connectionManager.getState();
    if (!state.userId) {
      console.error("MessageHandler: UserId is missing, state:", state);
      throw new Error("UserId is missing");
    }
    try {
      await this.connectionManager.emit("updateMessage", {messageId, conversationId, content});
      console.log("MessageHandler: Update message sent successfully");
    } catch (error) {
      console.error("MessageHandler: Failed to update message:", error);
      throw error;
    }
  }

  async deleteConversation(conversationId : string): Promise<void> {
    console.log("MessageHandler: deleteConversation called, conversationId:", conversationId);
    const state = this.connectionManager.getState();
    if (!state.userId) {
      console.error("MessageHandler: UserId is missing, state:", state);
      throw new Error("UserId is missing");
    }
    try {
      await this.connectionManager.emit("deleteConversation", {conversationId});
      console.log("MessageHandler: Delete conversation sent successfully");
    } catch (error) {
      console.error("MessageHandler: Failed to delete conversation:", error);
      throw error;
    }
  }

  async addReaction(messageId : string, conversationId : string, emoji : string): Promise<void> {
    console.log("MessageHandler: addReaction called, messageId:", messageId, "conversationId:", conversationId, "emoji:", emoji);
    const state = this.connectionManager.getState();
    if (!state.userId) {
      console.error("MessageHandler: UserId is missing, state:", state);
      throw new Error("UserId is missing");
    }
    try {
      await this.connectionManager.emit("addReaction", {messageId, conversationId, emoji});
      console.log("MessageHandler: Add reaction sent successfully");
    } catch (error) {
      console.error("MessageHandler: Failed to add reaction:", error);
      throw error;
    }
  }

  async removeReaction(messageId : string, conversationId : string, emoji : string): Promise<void> {
    console.log("MessageHandler: removeReaction called, messageId:", messageId, "conversationId:", conversationId, "emoji:", emoji);
    const state = this.connectionManager.getState();
    if (!state.userId) {
      console.error("MessageHandler: UserId is missing, state:", state);
      throw new Error("UserId is missing");
    }
    try {
      await this.connectionManager.emit("removeReaction", {messageId, conversationId, emoji});
      console.log("MessageHandler: Remove reaction sent successfully");
    } catch (error) {
      console.error("MessageHandler: Failed to remove reaction:", error);
      throw error;
    }
  }

  async markMessagesAsRead(conversationId : string, userId : string): Promise<void> {
    console.log("MessageHandler: markMessagesAsRead called, conversationId:", conversationId, "userId:", userId);
    const state = this.connectionManager.getState();
    if (!state.userId) {
      console.error("MessageHandler: UserId is missing, state:", state);
      throw new Error("UserId is missing");
    }
    try {
      await this.connectionManager.emit("markMessagesAsRead", {conversationId, userId});
      console.log("MessageHandler: markMessagesAsRead sent successfully");
    } catch (error) {
      console.error("MessageHandler: Failed to mark messages as read:", error);
      throw error;
    }
  }

  async markMessageAsUnread(conversationId : string, messageId : string, userId : string): Promise<void> {
    console.log("MessageHandler: markMessageAsUnread called, conversationId:", conversationId, "messageId:", messageId, "userId:", userId);
    const state = this.connectionManager.getState();
    if (!state.userId) {
      console.error("MessageHandler: UserId is missing, state:", state);
      throw new Error("UserId is missing");
    }
    try {
      await this.connectionManager.emit("markMessageAsUnread", {conversationId, messageId, userId});
      console.log("MessageHandler: markMessageAsUnread sent successfully");
    } catch (error) {
      console.error("MessageHandler: Failed to mark message as unread:", error);
      throw error;
    }
  }
}
