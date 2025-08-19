import {SocketConnection} from "../../socketService";
import {Dispatch} from "./chatTypes";
import {ConnectionManager} from "./chatService/ConnectionManager";
import {ConversationManager} from "./chatService/ConversationManager";
import {MessageHandler} from "./chatService/MessageHandler";
import {EventHandler} from "./chatService/EventHandler";

export class ChatService {
  private connectionManager: ConnectionManager;
  private conversationManager: ConversationManager;
  private messageHandler: MessageHandler;
  private eventHandler: EventHandler;

  constructor(connection : SocketConnection, dispatch : Dispatch | null) {
    this.connectionManager = new ConnectionManager(connection, dispatch);
    this.messageHandler = new MessageHandler(this.connectionManager);
    this.conversationManager = new ConversationManager(this.connectionManager);
    this.eventHandler = new EventHandler(this.connectionManager, this.messageHandler, dispatch);
    console.log("ChatService: Constructor called, initialized managers");
  }

  async joinPrivateConversation(otherUserId : string): Promise<void> {
    return this.conversationManager.joinPrivateConversation(otherUserId);
  }

  async joinPublicConversation(groupId : string): Promise<void> {
    return this.conversationManager.joinPublicConversation(groupId);
  }

  async sendMessage(recipientId : string | undefined, groupId : string | undefined, content : string): Promise<void> {
    return this.messageHandler.sendMessage(recipientId, groupId, content);
  }

  async sendTyping(recipientId : string | undefined, groupId : string | undefined): Promise<void> {
    return this.messageHandler.sendTyping(recipientId, groupId);
  }

  async sendStopTyping(recipientId : string | undefined, groupId : string | undefined): Promise<void> {
    return this.messageHandler.sendStopTyping(recipientId, groupId);
  }

  async likeMessage(messageId : string, conversationId : string): Promise<void> {
    return this.messageHandler.likeMessage(messageId, conversationId);
  }

  async unlikeMessage(messageId : string, conversationId : string): Promise<void> {
    return this.messageHandler.unlikeMessage(messageId, conversationId);
  }

  async dislikeMessage(messageId : string, conversationId : string): Promise<void> {
    return this.messageHandler.dislikeMessage(messageId, conversationId);
  }

  async deleteMessage(messageId : string, conversationId : string): Promise<void> {
    return this.messageHandler.deleteMessage(messageId, conversationId);
  }

  async updateMessage(messageId : string, conversationId : string, content : string): Promise<void> {
    return this.messageHandler.updateMessage(messageId, conversationId, content);
  }

  async deleteConversation(conversationId : string): Promise<void> {
    return this.messageHandler.deleteConversation(conversationId);
  }

  async addReaction(messageId : string, conversationId : string, emoji : string): Promise<void> {
    return this.messageHandler.addReaction(messageId, conversationId, emoji);
  }

  async removeReaction(messageId : string, conversationId : string, emoji : string): Promise<void> {
    return this.messageHandler.removeReaction(messageId, conversationId, emoji);
  }

  async markMessagesAsRead(conversationId : string, userId : string): Promise<void> {
    return this.messageHandler.markMessagesAsRead(conversationId, userId);
  }

  async markMessageAsUnread(conversationId : string, messageId : string, userId : string): Promise<void> {
    return this.messageHandler.markMessageAsUnread(conversationId, messageId, userId);
  }

  setupEventHandlers(conversationId? : string): void {
    this.eventHandler.setupEventHandlers(conversationId);
  }
}
