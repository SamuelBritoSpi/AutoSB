





import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, writeBatch, orderBy, query } from 'firebase/firestore';
import { getDbInstance } from './firebase-client'; // Use client-specific db
import type { Demand, Vacation, Employee, MedicalCertificate, DemandStatus } from './types';

const STORES = {
  demands: 'demands',
  vacations: 'vacations',
  employees: 'employees',
  certificates: 'certificates',
  demandStatuses: 'demandStatuses',
};

// --- Generic CRUD Operations for Firestore ---

async function getAll<T>(storeName: string, orderField?: string): Promise<T[]> {
  const db = getDbInstance();
  if (!db) {
    console.warn("Firestore is not available. Returning empty array.");
    return [];
  }
  const collRef = collection(db, storeName);
  const q = orderField ? query(collRef, orderBy(orderField)) : collRef;
  const querySnapshot = await getDocs(q);
  const data: T[] = [];
  querySnapshot.forEach((doc) => {
    data.push({ ...doc.data(), id: doc.id } as T);
  });
  return data;
}

async function add<T extends object>(storeName: string, item: T): Promise<string> {
   const db = getDbInstance();
   if (!db) { throw new Error("Firestore is not available."); }
  const docRef = await addDoc(collection(db, storeName), item);
  return docRef.id;
}

async function update<T extends { id: string }>(storeName: string, item: T): Promise<void> {
   const db = getDbInstance();
   if (!db) { throw new Error("Firestore is not available."); }
  const { id, ...data } = item;
  const docRef = doc(db, storeName, id);
  await updateDoc(docRef, data);
}

async function remove(storeName: string, id: string): Promise<void> {
  const db = getDbInstance();
  if (!db) { throw new Error("Firestore is not available."); }
  await deleteDoc(doc(db, storeName, id));
}


// --- Demands ---
export const getDemands = () => getAll<Demand>(STORES.demands);
export const addDemand = async (demand: Omit<Demand, 'id'>) => {
    const finalDemand = { ...demand, ownerId: demand.ownerId || null };
    const newId = await add(STORES.demands, finalDemand);
    return { ...finalDemand, id: newId } as Demand;
};
export const updateDemand = (demand: Demand) => {
    const finalDemand = { ...demand, ownerId: demand.ownerId || null };
    return update(STORES.demands, finalDemand);
};
export const deleteDemand = (id: string) => remove(STORES.demands, id);

// --- Demand Statuses ---
export const getDemandStatuses = () => getAll<DemandStatus>(STORES.demandStatuses, 'order');
export const addDemandStatus = async (status: Omit<DemandStatus, 'id'>): Promise<DemandStatus> => {
    const newId = await add(STORES.demandStatuses, status);
    return { ...status, id: newId };
};
export const updateDemandStatus = (status: DemandStatus) => update(STORES.demandStatuses, status);
export const deleteDemandStatus = (id: string) => remove(STORES.demandStatuses, id);


// --- Vacations ---
export const getVacations = () => getAll<Vacation>(STORES.vacations);
export const addVacation = async (vacation: Omit<Vacation, 'id'>) => {
    const newId = await add(STORES.vacations, vacation);
    return { ...vacation, id: newId };
};
export const updateVacation = (vacation: Vacation) => update(STORES.vacations, vacation);
export const deleteVacation = (id: string) => remove(STORES.vacations, id);

// --- Employees ---
export const getEmployees = () => getAll<Employee>(STORES.employees);
export const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    const newId = await add(STORES.employees, employee);
    return { ...employee, id: newId };
};
export const updateEmployee = (employee: Employee) => update(STORES.employees, employee);
export const deleteEmployee = (id: string) => remove(STORES.employees, id);

// --- Medical Certificates ---
export const getCertificates = () => getAll<MedicalCertificate>(STORES.certificates);
export const addCertificate = async (certificate: Omit<MedicalCertificate, 'id'>) => {
    const newId = await add(STORES.certificates, certificate);
    return { ...certificate, id: newId };
};
export const updateCertificate = (certificate: MedicalCertificate) => update(STORES.certificates, certificate);
export const deleteCertificate = (id: string) => remove(STORES.certificates, id);


// --- Import/Export (Now for migration purposes if needed, not regular backup) ---
interface AllData {
    demands: Demand[];
    vacations: Vacation[];
    employees: Employee[];
    certificates: MedicalCertificate[];
    demandStatuses: DemandStatus[];
}

export async function getAllData(): Promise<AllData> {
    const [demands, vacations, employees, certificates, demandStatuses] = await Promise.all([
        getDemands(),
        getVacations(),
        getEmployees(),
        getCertificates(),
        getDemandStatuses(),
    ]);
    return { demands, vacations, employees, certificates, demandStatuses };
}

// This function can be used to migrate data from a JSON backup to Firestore.
export async function importData(data: AllData): Promise<void> {
    const db = getDbInstance();
    if (!db) { throw new Error("Firestore is not available for import."); }
    const batch = writeBatch(db);

    // Note: This doesn't clear old data by default, it just adds/overwrites.
    // A more robust migration would handle deletions or clearing collections.

    data.demands.forEach(item => {
        const { id, ...rest } = item;
        const docRef = doc(db, STORES.demands, id);
        batch.set(docRef, rest);
    });
    data.vacations.forEach(item => {
        const { id, ...rest } = item;
        const docRef = doc(db, STORES.vacations, id);
        batch.set(docRef, rest);
    });
    data.employees.forEach(item => {
        const { id, ...rest } = item;
        const docRef = doc(db, STORES.employees, id);
        batch.set(docRef, rest);
    });
    data.certificates.forEach(item => {
        const { id, ...rest } = item;
        // @ts-ignore - this is for migration from old format
        const { fileDataUri, ...certRest } = rest; 
        const docRef = doc(db, STORES.certificates, id);
        batch.set(docRef, certRest);
    });
     data.demandStatuses.forEach(item => {
        const { id, ...rest } = item;
        const docRef = doc(db, STORES.demandStatuses, id);
        batch.set(docRef, rest);
    });


    await batch.commit();
}

    
