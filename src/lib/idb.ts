
import type { Demand, Vacation, Employee, MedicalCertificate } from './types';

const DB_NAME = 'AutoSB-DB';
const DB_VERSION = 1;
const STORES = {
  demands: 'demands',
  vacations: 'vacations',
  employees: 'employees',
  certificates: 'certificates',
};

let db: IDBDatabase | null = null;

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORES.demands)) {
        dbInstance.createObjectStore(STORES.demands, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(STORES.vacations)) {
        dbInstance.createObjectStore(STORES.vacations, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(STORES.employees)) {
        dbInstance.createObjectStore(STORES.employees, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(STORES.certificates)) {
        const certificateStore = dbInstance.createObjectStore(STORES.certificates, { keyPath: 'id' });
        certificateStore.createIndex('employeeId', 'employeeId', { unique: false });
      }
    };
  });
}

async function getStore(storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
  const db = await initDB();
  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
}

// --- Generic CRUD Operations ---

async function getAll<T>(storeName: string): Promise<T[]> {
  const store = await getStore(storeName, 'readonly');
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function add<T>(storeName: string, item: T): Promise<void> {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.add(item);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function update<T>(storeName: string, item: T): Promise<void> {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.put(item);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function remove(storeName: string, id: string): Promise<void> {
  const store = await getStore(storeName, 'readwrite');
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// --- Demands ---
export const getDemands = () => getAll<Demand>(STORES.demands);
export const addDemand = (demand: Demand) => add(STORES.demands, demand);
export const updateDemand = (demand: Demand) => update(STORES.demands, demand);
export const deleteDemand = (id: string) => remove(STORES.demands, id);

// --- Vacations ---
export const getVacations = () => getAll<Vacation>(STORES.vacations);
export const addVacation = (vacation: Vacation) => add(STORES.vacations, vacation);
export const updateVacation = (vacation: Vacation) => update(STORES.vacations, vacation);
export const deleteVacation = (id: string) => remove(STORES.vacations, id);

// --- Employees ---
export const getEmployees = () => getAll<Employee>(STORES.employees);
export const addEmployee = (employee: Employee) => add(STORES.employees, employee);
export const updateEmployee = (employee: Employee) => update(STORES.employees, employee);
export const deleteEmployee = (id: string) => remove(STORES.employees, id);

// --- Medical Certificates ---
export const getCertificates = () => getAll<MedicalCertificate>(STORES.certificates);
export const addCertificate = (certificate: MedicalCertificate) => add(STORES.certificates, certificate);
export const updateCertificate = (certificate: MedicalCertificate) => update(STORES.certificates, certificate);
export const deleteCertificate = (id: string) => remove(STORES.certificates, id);
