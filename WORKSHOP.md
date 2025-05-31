# 🍕 Workshop: Construye un Procesador de Pedidos con NestJS y Kafka

> **¡Bienvenido al workshop más delicioso! Vas a construir un procesador de pedidos de pizza desde cero.**

## 🎯 Objetivos del Workshop

Al finalizar este workshop, habrás aprendido a:
- ✅ Conectarte a Kafka desde NestJS
- ✅ Consumir mensajes de un topic
- ✅ Procesar pedidos de forma asíncrona
- ✅ Enviar notificaciones de completación
- ✅ Manejar errores y validaciones
- ✅ Implementar lógica de negocio real

---

## 🚀 Preparación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/pizza-ordering-system.git
cd pizza-ordering-system
```

### 2. Iniciar la infraestructura
```bash
# Iniciar todos los servicios EXCEPTO el processor
docker-compose up kafka zookeeper bff bff-consumer frontend kafka-ui -d
```

### 3. Verificar que todo funciona
- ✅ Frontend: http://localhost:3001
- ✅ Kafka UI: http://localhost:8080

---

## 📚 Ejercicios Paso a Paso

### **🔧 Ejercicio 1: Configuración de Kafka (5 min)**

**Objetivo**: Completar la configuración básica de Kafka

**Archivo**: `backend-processor/src/order.processor.workshop.ts`

**Instrucciones**:
1. Abrir el archivo del processor
2. Encontrar el comentario `// ===== EJERCICIO 1: CONFIGURACIÓN DE KAFKA =====`
3. Completar los valores faltantes:

```typescript
this.kafka = new Kafka({
  clientId: 'pizza-processor-nestjs', // COMPLETAR aquí
  brokers: ['kafka:29092'], // COMPLETAR aquí
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});
```

4. Completar el groupId del consumer:
```typescript
this.consumer = this.kafka.consumer({ 
  groupId: 'pizza-processor-group-nestjs', // COMPLETAR aquí
  allowAutoTopicCreation: true,
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
});
```

**💡 Pista**: El clientId identifica tu aplicación, y el groupId identifica tu grupo de consumidores.

---

### **🔌 Ejercicio 2: Conexiones (5 min)**

**Objetivo**: Conectar el producer y consumer a Kafka

**Instrucciones**:
1. Encontrar `// ===== EJERCICIO 2: CONEXIONES =====`
2. Descomenta y completa:

```typescript
// Conectar el producer
await this.producer.connect(); // COMPLETAR: método connect()

// Conectar el consumer  
await this.consumer.connect(); // COMPLETAR: método connect()
```

**🧪 Probar**: 
```bash
# En otra terminal
cd backend-processor
npm run build
npm run start:prod
```

**✅ Resultado esperado**: Deberías ver "Kafka Producer/Consumer connected successfully!"

---

### **📡 Ejercicio 3: Suscripción al Topic (5 min)**

**Objetivo**: Suscribirse al topic de pedidos

**Instrucciones**:
1. Encontrar `// ===== EJERCICIO 3: SUSCRIPCIÓN =====`
2. Completar la suscripción:

```typescript
await this.consumer.subscribe({ 
  topics: ['pizza.orders'], // COMPLETAR el nombre del topic
  fromBeginning: false 
});
```

**💡 Tip**: El topic 'pizza.orders' es donde llegan los pedidos desde el frontend.

---

### **🎧 Ejercicio 4: Consumir Mensajes (10 min)**

**Objetivo**: Configurar el processor para recibir mensajes

**Instrucciones**:
1. Encontrar `// ===== EJERCICIO 4: CONSUMIR MENSAJES =====`
2. Completar el consumer.run():

```typescript
await this.consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    await this.processOrder(topic, partition, message); // COMPLETAR nombre del método
  },
});
```

**🧪 Probar**: 
```bash
# Reiniciar el processor
npm run build && npm run start:prod
```

**✅ Resultado esperado**: "Pizza Backend Processor is ready to process orders!"

---

### **🍕 Ejercicio 5: Procesamiento de Pedidos (15 min)**

**Objetivo**: Implementar la lógica principal del processor

**Instrucciones**:
1. Encontrar `// ===== EJERCICIO 5: PROCESAMIENTO DE PEDIDOS =====`
2. Completar el parsing del mensaje:

```typescript
// Parsear el mensaje JSON
const data = JSON.parse(message.value.toString()); // COMPLETAR
const { orderId, quantity, timestamp } = data; // COMPLETAR
```

3. Completar los logs:
```typescript
console.log(`Data: ${JSON.stringify(data)}`); // COMPLETAR
console.log(`🍕 Processing order ${orderId}...`); // COMPLETAR
console.log(`   📦 Quantity: ${quantity} pizzas`); // COMPLETAR
console.log(`   ⏱️  Processing time: ${quantity} pizzas × 2 seconds = ${quantity * 2} seconds total`);
```

**🧪 Probar**: 
- Ve a http://localhost:3001
- Haz un pedido
- Revisa los logs del processor

**✅ Resultado esperado**: Deberías ver los datos del pedido en los logs.

---

### **⏱️ Ejercicio 6: Simulación de Tiempo (10 min)**

**Objetivo**: Simular el tiempo de preparación de las pizzas

**Instrucciones**:
1. Encontrar `// ===== EJERCICIO 6: SIMULACIÓN DE TIEMPO =====`
2. Completar el cálculo de tiempo:

```typescript
// Calcular tiempo de procesamiento (2 segundos por pizza)
const processingTimeMs = quantity * 2000; // COMPLETAR
await this.sleep(processingTimeMs); // COMPLETAR
```

**🧪 Probar**: 
- Haz un pedido de 3 pizzas
- Debería tomar 6 segundos en procesar

---

### **📨 Ejercicio 7: Mensaje de Completación (10 min)**

**Objetivo**: Crear el mensaje de pedido completado

**Instrucciones**:
1. Encontrar `// ===== EJERCICIO 7: MENSAJE DE COMPLETACIÓN =====`
2. Completar el objeto de completación:

```typescript
const completionMessage = {
  orderId: orderId, // COMPLETAR
  status: 'completed', // COMPLETAR
  processedAt: new Date().toISOString(),
  originalQuantity: quantity // COMPLETAR
};
```

---

### **🚀 Ejercicio 8: Enviar Completación (15 min)**

**Objetivo**: Enviar el mensaje de completación a Kafka

**Instrucciones**:
1. Encontrar `// ===== EJERCICIO 8: ENVIAR COMPLETACIÓN =====`
2. Completar el envío:

```typescript
await this.producer.send({
  topic: 'order.completed', // COMPLETAR
  messages: [
    {
      key: orderId, // COMPLETAR
      value: JSON.stringify(completionMessage) // COMPLETAR
    }
  ]
});
```

3. Completar el log final:
```typescript
console.log(`   ${JSON.stringify(completionMessage)}`); // COMPLETAR
```

**🧪 Probar el Ciclo Completo**: 
1. Ve a http://localhost:3001
2. Haz un pedido
3. Espera a que se procese
4. ¡Deberías ver una notificación en el frontend!

**✅ Resultado esperado**: Ciclo completo funcionando con notificación toast.

---

## 🏆 Ejercicios Bonus (Para los Rápidos)

### **🛡️ Bonus 1: Validación de Pedidos (15 min)**

**Objetivo**: Agregar validaciones de negocio

**Instrucciones**:
1. Implementar el método `validateOrder()`:

```typescript
private validateOrder(order: any): boolean {
  // Validar que quantity > 0 y < 10
  if (!order.quantity || order.quantity <= 0 || order.quantity > 10) {
    return false;
  }
  
  // Validar que orderId existe
  if (!order.orderId || order.orderId.trim() === '') {
    return false;
  }
  
  return true;
}
```

2. Usar la validación en `processOrder()`:
```typescript
// Al inicio del método processOrder()
if (!this.validateOrder(data)) {
  console.error('❌ Invalid order:', data);
  await this.sendError(data.orderId || 'unknown', 'Invalid order data');
  return;
}
```

### **💰 Bonus 2: Cálculo de Precio (10 min)**

**Objetivo**: Calcular el precio total del pedido

**Instrucciones**:
1. Implementar `calculatePrice()`:

```typescript
private calculatePrice(quantity: number): number {
  const pricePerPizza = 12.99;
  let total = quantity * pricePerPizza;
  
  // Descuento: 10% si quantity >= 5
  if (quantity >= 5) {
    total = total * 0.9; // 10% descuento
  }
  
  return Math.round(total * 100) / 100; // Redondear a 2 decimales
}
```

2. Agregar el precio al mensaje de completación:
```typescript
const completionMessage = {
  orderId: orderId,
  status: 'completed',
  processedAt: new Date().toISOString(),
  originalQuantity: quantity,
  totalPrice: this.calculatePrice(quantity) // AGREGAR
};
```

### **⚠️ Bonus 3: Manejo de Errores (15 min)**

**Objetivo**: Implementar notificaciones de error

**Instrucciones**:
1. Implementar `sendError()`:

```typescript
private async sendError(orderId: string, error: string) {
  const errorMessage = {
    orderId: orderId,
    status: 'error',
    error: error,
    timestamp: new Date().toISOString()
  };
  
  try {
    await this.producer.send({
      topic: 'order.errors',
      messages: [
        {
          key: orderId,
          value: JSON.stringify(errorMessage)
        }
      ]
    });
    console.log('🚨 Error sent to order.errors topic:', errorMessage);
  } catch (err) {
    console.error('❌ Failed to send error message:', err);
  }
}
```

2. Agregar try/catch en `processOrder()`:
```typescript
try {
  // Todo el código de procesamiento aquí
} catch (error) {
  console.error(`❌ Error processing order ${orderId}:`, error);
  await this.sendError(orderId, error.message);
}
```

---

## 🧪 Testing y Verificación

### **Verificar que Todo Funciona**

1. **Test Básico**:
   ```bash
   # Terminal 1: Ver logs del processor
   docker logs pizza-ordering-system-backend-processor-1 --follow
   
   # Terminal 2: Hacer pedido
   curl -X POST http://localhost:3000/orders \
     -H "Content-Type: application/json" \
     -d '{"quantity": 2}'
   ```

2. **Test con Frontend**:
   - Ve a http://localhost:3001
   - Haz varios pedidos con diferentes cantidades
   - Verifica que lleguen las notificaciones

3. **Verificar Kafka UI**:
   - Ve a http://localhost:8080
   - Revisa los topics `pizza.orders` y `order.completed`
   - Verifica que los mensajes estén llegando

---

## 🎓 ¿Qué Aprendiste?

### **Conceptos Técnicos**:
- 🏗️ **Arquitectura de Microservicios**: Cómo los servicios se comunican
- 📨 **Message Brokers**: Kafka como sistema de mensajería
- 🔄 **Async Processing**: Procesamiento asíncrono de tareas
- 🧪 **Event-Driven Architecture**: Arquitectura basada en eventos

### **Tecnologías**:
- ⚡ **NestJS**: Framework profesional de Node.js
- 📊 **KafkaJS**: Cliente de Kafka para JavaScript
- 🐳 **Docker**: Containerización de aplicaciones
- 🎯 **TypeScript**: JavaScript tipado para mayor robustez

### **Patrones de Diseño**:
- 📤 **Producer/Consumer**: Patrón de productor y consumidor
- 🔄 **Event Sourcing**: Comunicación basada en eventos
- 🛡️ **Error Handling**: Manejo robusto de errores
- ⚡ **Dependency Injection**: Inyección de dependencias

---

## 🚀 Próximos Pasos

### **Continúa Aprendiendo**:
1. 🔍 **Explora el código completo** en las otras carpetas
2. 🎨 **Modifica el frontend** para mostrar precios
3. 📊 **Agrega métricas** de rendimiento
4. 🧪 **Implementa tests** unitarios
5. 🚀 **Despliega a la nube** (AWS, GCP, Azure)

### **Recursos Adicionales**:
- 📖 [Documentación de NestJS](https://docs.nestjs.com/)
- 📖 [Guía de Kafka](https://kafka.apache.org/documentation/)
- 📖 [Patrones de Microservicios](https://microservices.io/patterns/)

---

## 🏆 ¡Felicitaciones!

¡Has completado el workshop! Ahora tienes:

- ✅ Un sistema de procesamiento de pedidos funcional
- ✅ Conocimiento práctico de Kafka y NestJS
- ✅ Experiencia con arquitectura de microservicios
- ✅ Un proyecto genial para tu portafolio

**¡Comparte tu experiencia en redes sociales! 📱**

---

<div align="center">
  <p>🍕 <strong>¡Disfruta tu pizza recién programada!</strong> 🍕</p>
  <p><em>Made with ❤️ for developers who love to learn</em></p>
</div> 