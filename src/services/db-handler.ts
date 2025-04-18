import { collection, query, where, limit, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';

// Function to get a document from Firestore
const getOneDocument = async (db: Firestore, collectionName: string, documentCode: string) => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where('code', '==', documentCode), limit(1));
    const docSnap = await getDocs(q);

    if (docSnap.empty) throw { code: 'not-found' };

    return { ...docSnap.docs[0].data(), id: docSnap.docs[0].id };
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
    }
    throw msgErr;
  }
};

// Funcoin to get all documents from a collection
const getAllDocuments = async (db: Firestore, collectionName: string) => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef);
    const docSnap = await getDocs(q);

    if (docSnap.empty) throw { code: 'not-found' };

    return docSnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
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
        msgErr = 'No hay documentos en esta colección.';
        break;
      default:
        msgErr = 'Error al obtener documento. Inténtalo de nuevo más tarde.';
    }
    throw msgErr;
  }
};

// Function to add document to Firestore
const addDocument = async (db: Firestore, collectionName: string, data: any, type:string) => {
  try {
    const collectionRef = collection(db, collectionName);

    // If true, its a individual document and have to validate
    if (type == 'individual'){
      // Validate if entry already exists
      const q = query(collectionRef, where('code', '==', data.code), limit(1));
      const docSnap = await getDocs(q);

      // Check if document exists
      if (!docSnap.empty) throw { code: 'already-exists' };
    }
    else if (type == 'group'){
       // Validate if entry already exists
       const q = query(collectionRef, where('courseCode', '==', data.courseCode), where('studentCode', '==', data.studentCode), limit(1));
       const docSnap = await getDocs(q);

       console.log(!docSnap.empty)

       // Check if document exists
       if (!docSnap.empty) throw { code: 'already-exists' };
    }

      

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
      case 'already-exists':
        msgErr = 'Ya existe un documento con este código.';
        break;
      default:
        msgErr = 'Error al obtener documento. Inténtalo de nuevo más tarde.';
    }
    throw msgErr;
  }
};

// Function to edit document in Firestore
const editDocument = async (db: Firestore, collectionName: string, documentCode: string, data: any, type:string) => {
  try {
    if (type == 'individual'){
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, where('code', '==', documentCode), limit(1));
      const docSnap = await getDocs(q);
  
      if (docSnap.empty) throw { code: 'not-found' };
  
      const docRef = docSnap.docs[0].ref;
      await updateDoc(docRef, data);
    }
    else if (type == 'group'){
      const collectionRef = collection(db, collectionName);
      console.log("esto es data",data)
      const q = query(collectionRef, where('courseCode', '==', data.courseCode), where('studentCode', '==', data.studentCode), limit(1));
      const docSnap = await getDocs(q);
      //If doesnt exist, that means that can be edited
      if (!docSnap.empty) throw { code: 'already-exists' };

      const docRef = doc(db, collectionName, data.id);
        await updateDoc(docRef, data);
    }
    
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
    }
    throw msgErr;
  }
};

// Function to delete document from Firestore
const deleteDocument = async (db: Firestore, collectionName: string, documentCode: string) => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where('code', '==', documentCode), limit(1));
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
    }
    throw msgErr;
  }
};

export { getOneDocument, getAllDocuments, addDocument, editDocument, deleteDocument };
