export const FILIAIS = [
  { id: 'rondonopolis-mt', nome: 'Via Log Rondonópolis', cidade: 'Rondonópolis', estado: 'MT' },
]

export const nomeFilial = (id) => {
  const f = FILIAIS.find(f => f.id === id)
  return f ? f.nome : id || 'Principal'
}
