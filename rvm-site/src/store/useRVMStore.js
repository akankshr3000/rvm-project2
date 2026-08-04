import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const BOTTLE_TYPES = {
  small:  { label: 'Small',  points: 5,  coins: 2 },
  medium: { label: 'Medium', points: 10, coins: 4 },
  large:  { label: 'Large',  points: 15, coins: 6 },
};

export const useRVMStore = create(
  persist(
    (set, get) => ({
      users: [],
      transactions: [],
      currentUser: null,

      addUser: (data) => {
        const user = {
          ...data,
          id: `USR-${Date.now()}`,
          points: 0,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ users: [...s.users, user] }));
        return user;
      },

      setCurrentUser: (user) => set({ currentUser: user }),

      getUserById: (id) => get().users.find((u) => u.id === id),

      addTransaction: (userId, bottleType) => {
        const bt = BOTTLE_TYPES[bottleType] || BOTTLE_TYPES.medium;
        const txn = {
          id: `TXN-${Date.now()}`,
          userId,
          bottleType,
          label: bt.label,
          points: bt.points,
          coins: bt.coins,
          date: new Date().toISOString(),
        };
        set((s) => ({
          transactions: [txn, ...s.transactions],
          users: s.users.map((u) =>
            u.id === userId ? { ...u, points: u.points + bt.points } : u
          ),
          currentUser:
            s.currentUser?.id === userId
              ? { ...s.currentUser, points: s.currentUser.points + bt.points }
              : s.currentUser,
        }));
        return txn;
      },

      getTransactionsByUser: (userId) =>
        get().transactions.filter((t) => t.userId === userId),

      getAllTransactions: () => get().transactions,

      addPoints: (userId, points, label) => {
        const txn = {
          id: `CLM-${Date.now()}`,
          userId,
          label,
          points,
          coins: 0,
          date: new Date().toISOString(),
          type: 'claim'
        };
        set((s) => ({
          transactions: [txn, ...s.transactions],
          users: s.users.map((u) => u.id === userId ? { ...u, points: u.points + points } : u),
          currentUser: s.currentUser?.id === userId ? { ...s.currentUser, points: s.currentUser.points + points } : s.currentUser,
        }));
        return txn;
      },

      transferPoints: (senderId, senderPassword, receiverIdentifier, points) => {
        const state = get();
        const sender = state.users.find(u => u.id === senderId);
        const receiver = state.users.find(u => u.usn === receiverIdentifier || u.empId === receiverIdentifier);
        
        if (!sender) return { success: false, error: 'Sender not found' };
        if (sender.password !== senderPassword) return { success: false, error: 'Incorrect sender password' };
        if (!receiver) return { success: false, error: 'Receiver not found' };
        if (sender.id === receiver.id) return { success: false, error: 'Cannot transfer to yourself' };
        if (sender.points < points) return { success: false, error: 'Insufficient balance' };
        if (points <= 0) return { success: false, error: 'Invalid amount' };

        const txnTrf = {
          id: `TRF-${Date.now()}`,
          senderId: sender.id,
          receiverId: receiver.id,
          label: 'Transfer',
          points,
          coins: 0,
          date: new Date().toISOString(),
          type: 'transfer'
        };

        set((s) => ({
          transactions: [txnTrf, ...s.transactions],
          users: s.users.map((u) => {
            if (u.id === sender.id) return { ...u, points: u.points - points };
            if (u.id === receiver.id) return { ...u, points: u.points + points };
            return u;
          }),
          currentUser: s.currentUser?.id === sender.id ? { ...s.currentUser, points: s.currentUser.points - points } : s.currentUser,
        }));

        return { success: true };
      },

      BOTTLE_TYPES,
    }),
    { name: 'rvm-store-v1' }
  )
);
