import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

// Diretório de usuários: usuário simples -> e-mail cadastrado no Firebase Auth.
// Aqui existe só UM usuário, compartilhado por você e pela Carol — os dois
// entram com o mesmo usuário e a mesma senha.
//
// IMPORTANTE: troque o e-mail abaixo pelo e-mail real que você vai
// cadastrar no Firebase Authentication (Passo 1 do README). Pode ser
// qualquer e-mail que vocês tenham acesso — é só pra criar a conta e,
// se um dia precisar, recuperar a senha. Se quiser, também pode trocar
// a chave "familia" por outro nome de usuário (ex: "cofre", "casa").
export const USER_DIRECTORY = {
  familia: 'teamocarol@gmail.com',
}

// Nome exibido no painel (não precisa ser o e-mail).
export const DISPLAY_NAME = 'Caique & Carol'

// Lista de e-mails autorizados a usar o painel.
// Isso é a barreira do lado do cliente (UX). A barreira real de segurança
// está nas regras do Firestore (firebase/firestore.rules), que também
// checam essa mesma lista no servidor — então mesmo que alguém adultere
// o app no navegador, não consegue ler nem escrever nada.
export const ALLOWED_EMAILS = Object.values(USER_DIRECTORY)
