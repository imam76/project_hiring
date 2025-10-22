import { Avatar, Breadcrumb, Button, Card, Flex, Input, Space } from 'antd';
import { ChevronRight } from 'lucide-react';
import { Brain, Send, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const messagesContainerStyle = {
  flexGrow: 1, // Mengisi ruang yang tersedia
  overflowY: 'auto', // Membuat area pesan bisa di-scroll
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '70vh',
  gap: '16px',
};

const inputAreaStyle = {
  padding: '16px',
  borderTop: '1px solid #f0f0f0', // Garis pemisah antara pesan dan input
};

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Scroll ke bagian bawah setiap kali ada pesan baru
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, []);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newUserMessage = { text: inputValue, sender: 'user' };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setInputValue('');

      // Simulasi respons dari AI setelah beberapa detik
      setTimeout(() => {
        const aiResponse = {
          text: `Ini adalah respons dari AI untuk pesan "${inputValue}"`,
          sender: 'ai',
        };
        setMessages((prevMessages) => [...prevMessages, aiResponse]);
      }, 1000); // Simulasi delay 1 detik
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Flex gap={'large'} vertical>
      <Flex justify="space-between" align="center">
        <Breadcrumb
          separator=">"
          items={[
            {
              title: 'Home',
            },
            {
              title: 'Application Center',
              href: '',
            },
            {
              title: 'Application List',
              href: '',
            },
            {
              title: 'An Application',
            },
          ]}
        />
      </Flex>
      <Card>
        <Space size={'small'} direction="vertical" style={{ display: 'flex' }}>
          <Flex vertical justify="space-between">
            <div style={messagesContainerStyle} ref={chatContainerRef}>
              {messages.map((msg) => (
                <Flex
                  key={msg}
                  // Gunakan Flex untuk menata avatar dan bubble pesan
                  justify={msg.sender === 'user' ? 'flex-end' : 'flex-start'} // Posisi pesan user di kanan, AI di kiri
                  align="flex-start"
                  gap={12}
                >
                  {/* Avatar hanya ditampilkan di sisi AI untuk contoh ini */}
                  {msg.sender === 'ai' && (
                    <Avatar icon={<Brain />} size="small" />
                  )}
                  <div
                    style={{
                      background: msg.sender === 'user' ? '#1890ff' : '#f0f0f0',
                      color:
                        msg.sender === 'user' ? 'white' : 'rgba(0, 0, 0, 0.85)',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      maxWidth: '70%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.text}
                  </div>
                  {/* Avatar user ditampilkan di sisi kanan pesan user */}
                  {msg.sender === 'user' && (
                    <Avatar icon={<User />} size="small" />
                  )}
                </Flex>
              ))}
            </div>

            {/* Area Input Pesan */}
            <div style={inputAreaStyle}>
              <Flex gap={12}>
                {' '}
                {/* Gunakan Flex untuk menata input dan tombol */}
                <Input
                  placeholder="Ketik pesan..."
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  style={{ flex: 1 }} // Input mengisi ruang yang tersedia
                />
                <Button
                  type="primary"
                  icon={<Send size={16} />}
                  onClick={handleSendMessage}
                >
                  Kirim
                </Button>
              </Flex>
            </div>
          </Flex>
        </Space>
      </Card>
    </Flex>
  );
};

export default ChatPage;
