import { firestore, COLLECTIONS } from './db';
import { FieldValue } from 'firebase-admin/firestore';

// Helper to generate unique IDs
export const generateId = () => firestore.collection('_temp').doc().id;

// Helper to convert Firestore timestamp to Date
export const toDate = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return new Date(timestamp);
};

// Helper to add timestamps
export const withTimestamps = (data: any, isUpdate = false) => {
  const now = FieldValue.serverTimestamp();
  if (isUpdate) {
    return { ...data, updatedAt: now };
  }
  return { ...data, createdAt: now, updatedAt: now };
};

// Helper to get document by ID
export const getDocById = async (collection: string, id: string): Promise<any> => {
  const doc = await firestore.collection(collection).doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data();
  return { id: doc.id, ...data };
};

// Helper to get all documents in a collection
export const getAllDocs = async (collection: string): Promise<any[]> => {
  const snapshot = await firestore.collection(collection).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Helper to query documents
export const queryDocs = async (
  collection: string,
  field: string,
  operator: FirebaseFirestore.WhereFilterOp,
  value: any
): Promise<any[]> => {
  const snapshot = await firestore.collection(collection).where(field, operator, value).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Helper to create document
export const createDoc = async (collection: string, data: any, customId?: string) => {
  const docData = withTimestamps(data);
  if (customId) {
    await firestore.collection(collection).doc(customId).set(docData);
    return { id: customId, ...docData };
  }
  const docRef = await firestore.collection(collection).add(docData);
  return { id: docRef.id, ...docData };
};

// Helper to update document
export const updateDoc = async (collection: string, id: string, data: any) => {
  const docData = withTimestamps(data, true);
  await firestore.collection(collection).doc(id).update(docData);
  return { id, ...docData };
};

// Helper to delete document
export const deleteDoc = async (collection: string, id: string) => {
  await firestore.collection(collection).doc(id).delete();
};

// Helper to count documents
export const countDocs = async (collection: string) => {
  const snapshot = await firestore.collection(collection).count().get();
  return snapshot.data().count;
};

// Helper to serialize Firestore data to plain objects (for passing to client components)
// This converts Firestore Timestamps to ISO strings
export const serializeDoc = (doc: any): any => {
  if (!doc) return null;
  if (typeof doc !== 'object') return doc;

  if (Array.isArray(doc)) {
    return doc.map(serializeDoc);
  }

  const serialized: any = {};
  for (const key in doc) {
    const value = doc[key];

    // Check if it's a Firestore Timestamp
    if (value && typeof value === 'object' && ('_seconds' in value || 'toDate' in value)) {
      // Convert to ISO string
      if ('_seconds' in value) {
        serialized[key] = new Date(value._seconds * 1000).toISOString();
      } else if (typeof value.toDate === 'function') {
        serialized[key] = value.toDate().toISOString();
      } else {
        serialized[key] = value;
      }
    } else if (value && typeof value === 'object') {
      serialized[key] = serializeDoc(value);
    } else {
      serialized[key] = value;
    }
  }

  return serialized;
};
