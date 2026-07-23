import { createContext, useContext, useState } from 'react'

export const ACTORS = { caique: 'Caique', carol: 'Carol' }

const ActorContext = createContext(null)

export function ActorProvider({ children }) {
  const [actor, setActorState] = useState(() => sessionStorage.getItem('actor') || null)

  function setActor(id) {
    sessionStorage.setItem('actor', id)
    setActorState(id)
  }

  function clearActor() {
    sessionStorage.removeItem('actor')
    setActorState(null)
  }

  return (
    <ActorContext.Provider
      value={{ actor, actorName: actor ? ACTORS[actor] : null, setActor, clearActor }}
    >
      {children}
    </ActorContext.Provider>
  )
}

export function useActor() {
  return useContext(ActorContext)
}
