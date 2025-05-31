import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

interface OrderCompletedEvent {
  orderId: string;
  status: string;
  message: string;
  processedAt: string;
  quantity: number;
  timestamp: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class OrderGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor() {
    console.log('[OrderGateway] Initialized');
  }

  async onModuleInit() {
    console.log('[OrderGateway] Ready to handle WebSocket connections');
  }

  // Handle WebSocket client connections
  handleConnection(client: Socket) {
    console.log(`🔌 [OrderGateway] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔌 [OrderGateway] Client disconnected: ${client.id}`);
  }

  // Handle incoming completion notifications from the separate Kafka consumer
  @SubscribeMessage('order-completed')
  handleOrderCompleted(client: Socket, orderUpdate: OrderCompletedEvent) {
    console.log('🎉 [OrderGateway] Received order completion from Kafka consumer:', JSON.stringify(orderUpdate, null, 2));
    
    // Broadcast to all connected WebSocket clients
    this.server.emit('order-update', orderUpdate);
    console.log(`📡 [OrderGateway] Broadcasted order completion to all WebSocket clients`);

    // Also emit specific event for this order
    this.server.emit(`order-${orderUpdate.orderId}-completed`, orderUpdate);
    console.log(`🎯 [OrderGateway] Sent specific notification for order ${orderUpdate.orderId}`);

    // Confirm to the sender
    client.emit('notification-sent', { 
      orderId: orderUpdate.orderId, 
      status: 'broadcasted',
      timestamp: new Date().toISOString()
    });
  }

  // Method to broadcast a message (can be called from services)
  broadcastOrderUpdate(orderUpdate: OrderCompletedEvent) {
    this.server.emit('order-update', orderUpdate);
    this.server.emit(`order-${orderUpdate.orderId}-completed`, orderUpdate);
    console.log(`📡 [OrderGateway] Broadcasted order update for ${orderUpdate.orderId}`);
  }
} 