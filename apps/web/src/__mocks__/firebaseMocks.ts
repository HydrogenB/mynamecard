// Global mocks for Firebase
global.jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  FirebaseError: jest.fn().mockImplementation(function(code: string, message: string) {
    this.code = code;
    this.message = message;
  })
}));

global.jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn().mockReturnValue('mocked-firestore'),
  doc: jest.fn().mockReturnValue('mocked-doc-ref'),
  getDoc: jest.fn(),
  setDoc: jest.fn().mockResolvedValue(undefined),
  updateDoc: jest.fn().mockResolvedValue(undefined),
  serverTimestamp: jest.fn().mockReturnValue({
    toDate: () => new Date()
  }),
  collection: jest.fn().mockImplementation((_, name) => ({ id: name })),
  writeBatch: jest.fn().mockReturnValue({
    set: jest.fn(),
    commit: jest.fn().mockResolvedValue(undefined)
  }),
}));

global.jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn().mockReturnValue({}),
  httpsCallable: jest.fn().mockReturnValue(() => 
    Promise.resolve({ data: { plan: 'pro', cardLimit: 999 } })
  )
}));
