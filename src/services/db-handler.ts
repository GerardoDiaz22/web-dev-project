import { collection, query, where, limit, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';

// Function to get a document from Firestore
const getDocument = async (db: Firestore, collectionName: string, documentId: string) => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where('id', '==', documentId), limit(1));
    const docSnap = await getDocs(q);

    if (docSnap.empty) throw { code: 'not-found' };

    return docSnap.docs[0].data();
  } catch (err: unknown) {
    console.error(err);

    let msgErr;
    const errCode = (err as { code: string }).code;

    switch (errCode) {
      case 'permission-denied':
        msgErr = 'No tienes permiso para acceder a los documentos.';
        break;
      case 'unavailable':
        msgErr = 'El servicio no está disponible en este momento.';
        break;
      case 'not-found':
        msgErr = 'El documento no existe.';
        break;
      default:
        msgErr = 'Error al obtener documento. Inténtalo de nuevo más tarde.';
        break;
    }
    throw new Error(msgErr);
  }
};

// Function to add document to Firestore
const addDocument = async (db: Firestore, collectionName: string, data: any) => {
  try {
    const collectionRef = collection(db, collectionName);

    // Validate if entry already exists
    const q = query(collectionRef, where('id', '==', data.id), limit(1));
    const docSnap = await getDocs(q);

    // Check if document exists
    if (!docSnap.empty) throw { code: 'already-exists' };

    // Add document to Firestore
    await addDoc(collection(db, collectionName), data);
  } catch (err) {
    console.error(err);

    let msgErr;
    const errCode = (err as { code: string }).code;

    switch (errCode) {
      case 'permission-denied':
        msgErr = 'No tienes permiso para acceder a los documentos.';
        break;
      case 'unavailable':
        msgErr = 'El servicio no está disponible en este momento.';
        break;
      case 'not-found':
        msgErr = 'El documento no existe.';
        break;
      default:
        msgErr = 'Error al obtener documento. Inténtalo de nuevo más tarde.';
        break;
    }
    throw new Error(msgErr);
  }
};

// Function to edit document in Firestore
const editDocument = async (db: Firestore, collectionName: string, documentId: string, data: any) => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where('id', '==', documentId), limit(1));
    const docSnap = await getDocs(q);

    if (docSnap.empty) throw { code: 'not-found' };

    const docRef = docSnap.docs[0].ref;
    await updateDoc(docRef, data);
  } catch (err) {
    console.error(err);

    let msgErr;
    const errCode = (err as { code: string }).code;

    switch (errCode) {
      case 'permission-denied':
        msgErr = 'No tienes permiso para acceder a los documentos.';
        break;
      case 'unavailable':
        msgErr = 'El servicio no está disponible en este momento.';
        break;
      case 'not-found':
        msgErr = 'El documento no existe.';
        break;
      default:
        msgErr = 'Error al obtener documento. Inténtalo de nuevo más tarde.';
        break;
    }
    throw new Error(msgErr);
  }
};

// Function to delete document from Firestore
const deleteDocument = async (db: Firestore, collectionName: string, documentId: string) => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where('id', '==', documentId), limit(1));
    const docSnap = await getDocs(q);

    if (docSnap.empty) throw { code: 'not-found' };

    const docRef = docSnap.docs[0].ref;
    await deleteDoc(docRef);
  } catch (err) {
    console.error(err);

    let msgErr;
    const errCode = (err as { code: string }).code;

    switch (errCode) {
      case 'permission-denied':
        msgErr = 'No tienes permiso para acceder a los documentos.';
        break;
      case 'unavailable':
        msgErr = 'El servicio no está disponible en este momento.';
        break;
      case 'not-found':
        msgErr = 'El documento no existe.';
        break;
      default:
        msgErr = 'Error al obtener documento. Inténtalo de nuevo más tarde.';
        break;
    }
    throw new Error(msgErr);
  }
};

export { getDocument, addDocument, editDocument, deleteDocument };
