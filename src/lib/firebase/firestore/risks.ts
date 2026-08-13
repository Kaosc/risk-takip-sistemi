import { getFirestore, doc, getDoc, setDoc } from "@react-native-firebase/firestore"
import { COLLECTIONS } from "../enums"

const db = getFirestore()

// add, update, getAll, getById, delete