# 🍕 Pizza Ordering System - Scaling Demo Script (PowerShell)
# ===========================================================

Write-Host "🚀 Pizza Ordering System - Scaling Demo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

function Show-Help {
    Write-Host "Available commands:" -ForegroundColor Blue
    Write-Host "  .\scaling-demo.ps1 start         - Start the system (1 processor)" -ForegroundColor Green
    Write-Host "  .\scaling-demo.ps1 scale <N>     - Scale processors to N instances" -ForegroundColor Green
    Write-Host "  .\scaling-demo.ps1 scale-demo    - Start additional processors with profiles" -ForegroundColor Green
    Write-Host "  .\scaling-demo.ps1 status        - Show running processors" -ForegroundColor Green
    Write-Host "  .\scaling-demo.ps1 logs          - Show processor logs" -ForegroundColor Green
    Write-Host "  .\scaling-demo.ps1 stop          - Stop all services" -ForegroundColor Green
    Write-Host "  .\scaling-demo.ps1 help          - Show this help" -ForegroundColor Green
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\scaling-demo.ps1 scale 3       - Run 3 processor instances" -ForegroundColor Magenta
    Write-Host "  .\scaling-demo.ps1 scale-demo    - Show explicit scaling with named instances" -ForegroundColor Magenta
}

function Start-System {
    Write-Host "🚀 Starting Pizza Ordering System..." -ForegroundColor Yellow
    docker-compose up --build -d
    
    Write-Host "🔧 Configuring Kafka topics for scaling..." -ForegroundColor Blue
    # Wait for Kafka to be ready
    Write-Host "⏳ Waiting for Kafka to be ready..." -ForegroundColor Blue
    do {
        Start-Sleep 2
        $kafkaReady = docker exec pizza-ordering-system-kafka-1 kafka-topics --bootstrap-server localhost:9092 --list 2>$null
    } while ($LASTEXITCODE -ne 0)
    
    # Configure topics with multiple partitions
    docker exec pizza-ordering-system-kafka-1 kafka-topics --bootstrap-server localhost:9092 --alter --topic pizza.orders --partitions 3 2>$null
    if ($LASTEXITCODE -ne 0) {
        docker exec pizza-ordering-system-kafka-1 kafka-topics --bootstrap-server localhost:9092 --create --topic pizza.orders --partitions 3 --replication-factor 1 2>$null
    }
    
    docker exec pizza-ordering-system-kafka-1 kafka-topics --bootstrap-server localhost:9092 --alter --topic order.completed --partitions 3 2>$null
    if ($LASTEXITCODE -ne 0) {
        docker exec pizza-ordering-system-kafka-1 kafka-topics --bootstrap-server localhost:9092 --create --topic order.completed --partitions 3 --replication-factor 1 2>$null
    }
    
    Write-Host "✅ System started! Access:" -ForegroundColor Green
    Write-Host "   🌐 Frontend: http://localhost:3001"
    Write-Host "   📊 Kafka UI: http://localhost:8080"
    Write-Host "📝 Topics configured for scaling - you can now use multiple processors!" -ForegroundColor Blue
}

function Scale-Processors {
    param([string]$Instances)
    
    if ([string]::IsNullOrEmpty($Instances)) {
        Write-Host "❌ Please specify number of instances" -ForegroundColor Red
        Write-Host "   Example: .\scaling-demo.ps1 scale 3"
        exit 1
    }
    
    Write-Host "📈 Scaling backend-processor to $Instances instances..." -ForegroundColor Yellow
    docker-compose scale backend-processor=$Instances
    
    Write-Host "✅ Scaled to $Instances processors!" -ForegroundColor Green
    Show-Status
}

function Start-ScaleDemo {
    Write-Host "🎯 Starting scaling demo with named instances..." -ForegroundColor Yellow
    docker-compose --profile scaling-demo up -d
    
    Write-Host "✅ Scaling demo started with explicit instances!" -ForegroundColor Green
    Show-Status
}

function Show-Status {
    Write-Host "📊 Current processor instances:" -ForegroundColor Blue
    $processors = docker-compose ps | Select-String "backend-processor"
    foreach ($processor in $processors) {
        Write-Host "   • $processor" -ForegroundColor Green
    }
}

function Show-Logs {
    Write-Host "📋 Processor logs (press Ctrl+C to exit):" -ForegroundColor Yellow
    docker-compose logs -f backend-processor backend-processor-2 backend-processor-3
}

function Stop-System {
    Write-Host "🛑 Stopping all services..." -ForegroundColor Yellow
    docker-compose down
    Write-Host "✅ All services stopped!" -ForegroundColor Green
}

# Main script logic
param([string]$Command, [string]$Parameter)

switch ($Command) {
    "start" {
        Start-System
    }
    "scale" {
        Scale-Processors -Instances $Parameter
    }
    "scale-demo" {
        Start-ScaleDemo
    }
    "status" {
        Show-Status
    }
    "logs" {
        Show-Logs
    }
    "stop" {
        Stop-System
    }
    { $_ -eq "help" -or [string]::IsNullOrEmpty($_) } {
        Show-Help
    }
    default {
        Write-Host "❌ Unknown command: $Command" -ForegroundColor Red
        Show-Help
        exit 1
    }
} 