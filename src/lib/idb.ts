
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, writeBatch, orderBy, query, where } from 'firebase/firestore';
import { getDbInstance } from './firebase-client'; // Usa o db específico do cliente
import type { Demand, Vacation, Employee, MedicalCertificate, DemandStatus, JustifiedAbsence, DemandProgress, Card, Uniform, School } from './types';

const STORES = {
  demands: 'demands',
  vacations: 'vacations',
  justifiedAbsences: 'justifiedAbsences',
  employees: 'employees',
  certificates: 'certificates',
  demandStatuses: 'demandStatuses',
  demandProgress: 'demandProgress',
  cards: 'cards',
  uniforms: 'uniforms',
  schools: 'schools',
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

// --- Histórico de Andamento das Demandas ---
export const getDemandProgressByDemandId = async (demandId: string): Promise<DemandProgress[]> => {
  try {
    const db = getDbInstance();
    if (!db) {
      console.warn("Firestore não está disponível. Retornando array vazio.");
      return [];
    }
    
    const collRef = collection(db, STORES.demandProgress);
    
    try {
      const q = query(collRef, where('demandId', '==', demandId), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const data: DemandProgress[] = [];
      querySnapshot.forEach((doc) => {
        const progress = { ...doc.data(), id: doc.id } as DemandProgress;
        data.push(progress);
      });
      return data;
    } catch (queryError) {
      const q = query(collRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const data: DemandProgress[] = [];
      querySnapshot.forEach((doc) => {
        const progress = { ...doc.data(), id: doc.id } as DemandProgress;
        if (progress.demandId === demandId) {
          data.push(progress);
        }
      });
      return data;
    }
  } catch (error) {
    console.error(`Erro geral ao buscar progresso para demanda ${demandId}:`, error);
    return [];
  }
};

export const addDemandProgress = async (progress: Omit<DemandProgress, 'id'>) => {
  const finalProgress = { ...progress, createdBy: progress.createdBy || null };
  const newId = await add(STORES.demandProgress, finalProgress);
  return { ...finalProgress, id: newId } as DemandProgress;
};

export const updateDemandProgress = (progress: DemandProgress) => {
  const finalProgress = { ...progress, createdBy: progress.createdBy || null };
  return update(STORES.demandProgress, finalProgress);
};

export const deleteDemandProgress = (id: string) => remove(STORES.demandProgress, id);

export const getAllDemandProgress = async (): Promise<DemandProgress[]> => {
  try {
    const db = getDbInstance();
    if (!db) {
      console.warn("Firestore não está disponível. Retornando array vazio.");
      return [];
    }
    
    const collRef = collection(db, STORES.demandProgress);
    const q = query(collRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const data: DemandProgress[] = [];
    querySnapshot.forEach((doc) => {
      const progress = { ...doc.data(), id: doc.id } as DemandProgress;
      data.push(progress);
    });
    return data;
  } catch (error) {
    console.error('Erro ao buscar todo o progresso das demandas:', error);
    return [];
  }
};

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
    const dataToSave = { ...certificate };
    if (dataToSave.cid === undefined) {
      delete (dataToSave as any).cid;
    }
    const newId = await add(STORES.certificates, dataToSave);
    return { ...dataToSave, id: newId } as MedicalCertificate;
};
export const updateCertificate = (certificate: MedicalCertificate) => update(STORES.certificates, certificate);
export const deleteCertificate = (id: string) => remove(STORES.certificates, id);

// --- Cartões ---
export const getCards = () => getAll<Card>(STORES.cards, 'arrivalDate');
export const addCard = async (card: Omit<Card, 'id'>) => {
    const newId = await add(STORES.cards, card);
    return { ...card, id: newId };
};
export const updateCard = (card: Card) => update(STORES.cards, card);
export const deleteCard = (id: string) => remove(STORES.cards, id);

// --- Fardamento ---
export const getUniforms = () => getAll<Uniform>(STORES.uniforms, 'arrivalDate');
export const addUniform = async (uniform: Omit<Uniform, 'id'>) => {
    const newId = await add(STORES.uniforms, uniform);
    return { ...uniform, id: newId };
};
export const updateUniform = (uniform: Uniform) => update(STORES.uniforms, uniform);
export const deleteUniform = (id: string) => remove(STORES.uniforms, id);

// --- Colégios ---
export const getSchools = () => getAll<School>(STORES.schools, 'name');
export const addSchool = async (school: Omit<School, 'id'>) => {
    const newId = await add(STORES.schools, school);
    return { ...school, id: newId };
};
export const deleteSchool = (id: string) => remove(STORES.schools, id);

// --- Importação/Exportação ---
interface AllData {
    demands: Demand[];
    vacations: Vacation[];
    justifiedAbsences: JustifiedAbsence[];
    employees: Employee[];
    certificates: MedicalCertificate[];
    demandStatuses: DemandStatus[];
    cards: Card[];
    uniforms?: Uniform[];
    schools?: School[];
}

export async function getAllData(): Promise<AllData> {
    const [demands, vacations, justifiedAbsences, employees, certificates, demandStatuses, cards, uniforms, schools] = await Promise.all([
        getDemands(),
        getVacations(),
        getJustifiedAbsences(),
        getEmployees(),
        getCertificates(),
        getDemandStatuses(),
        getCards(),
        getUniforms(),
        getSchools(),
    ]);
    return { demands, vacations, justifiedAbsences, employees, certificates, demandStatuses, cards, uniforms, schools };
}

export async function importData(data: AllData): Promise<void> {
    const db = getDbInstance();
    if (!db) { throw new Error("Firestore não está disponível para importação."); }
    const batch = writeBatch(db);

    data.demands.forEach(item => {
        const { id, ...rest } = item;
        const docRef = doc(db, STORES.demands, id);
        batch.set(docRef, rest);
    });
    // ... rest of items
    await batch.commit();
}
