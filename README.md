# 🍕 Sistema de Pedidos de Pizza

> **Un sistema completo de pedidos de pizza con arquitectura moderna y notificaciones en tiempo real**

![Estado del Sistema](https://img.shields.io/badge/Estado-Funcional-brightgreen)
![Docker](https://img.shields.io/badge/Docker-Requerido-blue)
![Licencia](https://img.shields.io/badge/Licencia-MIT-green)

---

## 📋 ¿Qué es este proyecto?

Este es un **sistema completo de pedidos de pizza** que simula una pizzería real. Cuando haces un pedido desde la página web, el sistema:

- ✅ Recibe tu pedido en tiempo real
- ⏱️ Procesa cada pizza (2 segundos por pizza)
- 📱 Te notifica cuando tu pedido está listo
- 🎨 Todo con una interfaz moderna y oscura

---

## 🎯 ¿Para quién es este proyecto?

- 👨‍💻 **Desarrolladores principiantes** que quieren aprender sobre microservicios
- 🎓 **Estudiantes** de programación web y arquitectura de software
- 🚀 **Personas que quieren ver un proyecto completo funcionando**

---

## 🛠️ ¿Qué necesitas para empezar?

### Requisitos Previos

Solo necesitas tener instalado **Docker** en tu computadora:

#### 🪟 Windows
1. Descargar [Docker Desktop para Windows](https://docs.docker.com/desktop/install/windows-install/)
2. Instalarlo y reiniciar tu PC
3. Abrir Docker Desktop

#### 🍎 Mac
1. Descargar [Docker Desktop para Mac](https://docs.docker.com/desktop/install/mac-install/)
2. Instalarlo y abrirlo

#### 🐧 Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose
sudo usermod -aG docker $USER
```

### ✅ Verificar que Docker funciona
```bash
docker --version
docker-compose --version
```

---

## 🚀 Instalación Súper Fácil

### Paso 1: Descargar el proyecto
```bash
# Opción A: Con Git (recomendado)
git clone https://github.com/tu-usuario/pizza-ordering-system.git
cd pizza-ordering-system

# Opción B: Descargar ZIP
# Descarga el ZIP desde GitHub y descomprímelo
```

### Paso 2: Iniciar todo el sistema
```bash
# Un solo comando para iniciar todo 🚀
docker-compose up --build
```

**¡Eso es todo!** 🎉

---

## 🎮 ¿Cómo usar el sistema?

### 1. Esperar a que todo se inicie
Verás mensajes como estos (es normal que tome 1-2 minutos):
```
✅ Kafka Producer connected successfully!
✅ Kafka Consumer connected successfully!
🚀 Pizza Backend Processor is ready to process orders!
```

### 2. Abrir la aplicación
- **Página principal**: http://localhost:3001
- **Panel de Kafka**: http://localhost:8080 (opcional, para ver mensajes)

### 3. Hacer un pedido
1. Ve a http://localhost:3001
2. Selecciona la cantidad de pizzas
3. Haz clic en "Ordenar Pizza"
4. ¡Verás tu pedido procesándose en tiempo real!

---

## 🏗️ ¿Cómo funciona por dentro?

```
🌐 Frontend          📡 Backend           🔄 Procesador        📬 Notificaciones
(Página Web)    →    (Servidor)     →     (Cocina)       →     (Tu Pantalla)
   React              NestJS              NestJS              WebSocket
   
   3001               3000                Kafka               Tiempo Real
```

### Componentes del Sistema

| Servicio | ¿Qué hace? | Puerto |
|----------|------------|--------|
| 🌐 **Frontend** | Página web donde haces pedidos | 3001 |
| 📡 **BFF** | Servidor que recibe tus pedidos | 3000 |
| 🔄 **Procesador** | "Cocina" que prepara las pizzas | - |
| 📬 **Kafka** | Sistema de mensajes interno | 9092 |
| 🎛️ **Kafka UI** | Panel para ver mensajes | 8080 |

---

## 📱 Características Principales

### ✨ Frontend Moderno
- 🌙 **Tema oscuro** elegante y profesional
- 📱 **Responsive** - se adapta a móvil y desktop
- 🔔 **Notificaciones toast** cuando el pedido está listo
- ⚡ **Actualizaciones en tiempo real** del estado del pedido

### ⚙️ Backend Profesional
- 🏗️ **Arquitectura NestJS** con decoradores
- 📨 **Sistema de mensajería Kafka** para comunicación
- 🔄 **Procesamiento asíncrono** de pedidos
- 📊 **Logs detallados** para monitoreo

### ⏱️ Simulación Realista
- 🍕 **2 segundos por pizza** de tiempo de preparación
- 📈 **Escalable** - múltiples pedidos simultáneos
- 🎯 **Estados del pedido**: Recibido → Procesando → Completado

---

## 🎛️ Comandos Útiles

### Control General
```bash
# Iniciar todo
docker-compose up --build

# Iniciar en segundo plano
docker-compose up -d

# Ver qué está corriendo
docker-compose ps

# Parar todo
docker-compose down
```

### 📈 Escalado de Procesadores (NUEVO - Para el Taller)

¿Quieres ver cómo funciona la escalabilidad horizontal? ¡Ahora puedes ejecutar múltiples procesadores!

#### 🚀 Opción 1: Escalado Dinámico (MÁS FÁCIL)
```bash
# Iniciar el sistema normalmente
docker-compose up --build -d

# Escalar a 3 procesadores
docker-compose scale backend-processor=3

# Ver todas las instancias
docker-compose ps | grep backend-processor

# Volver a 1 procesador
docker-compose scale backend-processor=1
```

#### 🎯 Opción 2: Scripts Helper (SÚPER FÁCIL)

**En Windows (PowerShell):**
```powershell
# Ver opciones disponibles
.\scaling-demo.ps1 help

# Iniciar sistema
.\scaling-demo.ps1 start

# Escalar a 3 instancias
.\scaling-demo.ps1 scale 3

# Ver estado de procesadores
.\scaling-demo.ps1 status

# Ver logs de todos los procesadores
.\scaling-demo.ps1 logs
```

**En Linux/Mac:**
```bash
# Hacer ejecutable el script (solo la primera vez)
chmod +x scaling-demo.sh

# Ver opciones disponibles
./scaling-demo.sh help

# Iniciar sistema
./scaling-demo.sh start

# Escalar a 3 instancias
./scaling-demo.sh scale 3

# Ver estado de procesadores
./scaling-demo.sh status
```

#### 🏗️ Opción 3: Instancias Explícitas (PARA DEMOSTRACIÓN)
```bash
# Usar configuración con replicas predefinidas
docker-compose up --build -d

# O usar instancias nombradas explícitamente
docker-compose --profile scaling-demo up -d
```

#### 🎮 ¿Qué verás en los logs?

Con múltiples procesadores, verás algo así:
```
=== 🍕 [processor-1] RECEIVED PIZZA ORDER ===
Processor: processor-1
Order: abc123
=============================================

=== 🍕 [processor-2] RECEIVED PIZZA ORDER ===
Processor: processor-2
Order: def456
=============================================
```

¡Cada procesador tiene su propio ID y procesa pedidos independientemente! 🎉

### Control del Procesador de Pedidos
```bash
# Parar solo el procesador
docker-compose stop backend-processor

# Encender solo el procesador
docker-compose start backend-processor

# Reiniciar solo el procesador
docker-compose restart backend-processor
```

### Ver Logs (Para Debug)
```bash
# Ver logs del procesador
docker logs pizza-ordering-system-backend-processor-1 --follow

# Ver logs de TODOS los procesadores (cuando hay múltiples)
docker-compose logs -f backend-processor

# Ver logs del frontend
docker logs pizza-ordering-system-frontend-1 --follow

# Ver logs del servidor
docker logs pizza-ordering-system-bff-1 --follow
```

---

## 📁 Estructura del Proyecto

```
pizza-ordering-system/
├── 📄 .gitignore              # Configuración principal de Git
├── 📄 .dockerignore           # Archivos excluidos de Docker
├── 📄 README.md               # Este archivo
├── 📄 WORKSHOP.md             # Guía del workshop
├── 📄 docker-compose.yml      # Configuración de servicios
├── 🚀 scaling-demo.sh         # Script de escalado para Linux/Mac
├── 🚀 scaling-demo.ps1        # Script de escalado para Windows
├── 🌐 frontend/               # Aplicación React
│   ├── 📄 .gitignore          # Git ignore específico de frontend
│   ├── 📄 .dockerignore       # Docker ignore específico
│   ├── 📄 package.json        # Dependencias de Node.js
│   └── 📁 src/                # Código fuente
├── 📡 bff/                    # Backend for Frontend (NestJS)
│   ├── 📄 .gitignore          # Git ignore específico de BFF
│   ├── 📄 .dockerignore       # Docker ignore específico
│   ├── 📄 package.json        # Dependencias de Node.js
│   └── 📁 src/                # Código fuente
└── 🔄 backend-processor/      # Procesador de pedidos (NestJS)
    ├── 📄 .gitignore          # Git ignore específico del processor
    ├── 📄 .dockerignore       # Docker ignore específico
    ├── 📄 package.json        # Dependencias de Node.js
    └── 📁 src/                # Código fuente
```

### 🛡️ Archivos .gitignore Incluidos

Este proyecto incluye archivos `.gitignore` optimizados para cada tecnología:

- **🗂️ Raíz**: Configuración general + archivos del workshop
- **🌐 Frontend**: Específico para React + Vite
- **📡 BFF**: Específico para NestJS + Kafka
- **🔄 Processor**: Específico para NestJS + archivos de workshop
- **🐳 Docker**: Optimización de builds con `.dockerignore`

### 🚀 Scripts de Escalado Incluidos

- **`scaling-demo.sh`**: Script para Linux/Mac con comandos coloridos
- **`scaling-demo.ps1`**: Script para Windows PowerShell con colores
- **Funcionalidades**: start, scale, status, logs, stop, help

Esto asegura que solo se versionen los archivos necesarios y se mantengan privados los archivos de soluciones del workshop.

---

## 🐛 Solución de Problemas

### ❌ "No puedo acceder a http://localhost:3001"
**Solución**: Espera 2-3 minutos más. El frontend puede tardar en cargar.

### ❌ "Docker no está instalado"
**Solución**: Instala Docker Desktop desde el enlace de arriba.

### ❌ "El puerto 3001 está ocupado"
**Solución**: 
```bash
# Parar otros servicios
docker-compose down
# O cambiar el puerto en docker-compose.yml
```

### ❌ "Los pedidos no se procesan"
**Solución**:
```bash
# Reiniciar el procesador
docker-compose restart backend-processor

# Ver si hay errores
docker logs pizza-ordering-system-backend-processor-1
```

### ❌ "Error de memoria en Docker"
**Solución**: Asigna más memoria a Docker (mínimo 4GB recomendado).

---

## 🎓 ¿Qué aprenderás?

Trabajando con este proyecto aprenderás sobre:

- 🌐 **Desarrollo Frontend**: React, Vite, CSS moderno
- ⚙️ **Desarrollo Backend**: NestJS, APIs REST, WebSockets
- 📨 **Sistemas de Mensajería**: Apache Kafka, patrones Publisher/Subscriber
- 🐳 **Containerización**: Docker, Docker Compose
- 🏗️ **Arquitectura de Microservicios**: Separación de responsabilidades
- 📡 **Comunicación en Tiempo Real**: WebSockets, notificaciones push

---

## 📊 Estado de los Servicios

Una vez que todo esté funcionando, deberías ver:

```bash
docker-compose ps
```

| Servicio | Estado | Descripción |
|----------|--------|-------------|
| ✅ frontend | Healthy | Página web funcionando |
| ✅ bff | Running | Servidor principal activo |
| ✅ backend-processor | Running | Procesador de pedidos activo |
| ✅ kafka | Healthy | Sistema de mensajes funcionando |
| ✅ zookeeper | Healthy | Coordinador de Kafka activo |

---

## 🤝 ¿Necesitas ayuda?

### 📚 Documentación Adicional
- [Guía de Docker](https://docs.docker.com/get-started/)
- [Tutorial de React](https://reactjs.org/tutorial/tutorial.html)
- [Documentación de NestJS](https://docs.nestjs.com/)

### 🆘 Soporte
Si tienes problemas:
1. Revisa la sección "Solución de Problemas" arriba
2. Verifica que Docker esté corriendo
3. Asegúrate de que los puertos 3000, 3001, 8080, 9092 estén libres

---

## 🏆 ¡Felicitaciones!

Si llegaste hasta aquí y el sistema está funcionando, ¡has logrado ejecutar un sistema de microservicios completo! 🎉

**Próximos pasos sugeridos:**
- 🔍 Explora el código fuente
- 🎨 Modifica la interfaz
- ⚙️ Experimenta con los tiempos de procesamiento
- 📊 Agrega nuevas características

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Siéntete libre de usarlo, modificarlo y aprender de él.

---

<div align="center">
  <p>Hecho con ❤️ para aprender sobre desarrollo de software moderno</p>
  <p>🍕 ¡Disfruta programando! 🍕</p>
</div>

## 🚀 Escalado de Procesadores (Para Workshop)

> **📋 Por defecto**: El sistema inicia con **1 solo procesador**. Para el workshop, puedes escalarlo a múltiples instancias.

¿Quieres demostrar escalado horizontal? ¡Aquí tienes 3 formas diferentes! 