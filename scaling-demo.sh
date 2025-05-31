#!/bin/bash

# 🍕 Pizza Ordering System - Scaling Demo Script
# ===============================================

echo "🚀 Pizza Ordering System - Scaling Demo"
echo "========================================"

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

show_help() {
    echo -e "${BLUE}Available commands:${NC}"
    echo -e "  ${GREEN}./scaling-demo.sh start${NC}         - Start the system (1 processor)"
    echo -e "  ${GREEN}./scaling-demo.sh scale <N>${NC}     - Scale processors to N instances"
    echo -e "  ${GREEN}./scaling-demo.sh scale-demo${NC}     - Start additional processors with profiles"
    echo -e "  ${GREEN}./scaling-demo.sh status${NC}        - Show running processors"
    echo -e "  ${GREEN}./scaling-demo.sh logs${NC}          - Show processor logs"
    echo -e "  ${GREEN}./scaling-demo.sh stop${NC}          - Stop all services"
    echo -e "  ${GREEN}./scaling-demo.sh help${NC}          - Show this help"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  ${PURPLE}./scaling-demo.sh scale 3${NC}       - Run 3 processor instances"
    echo -e "  ${PURPLE}./scaling-demo.sh scale-demo${NC}    - Show explicit scaling with named instances"
}

start_system() {
    echo -e "${YELLOW}🚀 Starting Pizza Ordering System...${NC}"
    docker-compose up --build -d
    
    echo -e "${BLUE}🔧 Configuring Kafka topics for scaling...${NC}"
    # Wait for Kafka to be ready
    echo -e "${BLUE}⏳ Waiting for Kafka to be ready...${NC}"
    until docker exec pizza-ordering-system-kafka-1 kafka-topics --bootstrap-server localhost:9092 --list &>/dev/null; do
        sleep 2
    done
    
    # Configure topics with multiple partitions
    docker exec pizza-ordering-system-kafka-1 kafka-topics --bootstrap-server localhost:9092 --alter --topic pizza.orders --partitions 3 2>/dev/null || \
    docker exec pizza-ordering-system-kafka-1 kafka-topics --bootstrap-server localhost:9092 --create --topic pizza.orders --partitions 3 --replication-factor 1 2>/dev/null
    
    docker exec pizza-ordering-system-kafka-1 kafka-topics --bootstrap-server localhost:9092 --alter --topic order.completed --partitions 3 2>/dev/null || \
    docker exec pizza-ordering-system-kafka-1 kafka-topics --bootstrap-server localhost:9092 --create --topic order.completed --partitions 3 --replication-factor 1 2>/dev/null
    
    echo -e "${GREEN}✅ System started! Access:${NC}"
    echo -e "   🌐 Frontend: http://localhost:3001"
    echo -e "   📊 Kafka UI: http://localhost:8080"
    echo -e "${BLUE}📝 Topics configured for scaling - you can now use multiple processors!${NC}"
}

scale_processors() {
    if [ -z "$1" ]; then
        echo -e "${RED}❌ Please specify number of instances${NC}"
        echo -e "   Example: ./scaling-demo.sh scale 3"
        exit 1
    fi
    
    local instances=$1
    echo -e "${YELLOW}📈 Scaling backend-processor to $instances instances...${NC}"
    docker-compose scale backend-processor=$instances
    
    echo -e "${GREEN}✅ Scaled to $instances processors!${NC}"
    show_status
}

scale_demo() {
    echo -e "${YELLOW}🎯 Starting scaling demo with named instances...${NC}"
    docker-compose --profile scaling-demo up -d
    
    echo -e "${GREEN}✅ Scaling demo started with explicit instances!${NC}"
    show_status
}

show_status() {
    echo -e "${BLUE}📊 Current processor instances:${NC}"
    docker-compose ps | grep backend-processor | while read line; do
        echo -e "   ${GREEN}•${NC} $line"
    done
}

show_logs() {
    echo -e "${YELLOW}📋 Processor logs (press Ctrl+C to exit):${NC}"
    docker-compose logs -f backend-processor backend-processor-2 backend-processor-3
}

stop_system() {
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ All services stopped!${NC}"
}

# Main script logic
case "$1" in
    "start")
        start_system
        ;;
    "scale")
        scale_processors "$2"
        ;;
    "scale-demo")
        scale_demo
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "stop")
        stop_system
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac 