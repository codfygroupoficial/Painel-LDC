export const FILIAIS = [
  { id: 'jatai-go', nome: 'Jataí', cidade: 'Jataí', estado: 'GO' },
  { id: 'mineiros-go', nome: 'Mineiros', cidade: 'Mineiros', estado: 'GO' },
  { id: 'rondonopolis-mt', nome: 'Rondonópolis', cidade: 'Rondonópolis', estado: 'MT' },
]

export const nomeFilial = (id) => {
  const f = FILIAIS.find(f => f.id === id)
  return f ? (f.cidade || f.nome) : id || 'Principal'
}
