# Pizza Backend Processor

Este directorio contiene **dos versiones** del procesador de órdenes de pizza:

## 🚀 **Versiones Disponibles**

### 1. **Node.js Simple** (Por defecto - ✅ Funciona)
- Archivo: `index.js`
- Implementación directa con KafkaJS
- **Comando**: `npm start`

### 2. **NestJS** (Reparado - 🛠️ Recién arreglado)
- Directorio: `src/`
- Framework NestJS con microservicios
- **Comando**: `npm run start:nestjs`

## 📋 **Comandos Disponibles**

```bash
# Construir TypeScript (solo para NestJS)
npm run build

# Ejecutar versión Node.js simple
npm start

# Ejecutar versión NestJS
npm run start:nestjs

# Solo compilar para producción
npm run start:prod
```

## 🐳 **Docker Compose**

### Usar Node.js Simple (Default):
```bash
docker-compose up backend-processor
```

### Usar NestJS:
```bash
# Parar el simple primero
docker-compose stop backend-processor

# Ejecutar NestJS
docker-compose --profile nestjs up backend-processor-nestjs
```

## 🔧 **Configuración Kafka**

### Node.js Simple:
- Consumer Group: `pizza-processor-group`
- Client ID: `pizza-processor`

### NestJS:
- Consumer Group: `pizza-processor-group-nestjs`
- Client ID: `pizza-processor-nestjs`

## 📊 **Diferencias**

| Característica | Node.js Simple | NestJS |
|---|---|---|
| **Complejidad** | Básica | Avanzada |
| **Dependencias** | Solo KafkaJS | NestJS + KafkaJS |
| **Configuración** | Directa | Decoradores |
| **Escalabilidad** | Limitada | Alta |
| **Debugging** | Manual | Framework integrado |

## 🔍 **Estado Actual**

- ✅ **Node.js Simple**: Funcionando perfectamente
- 🛠️ **NestJS**: Recién reparado, listo para pruebas

## 📝 **Logs de Ejemplo**

Ambas versiones muestran logs similares:

```
=== RECEIVED PIZZA ORDER ===
Topic: pizza.orders
Partition: 0
Offset: 42
Data: {"orderId":"abc123","quantity":3}
============================
🍕 Processing order abc123...
⏱️  3 pizzas × 2 seconds = 6 seconds total
✅ Order completed and sent to order.completed topic
🎉 Cycle completed!
``` 