export const generateTransactionId = () => {
  const digits = Math.floor(100000000000 + Math.random() * 900000000000);
  return `TXN-${digits}`;
};
