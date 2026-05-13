// Turbopack'in çökmesini engellemek için socket.io-client dinamik olarak import edilecektir.
let socket: any = null;

export const getSocketAsync = async (token: string | null) => {
  if (typeof window === 'undefined') return null;

  // Mevcut bir soket varsa (bağlı olsun veya olmasın) onu döndür.
  // .connected kontrolü HMR veya asenkron bağlantı durumlarında sonsuz soket oluşumuna sebep oluyordu.
  if (socket) {
    return socket;
  }

  // Dinamik import ile Turbopack (Next.js) AST bellek sızıntısı bug'ını atlıyoruz.
  const { io } = await import('socket.io-client');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';

  socket = io(apiUrl, {
    auth: { token: token ? `Bearer ${token}` : '' },
    transports: ['websocket'],
    autoConnect: false, // Manuel olarak bağlanacağız
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
