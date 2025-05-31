import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import { Pizza, Wifi, WifiOff, Clock, CheckCircle, ShoppingCart, Bell, Zap } from 'lucide-react';

// Constants
const BFF_URL = import.meta.env.VITE_BFF_URL || 'http://localhost:3000';
const socket = io(BFF_URL);

interface OrderNotification {
  orderId: string;
  status: string;
  message?: string;
  processedAt?: string;
  quantity?: number;
  timestamp: string;
}

interface OrderProgress {
  orderId: string;
  quantity: number;
  status: 'received' | 'processing' | 'completed';
  estimatedTime?: number;
  completedAt?: string;
}

function App() {
  const [quantity, setQuantity] = useState<number>(1);
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [orders, setOrders] = useState<OrderProgress[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Socket connection handling
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      toast.success('Connected to server', { 
        id: 'connection',
        style: {
          background: 'linear-gradient(135deg, #00ff88, #00cc77)',
          color: 'white',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: '600',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
      toast.error('Disconnected from server', { 
        id: 'connection',
        style: {
          background: 'linear-gradient(135deg, #ff4757, #cc3838)',
          color: 'white',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: '600',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      });
    });

    // Listen for order updates
    socket.on('order-update', (notification: OrderNotification) => {
      console.log('Received order update:', notification);
      
      setNotifications(prev => [notification, ...prev]);
      
      // Update order progress
      setOrders(prev => prev.map(order => 
        order.orderId === notification.orderId 
          ? { 
              ...order, 
              status: 'completed',
              completedAt: notification.processedAt || new Date().toISOString()
            }
          : order
      ));

      // Show toast notification for completed orders
      if (notification.status === 'completed') {
        toast.success(
          `🍕 ${notification.quantity} pizza${notification.quantity !== 1 ? 's' : ''} ready!`,
          {
            duration: 6000,
            icon: '🎉',
            style: {
              background: 'linear-gradient(135deg, #ff6b35, #ff8c42)',
              color: 'white',
              fontWeight: '600',
              fontFamily: 'Poppins, sans-serif',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(255, 107, 53, 0.3)',
            },
          }
        );
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('order-update');
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${BFF_URL}/api/order-pizza`, { quantity });
      console.log('Order submitted:', response.data);
      
      const estimatedTime = quantity * 2; // 2 seconds per pizza
      
      // Add to orders tracking
      const newOrder: OrderProgress = {
        orderId: response.data.orderId,
        quantity,
        status: 'received',
        estimatedTime
      };
      setOrders(prev => [newOrder, ...prev]);
      
      // Add initial notification
      const newNotification: OrderNotification = {
        orderId: response.data.orderId,
        status: 'Order received',
        timestamp: new Date().toISOString()
      };
      setNotifications(prev => [newNotification, ...prev]);

      // Show success toast
      toast.success(
        `Order placed! ${quantity} pizza${quantity !== 1 ? 's' : ''} (${estimatedTime}s processing)`,
        {
          duration: 4000,
          icon: '🍕',
          style: {
            background: 'linear-gradient(135deg, #ffd700, #ffcc00)',
            color: '#0a0a0a',
            fontWeight: '600',
            fontFamily: 'Poppins, sans-serif',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        }
      );

      // Update to processing status
      setTimeout(() => {
        setOrders(prev => prev.map(order => 
          order.orderId === response.data.orderId 
            ? { ...order, status: 'processing' }
            : order
        ));
      }, 1000);

    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Failed to place order. Please try again.', {
        style: {
          background: 'linear-gradient(135deg, #ff4757, #cc3838)',
          color: 'white',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: '600',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: OrderProgress['status']) => {
    switch (status) {
      case 'received':
        return <ShoppingCart className="w-4 h-4 text-yellow-400" />;
      case 'processing':
        return <Zap className="w-4 h-4 text-orange-400 pulse glow" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400 glow" />;
    }
  };

  const getStatusText = (status: OrderProgress['status']) => {
    switch (status) {
      case 'received':
        return 'Order Received';
      case 'processing':
        return 'Cooking...';
      case 'completed':
        return 'Ready! 🎉';
    }
  };

  return (
    <div className="app-container">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(10, 10, 10, 0.95)',
            color: '#ffffff',
            border: '1px solid #222222',
            backdropFilter: 'blur(20px)',
            fontFamily: 'Nunito, Poppins, sans-serif',
            borderRadius: '20px',
          },
        }}
      />
      
      {/* Header */}
      <div className="header">
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <Pizza className="w-14 h-14 glow" style={{ color: '#ff6b35' }} />
          Pizza Ordering System
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '1.25rem', 
          marginTop: '1rem',
          fontWeight: '400',
          fontFamily: 'Nunito, Poppins, sans-serif'
        }}>
          Order fresh pizzas with <span style={{ color: 'var(--text-accent)', fontWeight: '600' }}>real-time tracking</span>
        </p>
      </div>

      <div className="main-grid">
        
        {/* Order Form */}
        <div className="card order-card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShoppingCart className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
            Place Your Order
          </h2>
          
          <form onSubmit={handleSubmit} className="order-form">
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                max="10"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label>Estimated Time</label>
              <div className="time-display" style={{ 
                padding: '1rem 1.25rem', 
                borderRadius: '20px',
                fontSize: '1rem',
                minWidth: '120px',
                textAlign: 'center',
                fontWeight: '700'
              }}>
                {quantity * 2}s
              </div>
            </div>
            
            <button 
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ 
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                <>
                  <div className="pulse" style={{ 
                    width: '18px', 
                    height: '18px', 
                    background: 'white', 
                    borderRadius: '50%' 
                  }} />
                  Ordering...
                </>
              ) : (
                <>
                  <Pizza className="w-5 h-5" />
                  Order Pizzas
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Tracking */}
        <div className="card tracking-card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
            Live Tracking
          </h2>
          
          <div className="scroll-area">
            {orders.length === 0 ? (
              <div className="empty-state">
                <Pizza className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p style={{ margin: 0, fontWeight: '400', fontFamily: 'Nunito, Poppins, sans-serif' }}>No orders yet</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', fontFamily: 'Nunito, Poppins, sans-serif' }}>Place your first order!</p>
              </div>
            ) : (
              orders.map((order) => (
                <div 
                  key={order.orderId}
                  className={`notification-item ${order.status === 'completed' ? 'notification-completed' : 'notification-received'}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {getStatusIcon(order.status)}
                      <div>
                        <div style={{ 
                          fontWeight: '700', 
                          fontSize: '0.9rem',
                          fontFamily: 'Nunito, JetBrains Mono, monospace'
                        }}>
                          #{order.orderId.slice(-8).toUpperCase()}
                        </div>
                        <div style={{ 
                          color: 'var(--text-secondary)', 
                          fontSize: '0.8rem',
                          marginTop: '0.25rem',
                          fontFamily: 'Nunito, Poppins, sans-serif'
                        }}>
                          {order.quantity} pizza{order.quantity !== 1 ? 's' : ''} • {getStatusText(order.status)}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                      {order.status === 'completed' && order.completedAt ? (
                        <div style={{ 
                          color: 'var(--success)',
                          fontFamily: 'Nunito, JetBrains Mono, monospace',
                          fontWeight: '700'
                        }}>
                          {new Date(order.completedAt).toLocaleTimeString()}
                        </div>
                      ) : order.estimatedTime ? (
                        <div style={{ 
                          color: 'var(--text-accent)',
                          fontFamily: 'Nunito, JetBrains Mono, monospace',
                          fontWeight: '700'
                        }}>
                          ~{order.estimatedTime}s
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notifications History */}
        <div className="card notifications-card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bell className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
            Notification History
            {notifications.length > 0 && (
              <span className="notification-badge">
                {notifications.length}
              </span>
            )}
          </h2>
          
          <div className="scroll-area">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p style={{ margin: 0, fontWeight: '400', fontFamily: 'Nunito, Poppins, sans-serif' }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div 
                  key={index}
                  className={`notification-item ${
                    notification.status === 'completed' ? 'notification-completed' : 'notification-received'
                  }`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: '700', 
                        fontSize: '0.9rem',
                        marginBottom: '0.25rem',
                        fontFamily: 'Nunito, Poppins, sans-serif'
                      }}>
                        {notification.message || `Order ${notification.orderId.slice(-8).toUpperCase()}: ${notification.status}`}
                      </div>
                      {notification.quantity && (
                        <div style={{ 
                          color: 'var(--text-secondary)', 
                          fontSize: '0.8rem',
                          fontFamily: 'Nunito, JetBrains Mono, monospace'
                        }}>
                          {notification.quantity} pizza{notification.quantity !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: 'var(--text-muted)',
                      fontFamily: 'Nunito, JetBrains Mono, monospace',
                      textAlign: 'right',
                      minWidth: 'fit-content',
                      marginLeft: '1rem'
                    }}>
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className={`status-indicator ${isConnected ? 'status-connected' : 'status-disconnected'}`}>
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4" />
            CONNECTED
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            DISCONNECTED
          </>
        )}
      </div>
    </div>
  );
}

export default App;
