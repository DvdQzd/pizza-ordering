import { Controller, Post, Body } from '@nestjs/common';
import { OrderService } from './order.service';

interface OrderDto {
  quantity: number;
}

@Controller('api')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('order-pizza')
  async orderPizza(@Body() orderDto: OrderDto) {
    console.log(`[OrderController] Received order request for ${orderDto.quantity} pizzas`);
    return this.orderService.createOrder(orderDto.quantity);
  }
} 