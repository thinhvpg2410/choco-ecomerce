// pages/admin/chat.tsx
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Client { userId: string; socketId: string; }
interface Message { senderId: string; senderRole: string; message: string; timestamp: string; roomId: string; }

export default function AdminChat({ adminId }: { adminId: string }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState('');

  useEffect(() => {
    const s = io('http://localhost:3001');
    setSocket(s);

    s.emit('register', { userId: adminId, role: 'admin' });
    s.emit('get_online_clients');

    s.on('online_clients', (list: Client[]) => setClients(list));
    s.on('new_client', (client: Client) => {
      setClients(prev => [...prev.filter(c => c.userId !== client.userId), client]);
    });
    s.on('user_offline', ({ userId }: { userId: string }) => {
      setClients(prev => prev.filter(c => c.userId !== userId));
    });
    s.on('receive_message', (msg: Message) => {
      setMessages(prev => ({
        ...prev,
        [msg.roomId]: [...(prev[msg.roomId] || []), msg],
      }));
    });

    return () => { s.disconnect(); };
  }, [adminId]);

  const selectClient = (clientId: string) => {
    setSelectedClient(clientId);
    socket?.emit('join_room', `room_${clientId}`);
  };

  const sendMessage = () => {
    if (!input.trim() || !socket || !selectedClient) return;
    const roomId = `room_${selectedClient}`;
    socket.emit('send_message', {
      roomId, message: input,
      senderId: adminId, senderRole: 'admin',
    });
    setInput('');
  };

  const currentRoomId = selectedClient ? `room_${selectedClient}` : null;
  const currentMessages = currentRoomId ? (messages[currentRoomId] || []) : [];

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar - danh sách clients */}
      <div style={{ width: 260, background: '#1e1b4b', color: '#fff',
        display: 'flex', flexDirection: 'column', padding: 16, gap: 8 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>👥 Khách đang online ({clients.length})</h3>
        {clients.map(c => (
          <div key={c.userId} onClick={() => selectClient(c.userId)}
            style={{
              padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
              background: selectedClient === c.userId ? '#6366f1' : '#312e81',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            <span style={{ fontSize: 14 }}>User #{c.userId.slice(-6)}</span>
            {messages[`room_${c.userId}`]?.length > 0 && (
              <span style={{ marginLeft: 'auto', background: '#ef4444',
                borderRadius: '50%', width: 18, height: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
                {messages[`room_${c.userId}`].length}
              </span>
            )}
          </div>
        ))}
        {clients.length === 0 && (
          <p style={{ opacity: 0.5, fontSize: 13 }}>Chưa có khách nào online</p>
        )}
      </div>

      {/* Khu vực chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
        {selectedClient ? (
          <>
            <div style={{ padding: '14px 20px', background: '#fff',
              borderBottom: '1px solid #e5e7eb', fontWeight: 600, fontSize: 15 }}>
              Chat với User #{selectedClient.slice(-6)}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentMessages.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.senderRole === 'admin' ? 'flex-end' : 'flex-start',
                  background: msg.senderRole === 'admin' ? '#6366f1' : '#fff',
                  color: msg.senderRole === 'admin' ? '#fff' : '#111',
                  padding: '10px 14px', borderRadius: 12, maxWidth: '60%',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 3, opacity: 0.8 }}>
                    {msg.senderRole === 'admin' ? 'Bạn (Admin)' : `User #${msg.senderId.slice(-6)}`}
                  </div>
                  <div style={{ fontSize: 14 }}>{msg.message}</div>
                  <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
                    {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: 16, background: '#fff',
              borderTop: '1px solid #e5e7eb', display: 'flex', gap: 10 }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Nhập phản hồi cho khách..."
                style={{ flex: 1, padding: '10px 14px', borderRadius: 8,
                  border: '1px solid #e5e7eb', fontSize: 14, outline: 'none' }} />
              <button onClick={sendMessage}
                style={{ background: '#6366f1', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>
                Gửi
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#9ca3af', fontSize: 15 }}>
            ← Chọn một khách hàng để bắt đầu chat
          </div>
        )}
      </div>
    </div>
  );
}