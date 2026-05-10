import { db } from "./firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

export type Sabor = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  disponivel: boolean;
  tipo: "fixo" | "rotativo";
};

export const SABORES_INICIAIS: Sabor[] = [
  {
    id: "doce-de-leite",
    nome: "Doce de Leite",
    descricao: "Recheio de doce de leite escorrendo no meio",
    preco: 12,
    disponivel: true,
    tipo: "fixo",
  },
  {
    id: "leite-ninho",
    nome: "Leite Ninho",
    descricao: "Recheio cremoso de leite em pó",
    preco: 13,
    disponivel: true,
    tipo: "rotativo",
  },
  {
    id: "nutella",
    nome: "Nutella",
    descricao: "Avelã e chocolate ao leite",
    preco: 14,
    disponivel: false,
    tipo: "rotativo",
  },
  {
    id: "kitkat",
    nome: "KitKat",
    descricao: "Wafer crocante com chocolate ao leite",
    preco: 14,
    disponivel: false,
    tipo: "rotativo",
  },
];

export async function getSabores(): Promise<Sabor[]> {
  const snap = await getDoc(doc(db, "config", "sabores"));
  if (snap.exists()) return snap.data().lista as Sabor[];
  return SABORES_INICIAIS;
}

export async function setSabores(sabores: Sabor[]): Promise<void> {
  await setDoc(doc(db, "config", "sabores"), { lista: sabores });
}

export function onSaboresChange(callback: (sabores: Sabor[]) => void) {
  return onSnapshot(doc(db, "config", "sabores"), (snap) => {
    if (snap.exists()) callback(snap.data().lista as Sabor[]);
    else callback(SABORES_INICIAIS);
  });
}
