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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', position: 'relative' }}>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(17, 17, 17, 0.9)',
            color: '#ffffff',
            border: '1px solid #333333',
            backdropFilter: 'blur(20px)',
            fontFamily: 'Poppins, sans-serif',
          },
        }}
      />
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <Pizza className="w-14 h-14 glow" style={{ color: '#ff6b35' }} />
          Pizza Ordering System
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '1.25rem', 
          marginTop: '1rem',
          fontWeight: '300'
        }}>
          Order fresh pizzas with <span style={{ color: 'var(--text-accent)', fontWeight: '500' }}>real-time tracking</span>
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gap: '2.5rem', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        marginBottom: '2rem'
      }}>
        
        {/* Order Form */}
        <div className="card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShoppingCart className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
            Place Your Order
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1.5rem', alignItems: 'end', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label>Estimated Time</label>
              <div className="time-display" style={{ 
                padding: '1rem 1.25rem', 
                borderRadius: '16px',
                fontSize: '1rem',
                minWidth: '120px',
                textAlign: 'center',
                fontWeight: '600'
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
        <div className="card">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
            Live Tracking
          </h2>
          
          <div className="scroll-area">
            {orders.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: 'var(--text-muted)', 
                padding: '3rem 1rem',
                fontSize: '0.9rem'
              }}>
                <Pizza className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p style={{ margin: 0, fontWeight: '300' }}>No orders yet</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem' }}>Place your first order!</p>
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
                          fontWeight: '600', 
                          fontSize: '0.9rem',
                          fontFamily: 'JetBrains Mono, monospace'
                        }}>
                          #{order.orderId.slice(-8).toUpperCase()}
                        </div>
                        <div style={{ 
                          color: 'var(--text-secondary)', 
                          fontSize: '0.8rem',
                          marginTop: '0.25rem'
                        }}>
                          {order.quantity} pizza{order.quantity !== 1 ? 's' : ''} • {getStatusText(order.status)}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                      {order.status === 'completed' && order.completedAt ? (
                        <div style={{ 
                          color: 'var(--success)',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontWeight: '600'
                        }}>
                          {new Date(order.completedAt).toLocaleTimeString()}
                        </div>
                      ) : order.estimatedTime ? (
                        <div style={{ 
                          color: 'var(--text-accent)',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontWeight: '600'
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
      </div>

      {/* Notifications History - Full Width */}
      <div className="card" style={{ width: '100%' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bell className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
          Notification History
          {notifications.length > 0 && (
            <span style={{ 
              background: 'var(--accent-gradient)',
              color: 'white',
              borderRadius: '12px',
              padding: '0.25rem 0.75rem',
              fontSize: '0.75rem',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: '600'
            }}>
              {notifications.length}
            </span>
          )}
        </h2>
        
        <div className="scroll-area">
          {notifications.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: 'var(--text-muted)', 
              padding: '2rem',
              fontSize: '0.9rem'
            }}>
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p style={{ margin: 0, fontWeight: '300' }}>No notifications yet</p>
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
                      fontWeight: '600', 
                      fontSize: '0.9rem',
                      marginBottom: '0.25rem'
                    }}>
                      {notification.message || `Order ${notification.orderId.slice(-8).toUpperCase()}: ${notification.status}`}
                    </div>
                    {notification.quantity && (
                      <div style={{ 
                        color: 'var(--text-secondary)', 
                        fontSize: '0.8rem',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}>
                        {notification.quantity} pizza{notification.quantity !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--text-muted)',
                    fontFamily: 'JetBrains Mono, monospace',
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
