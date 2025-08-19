import {Socket} from "socket.io-client";
import {ConnectionManager} from "./ConnectionManager";
import {MessageHandler} from "./MessageHandler";
import {ChatMessageDto, TypingEvent, PrivateMessagePayload, Dispatch} from "../chatTypes";

export class EventHandler {
  private connectionManager: ConnectionManager;
  private messageHandler: MessageHandler;
  private dispatch: Dispatch | null;
  private socket: Socket | null;
  private eventHandlersSet: boolean = false;
  private processedMessages: Set<string> = new Set();
  private currentConversationId: string | null = null;

  constructor(connectionManager : ConnectionManager, messageHandler : MessageHandler, dispatch : Dispatch | null) {
    this.connectionManager = connectionManager;
    this.messageHandler = messageHandler;
    this.dispatch = dispatch;
    this.socket = this.connectionManager.getSocket();
    console.log("EventHandler: Constructor called, socket initialized:", !!this.socket);
  }

  setupEventHandlers(currentConversationId : string | null = null): void {
    console.log("EventHandler: Setting up event handlers with currentConversationId:", currentConversationId);
    this.currentConversationId = currentConversationId;

    if (!this.connectionManager.isConnected()) {
      console.warn("EventHandler: Socket is not connected, skipping event handler setup");
      return;
    }

    this.socket = this.connectionManager.getSocket();
    if (!this.socket) {
      console.warn("EventHandler: Socket is not initialized, skipping event handler setup");
      return;
    }

    if (this.eventHandlersSet) {
      console.log("EventHandler: Cleaning up previous event handlers");
      this.socket.removeAllListeners();
      this.eventHandlersSet = false;
    }

    const state = this.connectionManager.getState();
    const currentUserId = state.userId;

    const handlePrivateMessage = (data : PrivateMessagePayload) => {
      console.log("EventHandler: privateMessage event received:", JSON.stringify(data));
      const messageId = data.message.messageId;
      if (!messageId) {
        console.error("EventHandler: Missing messageId in privateMessage event:", data);
        return;
      }
      if (this.processedMessages.has(messageId)) {
        console.log("EventHandler: Skipping duplicate privateMessage:", messageId);
        return;
      }
      this.processedMessages.add(messageId);

      const message: ChatMessageDto = {
        id: messageId,
        senderId: data.sender,
        senderEmail: data.senderEmail || "",
        firstName: data.firstName || "Unknown",
        lastName: data.lastName || "User",
        content: data.message.content,
        timestamp: new Date(data.message.timestamp || Date.now()),
        readBy: data.message.readBy || [data.sender],
        likes: data.message.likes || [],
        dislikes: data.message.dislikes || [],
        reactions: data.message.reactions || [],
        conversationId: `private:${ [data.sender, data.message.recipientId].sort().join(":")}`,
        recipientId: data.message.recipientId
      };
      if (!message.conversationId) {
        console.error("EventHandler: Cannot infer conversationId, message rejected:", message);
        if (this.dispatch) {
          this.dispatch({type: "chat/setError", payload: "Cannot infer conversationId for message"});
        }
        return;
      }
      if (this.dispatch) {
        this.dispatch({type: "chat/receiveMessage", payload: message});
        console.log("EventHandler: Dispatched receiveMessage:", JSON.stringify(message));
      }
    };

    const handleGroupMessage = (data : ChatMessageDto) => {
      console.log("EventHandler: groupMessage event received:", JSON.stringify(data));
      const messageId = data.id;
      if (!messageId) {
        console.error("EventHandler: Missing messageId in groupMessage event:", data);
        return;
      }
      if (this.processedMessages.has(messageId)) {
        console.log("EventHandler: Skipping duplicate groupMessage:", messageId);
        return;
      }
      this.processedMessages.add(messageId);

      const message: ChatMessageDto = {
        ...data,
        timestamp: new Date(data.timestamp || Date.now()),
        conversationId: data.conversationId || (
          data.groupId
          ? `group:${data.groupId}`
          : undefined),
        id: messageId,
        reactions: data.reactions || []
      };
      if (!message.conversationId) {
        console.error("EventHandler: Cannot infer conversationId, message rejected:", message);
        if (this.dispatch) {
          this.dispatch({type: "chat/setError", payload: "Cannot infer conversationId for message"});
        }
        return;
      }
      if (this.dispatch) {
        this.dispatch({type: "chat/receiveMessage", payload: message});
        console.log("EventHandler: Dispatched receiveMessage:", JSON.stringify(data));
      }
    };

    const handleTyping = (data : TypingEvent) => {
      console.log("EventHandler: typing event received:", JSON.stringify(data));
      if (!data.userId) {
        console.error("EventHandler: Invalid typing event, missing userId:", data);
        if (this.dispatch) {
          this.dispatch({type: "chat/setError", payload: "Invalid typing event: missing userId"});
        }
        return;
      }
      if (this.dispatch) {
        this.dispatch({
          type: "chat/setTypingStatus",
          payload: {
            userId: data.userId,
            firstName: data.firstName || "Unknown",
            isTyping: true,
            recipientId: data.recipientId,
            groupId: data.groupId
          }
        });
        console.log("EventHandler: Dispatched setTypingStatus:", JSON.stringify(data));
      }
    };

    const handleStopTyping = (data : TypingEvent) => {
      console.log("EventHandler: stopTyping event received:", JSON.stringify(data));
      if (!data.userId) {
        console.error("EventHandler: Invalid stopTyping event, missing userId:", data);
        if (this.dispatch) {
          this.dispatch({type: "chat/setError", payload: "Invalid stopTyping event: missing userId"});
        }
        return;
      }
      if (this.dispatch) {
        this.dispatch({
          type: "chat/setTypingStatus",
          payload: {
            userId: data.userId,
            firstName: data.firstName || "Unknown",
            isTyping: false,
            recipientId: data.recipientId,
            groupId: data.groupId
          }
        });
        console.log("EventHandler: Dispatched setTypingStatus (stopTyping):", JSON.stringify(data));
      }
    };

    const handleUnreadConversations = (conversationIds : string[]) => {
      console.log("EventHandler: unreadConversations event received:", conversationIds);
      if (!Array.isArray(conversationIds)) {
        console.error("EventHandler: Invalid unreadConversations event, not an array:", conversationIds);
        if (this.dispatch) {
          this.dispatch({type: "chat/setError", payload: "Invalid unreadConversations event: not an array"});
        }
        return;
      }
      if (this.dispatch) {
        this.dispatch({type: "chat/setUnreadConversations", payload: conversationIds});
        console.log("EventHandler: Dispatched setUnreadConversations:", conversationIds);
      }
    };

    const handleMessageRead = (data : {
      conversationId: string;
      messageId: string;
      userId: string;
    }) => {
      console.log("EventHandler: messageRead event received:", JSON.stringify(data));
      if (!data.conversationId || !data.messageId || !data.userId) {
        console.error("EventHandler: Invalid messageRead event, missing required fields:", data);
        if (this.dispatch) {
          this.dispatch({type: "chat/setError", payload: "Invalid messageRead event: missing required fields"});
        }
        return;
      }
      if (this.dispatch) {
        this.dispatch({type: "chat/messageRead", payload: data});
        console.log("EventHandler: Dispatched messageRead:", JSON.stringify(data));
      }
    };

    const handleMessageUnread = (data : {
      conversationId: string;
      messageId: string;
      userId: string;
    }) => {
      console.log("EventHandler: messageUnread event received:", JSON.stringify(data));
      if (!data.conversationId || !data.messageId || !data.userId) {
        console.error("EventHandler: Invalid messageUnread event, missing required fields:", data);
        if (this.dispatch) {
          this.dispatch({type: "chat/setError", payload: "Invalid messageUnread event: missing required fields"});
        }
        return;
      }
      if (this.dispatch) {
        this.dispatch({type: "chat/messageUnread", payload: data});
        console.log("EventHandler: Dispatched messageUnread:", JSON.stringify(data));
      }
    };

    const handleMessagesRead = (data : {
      conversationId: string;
      userId: string;
      messages: ChatMessageDto[];
    }) => {
      console.log("EventHandler: messagesRead event received:", JSON.stringify(data));
      if (!data.conversationId || !data.userId || !Array.isArray(data.messages)) {
        console.error("EventHandler: Invalid messagesRead event, missing required fields:", data);
        if (this.dispatch) {
          this.dispatch({type: "chat/setError", payload: "Invalid messagesRead event: missing required fields"});
        }
        return;
      }
      const processedMessages = data.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        reactions: msg.reactions || []
      }));
      if (this.dispatch) {
        this.dispatch({
          type: "chat/messagesRead",
          payload: {
            ...data,
            messages: processedMessages
          }
        });
        console.log("EventHandler: Dispatched messagesRead:", JSON.stringify(data));
      }
    };

   const handleMessageUpdated = (data: {
  conversationId: string;
  messageId: string;
  content: string;
  userId?: string; // Ajout de userId pour compatibilité avec le backend sécurisé
}) => {
  console.log("EventHandler: messageUpdated event received:", JSON.stringify(data));
  if (!data.conversationId || !data.messageId || !data.content) {
    console.error("EventHandler: Invalid messageUpdated event, missing required fields:", data);
    if (this.dispatch) {
      this.dispatch({type: 'chat/setError', payload: "Invalid messageUpdated event: missing required fields"});
    }
    return;
  }
  if (this.dispatch) {
    this.dispatch({type: 'chat/messageUpdated', payload: data});
    console.log("EventHandler: Dispatched messageUpdated:", JSON.stringify(data));
  }
};

   const handleMessageDeleted = (data: {
  conversationId: string;
  messageId: string;
  userId?: string; // Ajout de userId
}) => {
  console.log("EventHandler: messageDeleted event received:", JSON.stringify(data));
  if (!data.conversationId || !data.messageId) {
    console.error("EventHandler: Invalid messageDeleted event, missing required fields:", data);
    if (this.dispatch) {
      this.dispatch({type: 'chat/setError', payload: "Invalid messageDeleted event: missing required fields"});
    }
    return;
  }
  if (this.dispatch) {
    this.dispatch({type: 'chat/messageDeleted', payload: data});
    console.log("EventHandler: Dispatched messageDeleted:", JSON.stringify(data));
  }
};

    const handleMessageAction = (data : {
      messageId: string;
      userId: string
    }, event : string, actionType : "updateMessageLikes" | "updateMessageDislikes") => {
      console.log(`EventHandler: ${event} event received:`, JSON.stringify(data));
      if (!data.messageId || !data.userId) {
        console.error(`EventHandler: Invalid ${event} event, missing messageId or userId:`, data);
        if (this.dispatch) {
          this.dispatch({type: "chat/setError", payload: `Invalid ${event} event: missing required fields`});
        }
        return;
      }
      if (this.dispatch) {
        this.dispatch({
          type: actionType,
          payload: {
            messageId: data.messageId,
            userId: data.userId
          }
        });
        console.log(`EventHandler: Dispatched ${actionType}:`, JSON.stringify(data));
      }
    };

    const handleReaction = (data : {
      messageId: string;
      userId: string;
      emoji?: string
    }, event : string, add : boolean) => {
      console.log(`EventHandler: ${event} event received:`, JSON.stringify(data));
      if (!data.messageId || !data.userId || (add && !data.emoji)) {
        console.error(`EventHandler: Invalid ${event} event, missing required fields:`, data);
        if (this.dispatch) {
          this.dispatch({type: "chat/setError", payload: `Invalid ${event} event: missing required fields`});
        }
        return;
      }
      if (this.dispatch) {
        this.dispatch({
          type: add
            ? "chat/addReaction"
            : "chat/removeReaction",
          payload: {
            messageId: data.messageId,
            userId: data.userId,
            emoji: data.emoji || ""
          }
        });
        console.log(
          `EventHandler: Dispatched ${add
          ? "addReaction"
          : "removeReaction"}:`,
        JSON.stringify(data));
      }
    };

    const handleNewMessageNotification = async (data : {
      conversationId: string;
      messageId: string;
      senderId: string;
    }) => {
      console.log("EventHandler: newMessageNotification event received:", JSON.stringify(data));
      if (!data.conversationId || !data.messageId || !data.senderId) {
        console.error("EventHandler: Invalid newMessageNotification event, missing required fields:", data);
        if (this.dispatch) {
          this.dispatch({type: "chat/setError", payload: "Invalid newMessageNotification event: missing required fields"});
        }
        return;
      }
      if (this.processedMessages.has(data.messageId)) {
        console.log("EventHandler: Skipping duplicate newMessageNotification:", data.messageId);
        return;
      }
      if (this.dispatch) {
        try {
          const conversation = await import ("../../../chatApi/chatMethods").then((m) => m.getConversation(data.conversationId));
          const message = conversation.messages.find((msg) => msg.id === data.messageId);
          if (message) {
            const messagePayload: ChatMessageDto = {
              ...message,
              conversationId: data.conversationId,
              timestamp: new Date(message.timestamp),
              recipientId: conversation.participants.find((id) => id !== data.senderId)
            };
            this.processedMessages.add(messagePayload.id);
            this.dispatch({type: "chat/receiveMessage", payload: messagePayload});
            console.log("EventHandler: Dispatched receiveMessage for newMessageNotification:", JSON.stringify(messagePayload));
          } else {
            console.warn("EventHandler: Message not found in conversation:", data.messageId);
          }
        } catch (error) {
          console.error("EventHandler: Failed to fetch conversation for newMessageNotification:", error);
          if (this.dispatch) {
            this.dispatch({type: "chat/setError", payload: "Failed to fetch conversation for new message"});
          }
        }
      }
    };

    const handleError = (data : {
      message: string
    }) => {
      console.error("EventHandler: Server error:", data.message);
      if (this.dispatch) {
        this.dispatch({type: "chat/setError", payload: data.message});
        console.log("EventHandler: Dispatched setError:", data.message);
      }
    };

    const events = [
      {
        event: "privateMessage",
        handler: handlePrivateMessage
      }, {
        event: "groupMessage",
        handler: handleGroupMessage
      }, {
        event: "typing",
        handler: handleTyping
      }, {
        event: "stopTyping",
        handler: handleStopTyping
      }, {
        event: "unreadConversations",
        handler: handleUnreadConversations
      }, {
        event: "messageRead",
        handler: handleMessageRead
      }, {
        event: "messageUnread",
        handler: handleMessageUnread
      }, {
        event: "messagesRead",
        handler: handleMessagesRead
      }, {
        event: "messageUpdated",
        handler: handleMessageUpdated
      },{
        event: "privateMessageUpdated",
        handler: handleMessageUpdated
      },{
        event: "privateMessageDeleted",
        handler: handleMessageDeleted
      }, {
       event: "groupMessageUpdated",
       handler: handleMessageUpdated
       },{
        event: "groupMessageDeleted",
        handler: handleMessageDeleted
      }, {
        event: "privateMessageLiked",
        handler: (data : any) => handleMessageAction(data, "privateMessageLiked", "updateMessageLikes")
      }, {
        event: "groupMessageLiked",
        handler: (data : any) => handleMessageAction(data, "groupMessageLiked", "updateMessageLikes")
      }, {
        event: "privateMessageUnliked",
        handler: (data : any) => handleMessageAction(data, "privateMessageUnliked", "updateMessageLikes")
      }, {
        event: "groupMessageUnliked",
        handler: (data : any) => handleMessageAction(data, "groupMessageUnliked", "updateMessageLikes")
      }, {
        event: "privateMessageDisliked",
        handler: (data : any) => handleMessageAction(data, "privateMessageDisliked", "updateMessageDislikes")
      }, {
        event: "groupMessageDisliked",
        handler: (data : any) => handleMessageAction(data, "groupMessageDisliked", "updateMessageDislikes")
      }, {
        event: "privateMessageReactionAdded",
        handler: (data : any) => handleReaction(data, "privateMessageReactionAdded", true)
      }, {
        event: "groupMessageReactionAdded",
        handler: (data : any) => handleReaction(data, "groupMessageReactionAdded", true)
      }, {
        event: "privateMessageReactionRemoved",
        handler: (data : any) => handleReaction(data, "privateMessageReactionRemoved", false)
      }, {
        event: "groupMessageReactionRemoved",
        handler: (data : any) => handleReaction(data, "groupMessageReactionRemoved", false)
      }, {
        event: "newMessageNotification",
        handler: handleNewMessageNotification
      }, {
        event: "error",
        handler: handleError
      }
    ];

    events.forEach(({event, handler}) => {
      this.socket !.on(event, handler);
      console.log(`EventHandler: Registered event handler for ${event}`);
    });

    this.eventHandlersSet = true;

    setTimeout(() => {
      this.processedMessages.clear();
      console.log("EventHandler: Cleared processedMessages cache");
    }, 60000);
  }
}
