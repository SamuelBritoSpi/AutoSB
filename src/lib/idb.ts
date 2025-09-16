
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, writeBatch, orderBy, query } from 'firebase/firestore';
import { getDbInstance } from './firebase-client'; // Usa o db específico do cliente
import type { Demand, Vacation, Employee, MedicalCertificate, DemandStatus, JustifiedAbsence } from './types';

const STORES = {
  demands: 'demands',
  vacations: 'vacations',
  justifiedAbsences: 'justifiedAbsences',
  employees: 'employees',
  certificates: 'certificates',
  demandStatuses: 'demandStatuses',
};

// --- Operações CRUD Genéricas para o Firestore ---

async function getAll<T>(storeName: string, orderField?: string): Promise<T[]> {
  const db = getDbInstance();
  if (!db) {
    console.warn("Firestore não está disponível. Retornando array vazio.");
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
   if (!db) { throw new Error("Firestore não está disponível."); }
  const docRef = await addDoc(collection(db, storeName), item);
  return docRef.id;
}

async function update<T extends { id: string }>(storeName: string, item: T): Promise<void> {
   const db = getDbInstance();
   if (!db) { throw new Error("Firestore não está disponível."); }
  const { id, ...data } = item;
  const docRef = doc(db, storeName, id);
  await updateDoc(docRef, data);
}

async function remove(storeName: string, id: string): Promise<void> {
  const db = getDbInstance();
  if (!db) { throw new Error("Firestore não está disponível."); }
  await deleteDoc(doc(db, storeName, id));
}


// --- Demandas ---
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

// --- Status de Demanda ---
export const getDemandStatuses = () => getAll<DemandStatus>(STORES.demandStatuses, 'order');
export const addDemandStatus = async (status: Omit<DemandStatus, 'id'>): Promise<DemandStatus> => {
    const newId = await add(STORES.demandStatuses, status);
    return { ...status, id: newId };
};
export const updateDemandStatus = (status: DemandStatus) => update(STORES.demandStatuses, status);
export const deleteDemandStatus = (id: string) => remove(STORES.demandStatuses, id);


// --- Férias ---
export const getVacations = () => getAll<Vacation>(STORES.vacations);
export const addVacation = async (vacation: Omit<Vacation, 'id'>) => {
    const newId = await add(STORES.vacations, vacation);
    return { ...vacation, id: newId };
};
export const updateVacation = (vacation: Vacation) => update(STORES.vacations, vacation);
export const deleteVacation = (id: string) => remove(STORES.vacations, id);

// --- Faltas Justificadas ---
export const getJustifiedAbsences = () => getAll<JustifiedAbsence>(STORES.justifiedAbsences);
export const addJustifiedAbsence = async (absence: Omit<JustifiedAbsence, 'id'>) => {
    const newId = await add(STORES.justifiedAbsences, absence);
    return { ...absence, id: newId };
};
export const updateJustifiedAbsence = (absence: JustifiedAbsence) => update(STORES.justifiedAbsences, absence);
export const deleteJustifiedAbsence = (id: string) => remove(STORES.justifiedAbsences, id);

// --- Funcionários ---
export const getEmployees = () => getAll<Employee>(STORES.employees);
export const addEmployee = async (employee: Omit<Employee, 'id'>) => {
    const newId = await add(STORES.employees, employee);
    return { ...employee, id: newId };
};
export const updateEmployee = (employee: Employee) => update(STORES.employees, employee);
export const deleteEmployee = (id: string) => remove(STORES.employees, id);

// --- Atestados Médicos ---
export const getCertificates = () => getAll<MedicalCertificate>(STORES.certificates);
export const addCertificate = async (certificate: Omit<MedicalCertificate, 'id'>) => {
    // Garante que `cid` não seja undefined antes de enviar para o Firestore
    const dataToSave = { ...certificate };
    if (dataToSave.cid === undefined) {
      delete (dataToSave as any).cid;
    }
    const newId = await add(STORES.certificates, dataToSave);
    return { ...dataToSave, id: newId } as MedicalCertificate;
};
export const updateCertificate = (certificate: MedicalCertificate) => update(STORES.certificates, certificate);
export const deleteCertificate = (id: string) => remove(STORES.certificates, id);


// --- Importação/Exportação (Agora para fins de migração, se necessário, não para backup regular) ---
interface AllData {
    demands: Demand[];
    vacations: Vacation[];
    justifiedAbsences: JustifiedAbsence[];
    employees: Employee[];
    certificates: MedicalCertificate[];
    demandStatuses: DemandStatus[];
}

export async function getAllData(): Promise<AllData> {
    const [demands, vacations, justifiedAbsences, employees, certificates, demandStatuses] = await Promise.all([
        getDemands(),
        getVacations(),
        getJustifiedAbsences(),
        getEmployees(),
        getCertificates(),
        getDemandStatuses(),
    ]);
    return { demands, vacations, justifiedAbsences, employees, certificates, demandStatuses };
}

// Esta função pode ser usada para migrar dados de um backup JSON para o Firestore.
export async function importData(data: AllData): Promise<void> {
    const db = getDbInstance();
    if (!db) { throw new Error("Firestore não está disponível para importação."); }
    const batch = writeBatch(db);

    // Nota: Isso não limpa dados antigos por padrão, apenas adiciona/sobrescreve.
    // Uma migração mais robusta lidaria com exclusões ou limpeza de coleções.

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
    data.justifiedAbsences.forEach(item => {
        const { id, ...rest } = item;
        const docRef = doc(db, STORES.justifiedAbsences, id);
        batch.set(docRef, rest);
    });
    data.employees.forEach(item => {
        const { id, ...rest } = item;
        const docRef = doc(db, STORES.employees, id);
        batch.set(docRef, rest);
    });
    data.certificates.forEach(item => {
        const { id, ...rest } = item;
        // @ts-ignore - isso é para migração do formato antigo
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
