import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrderController } from './order/order.controller';
import { OrderGateway } from './order/order.gateway';
import { OrderService } from './order/order.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'pizza-bff-producer',
            brokers: ['kafka:29092'],
          },
          producer: {
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderGateway],
})
export class AppModule {} 